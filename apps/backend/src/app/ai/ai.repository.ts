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
  // A persona gives the AI a frame of reference for its analysis.
  const persona = `You are an expert and insightful Engineering Manager. Your goal is to analyze development metrics to uncover meaningful patterns about performance, collaboration, and code quality. You look beyond the surface numbers to provide a balanced and actionable perspective.`;

  // Core objective is more direct and focused on "insights" rather than just "analysis".
  const baseInstructions =
    type === 'summary'
      ? `Based on your persona, write a concise performance insight summary in Hebrew for the ${context}.
Your summary must:
1. Synthesize the provided data into a cohesive narrative of 5-6 sentences.
2. Go beyond listing data; identify underlying trends, strengths, and potential areas for attention.
3. Formulate hypotheses by correlating different metrics (e.g., how do 'Pull Requests' relate to 'Story Points'?).
4. Conclude with a balanced view. Avoid overly positive or negative tones.
Do not use bullet points; write a flowing paragraph.`
      : type === 'recommendation'
      ? `Based on your persona and the provided data, give one or two forward-looking recommendations in Hebrew for the manager or ${context}. Focus only on actionable advice. Use phrasing like "כדי לשפר את היעילות, מומלץ לבחון את..." or "לאור ההתמקדות במשימות מסוג X, כדאי לשקול...".`
      : `Based on your persona and the provided data, answer the following question in Hebrew: "${question}". Provide a direct answer synthesized from the data, not a summary of it.`;

  // THIS IS THE MOST CRITICAL NEW SECTION. It teaches the AI HOW to think.
  const interpretationPrinciples = `
## Key Interpretation Principles (Your analytical framework):
- Your primary goal is to **correlate metrics**. An insight comes from connecting two or more data points. A single metric in isolation is often meaningless.
- **Pull Requests (PRs) vs. Story Points/Issues:** A high number of PRs for a low number of Story Points might suggest small, incremental changes (good) or inefficient work needing many fixes (bad). A low number of PRs for high Story Points suggests work on large, complex features.
- **Code Review Comments (averageCommentsUserGotPerPR):** This is a nuanced metric.
    - **A LOW number of comments** is ambiguous. It could mean **(a)** very high-quality code that needs no correction, **(b)** simple tasks, OR **(c)** a superficial or rushed review process where teammates don't comment enough. Your analysis should acknowledge this ambiguity.
    - **A HIGH number of comments** could mean **(a)** complex code, **(b)** unclear initial code quality, OR **(c)** a healthy and thorough review culture.
- **Lines Added vs. Lines Deleted:** High 'Lines Deleted' is not negative. It often indicates positive activities like **refactoring** and code cleanup, which improves long-term health.
- **Code Reviews vs. Comments:** A high number of 'Code Reviews' but a low number of 'Comments' made might indicate "rubber-stamping" (approving PRs without deep analysis).
- **Bugs vs. Tasks:** A high ratio of 'Bugs' to 'Tasks' could suggest quality issues in previous sprints or a focus on stabilization. A low ratio suggests a focus on new feature development.
`;

  const displayNames = `
## Display Names:
Use these exact English phrases for fields in your Hebrew response:
- pullRequests → Pull Requests
- codeReviews → Code Reviews
- averageCommentsUserGotPerPR → Average Comments per PR
- commits → Commits
- fileChanges.additions → Lines Added
- fileChanges.deletions → Lines Deleted
- comments → Comments Made
- issuesCompleted → Issues Completed
- averageIssueTime → Average Issue Time
- totalStoryPoints → Story Points
- issueTypes.Task → Tasks
- issueTypes.Bug → Bugs
`;

  return `
${persona}

${baseInstructions}

${interpretationPrinciples}

${displayNames}

## Critical Output Instructions:
- **Language and Formatting:** The entire output must be a single valid JSON object with one key, "text", containing the full response as a Hebrew string.
- **Referring to Data:** When you mention a metric, use its English display name (e.g., "Pull Requests").
- **Grounded Analysis:** Base all conclusions strictly on the provided data and the interpretation principles. Do not invent data or assume context not present. If data is missing, note that a full picture is not possible.

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
        data: question.data as UserInfo,
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
