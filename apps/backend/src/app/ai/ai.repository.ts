import { Inject, Injectable } from '@nestjs/common';
import { UserInfo } from './types/user-info.type';
import * as geminiConfig from '../../config/gemini-config';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface MergeRequest {
  title: string | undefined;
  owner: string | undefined;
  createdAt: string;
  mergedAt: string;
}

interface JiraIssue {
  assignee: string;
  sprint?: number;
  id: string;
  name: string;
}

@Injectable()
export class AiRepository {
  constructor(
    @Inject(geminiConfig.geminiConfig.KEY)
    private readonly geminiConfigValues: geminiConfig.GeminiConfigType
  ) {}

  genAI = new GoogleGenerativeAI(this.geminiConfigValues.geminiKey ?? '');
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async getWorkerRecommendation(userInfo: UserInfo): Promise<string> {
    const promt = `Give your recommendation and summery in the hebrew language about a worker that have done ${userInfo.amountOfUserStories} Suser stories, and ${userInfo.amountOfCommentsPerReview} comments per review, and ${userInfo.numberOfReviews} reviews. please respond with a json object contains one field called text, which will contain the recommandation`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }

  async getRelatedMergeRequestTitle(
    mergeRequests: MergeRequest[],
    jiraIssues: JiraIssue[]
  ): Promise<any[] | undefined> {
    // 1. Prepare simplified data for the LLM prompt
    const simplifiedMergeRequests = mergeRequests.map((mr) => mr.title);
    const simplifiedJiraIssues = jiraIssues.map((issue) => ({
      id: issue.id,
      name: issue.name,
    }));

    // 2. Construct the detailed prompt for the LLM
    const prompt = `Given a list of merge request titles and a list of Jira issue names with their IDs, your task is to find the most closely related Jira issue for each merge request based on text similarity.

**Matching Criteria & Logic:**

1.  **Text Normalization:**
    * Convert both merge request titles and Jira issue names to **lowercase**.
    * **Remove common Git commit prefixes** (e.g., \`feat:\`, \`fix:\`, \`refactor:\`, \`docs:\`, \`build:\`, \`ci:\`, \`perf:\`, \`chore:\`, \`test:\`, \`merge:\`, \`revert:\`).
    * Remove any content within **parentheses** and **trailing ellipses** (\`...\`).
    * Remove common **stopwords** (e.g., \`and\`, \`or\`, \`the\`, \`a\`, \`an\`, \`to\`, \`for\`, \`with\`, \`in\`, \`on\`, \`at\`, \`by\`, \`from\`, \`of\`, \`is\`, \`are\`, \`was\`, \`were\`, \`add\`, \`implement\`, \`module\`, \`component\`, \`page\`, \`data\`, \`handle\`, \`handling\`, \`integrate\`, \`integration\`, \`features\`, \`enhance\`, \`remove\`, \`unused\`, \`cron\`, \`style\`, \`but\`, \`fix\`, \`finish\`, \`show\`, \`display\`, \`get\`, \`support\`, \`multiple\`, \`client\`, \`server\`, \`db\`, \`database\`, \`connect\`, \`connection\`, \`basic\`, \`insights\`, \`worker\`, \`team\`, \`management\`, \`change\`, \`names\`, \`stats\`, \`statistics\`, \`register\`, \`password\`, \`queries\`, \`projectid\`, \`uses\`, \`id\`, \`param\`, \`selection\`, \`settings\`, \`middleware\`, \`button\`, \`refresh\`, \`token\`, \`store\`, \`local\`, \`storage\`, \`username\`, \`jwt\`, \`organize\`, \`code\`, \`adding\`, \`users\`, \`module\`, \`connecting\`, \`github\`, \`saving\`, \`access\`, \`token\`, \`prisma\`, \`schema\`, \`initial\`, \`migration\`, \`permissions\`, \`caching\`, \`nestjs\`, \`cache-manager\`, \`improved\`, \`performance\`, \`pr\`, \`sprint\`, \`more\`, \`only\`, \`owner\`, \`can\`, \`excess\`, \`project\`, \`projects\`, \`jira\`, \`github\`).
    * Clean up extra spaces.
    * Tokenize the cleaned text into individual words.

2.  **Similarity Metric:**
    * Calculate the **Jaccard similarity** between the set of words from the normalized merge request title and the set of words from the normalized Jira issue name. The formula is: \`(size of intersection of word sets) / (size of union of word sets)\`.

3.  **Best Match Selection:**
    * For each merge request title, identify the *single* Jira issue ID that yields the **highest Jaccard similarity score**.

4.  **Match Threshold:**
    * Only include a match in the final output if the Jaccard similarity score is **greater than \`0.0\`**.

**Input Data (Simplified):**

**Merge Request Titles:**
${JSON.stringify(simplifiedMergeRequests, null, 2)}

**Jira Issues (Names and IDs only):**
${JSON.stringify(simplifiedJiraIssues, null, 2)}

**Desired Output Format:**

Respond with a JSON object containing one field called 'text'. This 'text' field should contain an **array of objects**. Each object in this array must contain two fields: \`mergeRequestTitle\` (the original title of the merge request) and \`jiraIssueId\` (the ID of the best-matched Jira issue). Only include matches that meet the threshold.

**Example Output Structure:**

\`\`\`json
{
  "text": [
    {
      "mergeRequestTitle": "feat: improve GitHub stats",
      "jiraIssueId": "10323"
    },
    {
      "mergeRequestTitle": "feat finish github integration",
      "jiraIssueId": "10324"
    }
  ]
}
\`\`\`
`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      // Parse the LLM's response
      const llmMatches: { mergeRequestTitle: string; jiraIssueId: string }[] =
        JSON.parse(result.response.text()).text;

      const finalMatchedResults = [];

      // Create maps for efficient lookup of original objects
      const mrMap = new Map<string, MergeRequest>();
      mergeRequests.forEach((mr) => {
        if (mr.title) {
          mrMap.set(mr.title, mr);
        }
      });

      const jiraMap = new Map<string, JiraIssue>();
      jiraIssues.forEach((issue) => {
        jiraMap.set(issue.id, issue);
      });

      for (const match of llmMatches) {
        const originalMr = mrMap.get(match.mergeRequestTitle);
        const originalJira = jiraMap.get(match.jiraIssueId);

        if (originalMr && originalJira) {
          finalMatchedResults.push({
            ...originalMr,
            ...originalJira,
          });
        } else {
          console.warn(
            `Could not find original MR or Jira issue for match:`,
            match
          );
        }
      }

      return finalMatchedResults.filter(
        (result) =>
          result.assignee.toLowerCase().substring(0, 2) ===
          result.owner?.toLowerCase().substring(0, 2)
      );
    } catch (error) {
      console.error('Error calling Gemini API or parsing response:', error);
      return undefined; // Or throw the error, depending on your error handling strategy
    }
  }
}
