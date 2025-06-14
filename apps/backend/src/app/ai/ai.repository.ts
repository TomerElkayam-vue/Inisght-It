import { Inject, Injectable } from '@nestjs/common';
import { UserInfo } from './types/user-info.type';
import * as geminiConfig from '../../config/gemini-config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuestionDTO } from './dto/question.class';

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

const generatePrompt = ({
  context,
  type,
  question,
  data,
}: {
  context: 'worker' | 'team';
  type: 'summary' | 'recommendation' | 'question';
  question?: string;
  data: UserInfo;
}): string => {
  const baseInstructions =
    type === 'summary'
      ? `Provide a detailed performance summary in Hebrew for the following ${context} data.`
      : type === 'recommendation'
      ? `Based on the following ${context} data, provide a forward-looking recommendation in Hebrew for the manager or the ${context} itself. Do NOT summarize the data or describe what it shows. Focus only on suggesting actions or directions, using phrasing like "מומלץ להתמקד ב..." or "נראה שרוב העבודה היא בתחום X ולכן כדאי...".`
      : `Answer the following question in Hebrew based on the provided ${context} data.
DO NOT simply repeat or summarize the data fields.
Instead, ONLY answer the question`;

  return `
${baseInstructions}
CRITICAL INSTRUCTIONS:
- Never translate, explain, or modify field names. They must appear in English, exactly as-is, in the Hebrew text. Keep names like "pullRequests", "fileChanges", "commits", etc. EXACTLY as they appear.
- The Hebrew text should refer to those fields using their original English names.
- Do not invent or assume data. If some fields are empty or null, simply omit them from your reasoning.
- Limit the result to five balanced, neutral sentences.
- For the metric "averageCommentsPerPR", interpret high values as potentially indicating unclear code or room for code quality improvement. Do not describe the metric directly.
- Return a valid JSON object with a single field called "text", containing the full Hebrew response as a string.

=== BEGIN DATA ===
${JSON.stringify(data, null, 2)}
=== END DATA ===`;
};

@Injectable()
export class AiRepository {
  private async callModel(prompt: string): Promise<string> {
    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    return JSON.parse(result.response.text()).text;
  }

  constructor(
    @Inject(geminiConfig.geminiConfig.KEY)
    private readonly geminiConfigValues: geminiConfig.GeminiConfigType
  ) {}

  genAI = new GoogleGenerativeAI(this.geminiConfigValues.geminiKey ?? '');
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async getWorkerRecommendation(userInfo: UserInfo): Promise<string> {
    return this.callModel(
      generatePrompt({
        context: 'worker',
        type: 'recommendation',
        data: userInfo,
      })
    );
  }

  async getTeamRecommendation(userInfo: UserInfo): Promise<string> {
    return this.callModel(
      generatePrompt({
        context: 'team',
        type: 'recommendation',
        data: userInfo,
      })
    );
  }

  async getWorkerSummary(userInfo: UserInfo): Promise<string> {
    const generated = this.callModel(
      generatePrompt({ context: 'worker', type: 'summary', data: userInfo })
    );
    console.log('userInfo', userInfo);
    console.log('ai data', generated);

    return generated;
  }

  async getTeamSummary(userInfo: UserInfo): Promise<string> {
    return this.callModel(
      generatePrompt({ context: 'team', type: 'summary', data: userInfo })
    );
  }

  async getQuestionAnswer(question: QuestionDTO): Promise<string> {
    const generated = this.callModel(
      generatePrompt({
        context: question.type === 'worker' ? 'worker' : 'team',
        type: 'question',
        question: question.question,
        data: question.metrics as UserInfo,
      })
    );
    console.log('generated', generated);
    return generated;
  }

  async getArrayMatchingRecord(
    firstArray: string[],
    secondArray: string[]
  ): Promise<Record<string, string> | undefined> {
    const prompt = `Given two arrays, 'firstArray' and 'secondArray', find the best matching element from 'secondArray' for each element in 'firstArray'. If no suitable match is found, return 'null' for that element. Return the result as a JSON object where keys are elements from 'firstArray' and values are their corresponding matches from 'secondArray'.
  
    First Array: ${JSON.stringify(firstArray)}
    Second Array: ${JSON.stringify(secondArray)}`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = result.response.text();
      const parsedResponse = JSON.parse(responseText);

      return parsedResponse;
    } catch (error) {
      console.error('Error generating array matching record:', error);
      return undefined;
    }
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
