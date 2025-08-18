import { Inject, Injectable } from '@nestjs/common';
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
  private monthlyBudget = 20;
  private estimatedCost = 0;
  private modelPrice = { input: 0.1, output: 0.4 };

  constructor(
    @Inject(geminiConfig.geminiConfig.KEY)
    private readonly geminiConfigValues: geminiConfig.GeminiConfigType
  ) {}

  genAI = new GoogleGenerativeAI(this.geminiConfigValues.geminiKey ?? '');
  model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  private async safeCallModel(
    tokens: { input: number; output: number },
    prompt: string
  ): Promise<string> {
    const callCost =
      (tokens.input * this.modelPrice.input) / 1_000_000 +
      (tokens.output * this.modelPrice.output) / 1_000_000;

    if (this.estimatedCost + callCost > this.monthlyBudget) {
      console.warn('Monthly budget exceeded, skipping AI call.');
      return 'There was a problem with the AI service.';
    }

    this.estimatedCost += callCost;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });


    return JSON.parse(result.response.text()).text;
  }

  private estimateTokens(prompt: string): { input: number; output: number } {
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = 100;
    return { input: inputTokens, output: outputTokens };
  }

  private async callModel(prompt: string): Promise<string> {
    const tokens = this.estimateTokens(prompt);
    return this.safeCallModel(tokens, prompt);
  }

  async getWorkerRecommendation(info: any): Promise<string> {
    const prompt = `You are a development team manager AI assistant. You are given detailed data for a single employee in a software development team.
    When generating the content, consider that the company has both male and female employees. Ensure that the wording is gender-inclusive or neutral so that it appropriately addresses all employees

Your task is to generate a *Recommendations* section of the employee’s profile page.  
The output must be written in **Hebrew** and concise (4-5 sentences total). 
Use the following structure with bold section titles and line breaks (\\n):

*text*  
**המלצות כלליות** – Actionable advice on improving the employee’s productivity, collaboration, or skill growth. Focus on both strengths and areas for improvement.
**אזורי מיקוד** – Suggest specific types of tasks or skills the employee should prioritize or diversify.
**תכנון קריירה ופיתוח אישי** – Recommend career or personal development goals, such as promotion, mentoring, training, or performance improvement.
**הזדמנויות לצמיחה**– Identify 1–2 areas for improvement and propose concrete steps the manager can take to support the employee’s development.



Requirements:  
- Use '\\n' for readability.  
- Write in **plain Hebrew**.
- Follow exactly the phrasing style of the example
-Always use gender-neutral or gender-inclusive phrasing for all employees. For example, instead of saying ravid מוביל, write ravid מוביל.ה to reflect that employees may be of any gender.
-Keep all usernames exactly as they appear in the data
- The entire output must be a single valid JSON object with one key, "text"

Example Output:
המלצות כלליות – רון הוא חבר צוות התורם רבות לאיכות הקוד דרך ביצוע מספר רב של סקירות קוד (code reviews) מפורטות, אך נראה שתפוקת הפיתוח האישית שלו נמוכה יחסית. מומלץ למצוא איזון נכון בין השקעה בסקירת קוד של אחרים לבין קידום משימות הפיתוח האישיות
אזורי מיקוד –  על פי הנתונים, רון מתמקד כמעט באופן בלעדי בטיפול בבאגים. חשוב לגוון את סוג המשימות שהוא מבצע ולשלב אותו יותר במשימות פיתוח (Tasks) של פיצ'רים חדשים כדי להרחיב את יכולותיו
תכנון קריירה ופיתוח אישי – העובד ב10% הנמוכים של הצוות מבחינת ביצועים, כדאי לשקף לו את זה ולחשוב על המשך תפקידו בחברה
הזדמנויות לצמיחה –  כדי לתמוך בצמיחתו, אפשר לשבץ את רון באופן יזום במשימות פיתוח מורכבות יותר, אולי בציוות עם מפתח בכיר. בנוסף, יש לקבוע יחד איתו יעד כמותי למשימות פיתוח שישלים בכל ספרינט, כדי להבטיח איזון טוב יותר במשימותיו

data: ${JSON.stringify(info)}
`;
    const result = await this.callModel(prompt);
    return result;
  }

  async getTeamRecommendation(info: any): Promise<string> {
    const prompt = `
    You are a development team manager AI assistant. You are given detailed data for a software development team.

Your task is to generate a Summary section of the team’s profile page.
The output must be written in Hebrew and concise (5-6 sentences total).
Use the following structure with bold section titles and line breaks (\n):

Summary
**סיכום כללי** – a short sentence about overall team performance.
השוואה בין ספרינטים של הצוות ביחס לעצמו – a short sentence about performance changes across sprints.
**חוזקות וחולשות** – a short sentence about team strengths/weaknesses.
**נתונים יוצאי דופן** – a short sentence about unusual data in the team.
**מאזן הכוחות בצוות** – a short sentence describing which team members are strong in which areas, which members are involved in the most tasks and code reviews, and who provides more comments, etc.
**זמנים** – a short sentence about on-time vs delayed tasks across the team.
**תמונת מצב** – a short sentence providing a snapshot that helps the manager understand whether the team is improving over time in productivity and task quality.

Requirements:  
- Use '\\n' for readability.  
- Write in **plain Hebrew**.
- Follow exactly the phrasing style of the example
-Always use gender-neutral or gender-inclusive phrasing for all employees. For example, instead of saying ravid מוביל, write ravid מוביל.ה to reflect that employees may be of any gender.
-Keep all usernames exactly as they appear in the data
- The entire output must be a single valid JSON object with one key, "text"

Example Output:
**סיכום כללי** – הצוות מציג ביצועים יציבים עם עלייה הדרגתית בפרודוקטיביות ובמסירת משימות בזמן.
השוואה בין ספרינטים של הצוות ביחס לעצמו – לאורך ארבעת הספרינטים נרשמת עלייה במספר ה‑pull requests, commits ו‑story points שהושלמו, לצד שיפור בזמני פתרון המשימות.
**חוזקות וחולשות** – הצוות חזק בביצוע code reviews ובשיתוף פעולה, אך חלק מהחברים משתתפים פחות בפרויקטים מסוימים ועומסים אינם שווים בין כולם.
**נתונים יוצאי דופן** – ראוי לציין את ravid ו‑ron שהצטיינו במספר pull requests ו‑comments, כמו גם זמנים יוצאי דופן של noam בהשלמת משימות.
**מאזן הכוחות בצוות** – ravid מוביל.ה בביצועים ובמסירת משימות, ron מצטיין.ת בביקורות קוד ובמתן feedback, bob ו‑alice חזקים בביצוע משימות רבות, בעוד noam מעורב.ת פחות ומספק.ת פחות comments.
**זמנים** – רוב המשימות נמסרות בזמן, עם חריגים בולטים של noam שמוציא.ה את המשימות באיטיות יחסית.
**תמונת מצב** – הצוות משתפר לאורך זמן הן בפרודוקטיביות והן באיכות המשימות, עם פוטנציאל שיפור בשוויון עומסים והגברת מעורבות של חברי צוות מעורבים פחות.

data: ${JSON.stringify(info)}
`;
    return await this.callModel(prompt);
  }

  async getWorkerSummary(info: any): Promise<string> {
    const prompt = `You are a development team manager AI assistant. You are given detailed data for a single employee in a software development team.
When generating the content, consider that the company has both male and female employees. Ensure that the wording is gender-inclusive or neutral so that it appropriately addresses all employees

Your task is to generate a *Summary* section of the employee’s profile page.  
The output must be written in **Hebrew** and concise (5-6 sentences total).  
Use the following structure with bold section titles and line breaks (\\n):

*text*  
**סיכום כללי** – a short sentence about overall performance.  
**השוואה בין עובדים** – a short sentence comparing employee vs team (positive/negative outliers).  
**השוואה בין ספרינטים של העובד ביחס לעצמו** – a short sentence about performance changes across sprints.  
**חוזקות וחולשות** – a short sentence about strengths/weaknesses.  
**נתונים יוצאי דופן** – a short sentence about unusual data.  
**זמנים** – a short sentence about on-time vs delayed tasks.


Requirements:  
- Use '\\n' for readability.  
- Write in **plain Hebrew**.
- Follow exactly the phrasing style of the example.
- Always use gender-neutral or gender-inclusive phrasing for all employees. For example, instead of saying ravid מוביל, write ravid מוביל.ה to reflect that employees may be of any gender.
- Keep all usernames exactly as they appear in the data.
- The entire output must be a single valid JSON object with one key, "text"

Example Output:
סיכום כללי 
העובד כתב הערות על מספר גבוהה של Pull Requests, אך מספר המשימות שהושלמו בזמן נמוך מהממוצע בצוות
השוואה בין עובדים
הוא בולט בתיקוני באגים אך מעט מאחור בהשלמת User Stories לעומת חברי הצוות האחרים
השוואה בין ספרינטים של העובד ביחס לעצמו 
בספרינט 4 העובד ביצע 10% מכמות הUser Stories שהוא עשה בשאר הספרינטים 
חוזקות וחולשות 
חוזק בולט הוא פתרון באגים ושיתופי פעולה, בדגש על מעבר על Pull Requests, חולשה בולטת היא ניהול זמן ועמידה בזמנים
נתונים יוצאי דופן 
מספר גבוה של הערות שהעובד מקבל
זמנים 
אחוז משימות שהושלמו באיחור גבוה מהממוצע

data: ${JSON.stringify(info)}
`;
    const result = await this.callModel(prompt);
    return result;
  }

  async getTeamSummary(info: any): Promise<string> {
    const prompt = `
    You are a development team manager AI assistant. You are given detailed data for a software development team.


Your task is to generate a Recommendations section of the team’s profile page.
 The output must be written in Hebrew and concise (8-11 sentences total).
 Use the following structure with bold section titles and line breaks (\\n):
**המלצות כלליות** – Actionable advice on improving the team’s productivity, collaboration, or skill growth. Focus on both strengths and areas for improvement.
 **אזורי מיקוד** – Suggest specific types of tasks or skills the team should prioritize or diversify.
 **הזדמנויות לצמיחה** – Identify 1–2 areas for improvement and propose concrete steps the manager can take to support the team’s development.
**חלוקת משימות בצוות** – Based on the given data, provide insights for future task planning and allocation.
**הקצאת משאבים בארגון** – Recommend adjustments in personnel allocation within the team to improve efficiency, e.g., identifying members who are underutilized or overloaded, considering redistributing tasks, or evaluating whether team size matches the current workload.

Requirements:  
- Use '\\n' for readability.  
- Write in **plain Hebrew**.
- Follow exactly the phrasing style of the example
- Keep all usernames exactly as they appear in the data
- Always use gender-neutral or gender-inclusive phrasing for all employees. For example, instead of saying ravid מוביל, write ravid מוביל.ה to reflect that employees may be of any gender.
- The entire output must be a single valid JSON object with one key, "text"

Example Output:

המלצות כלליות – מומלץ למנף את תרבות בדיקות הקוד (Code Review) החזקה בצוות כדי לגשר על פערי המיומנויות, באמצעות חניכה של חברי.ות הצוות המנוסים.ות יותר את חברי.ות הצוות החדשים.ות או החלשים.ות יותר.
אזורי מיקוד – יש להתמקד בהגברת המעורבות של נועם, בעל.ת התפוקה הנמוכה, באמצעות משימות מוגדרות היטב, ולשקול להרחיב את תחומי האחריות של רון, המתמקד.ת בעיקר בבדיקות קוד, גם למשימות פיתוח מורכבות יותר.
הזדמנויות לצמיחה – הזדמנות מרכזית היא צמצום פערי הידע; ניתן לעשות זאת על ידי יצירת תוכנית חניכה רשמית בין רביד לנועם, וכן על ידי עידוד עבודה בזוגות (Pair Programming) במשימות מורכבות.
חלוקת משימות בצוות – בתכנון עתידי, יש לאזן את העומס המוטל על רביד כדי למנוע היווצרות של נקודת כשל תלותית (Single Point of Failure), ובמקביל להקצות לרון משימות קריטיות של בקרת איכות לפני שחרור גרסה.
הקצאת משאבים בארגון – יש לבחון את חלוקת העבודה הפנימית: רביד נמצא.ת בעומס יתר מתמשך שעלול להוביל לשחיקה, בעוד שנעם מהווה משאב שאינו מנוצל במלואו וניתן להשקיע בפיתוחו.ה כדי להגביר את תפוקת הצוות הכוללת.

data: ${JSON.stringify(info)}

`;
    return await this.callModel(prompt);
  }

  async getWorkerQuestionAnswer(question: string, info: any): Promise<string> {
    const prompt = `
    Answer the question based on the context below. Keep the answer short and concise. Respond "אין ודאות לגבי התשובה" if not sure about the answer.
Context: The following data represents a software development team across multiple sprints.  ${JSON.stringify(
      info
    )}
Requirements:  
- Write in **plain Hebrew**.
-Always use gender-neutral or gender-inclusive phrasing for all employees. For example, instead of saying ravid ביצע, write ravid ביצע.ה to reflect that employees may be of any gender.
-Keep all usernames exactly as they appear in the data
- The entire output must be a single valid JSON object with one key, "text"
Question:${question}
 Answer:
    `;
    return await this.callModel(prompt);
  }

  async getTeamQuestionAnswer(question: string, info: any): Promise<string> {
    const prompt = `
    Answer the question based on the context below. Keep the answer short and concise. Respond "אין ודאות לגבי התשובה" if not sure about the answer.
Context: The following data represents a software development team across multiple sprints.  ${JSON.stringify(
      info
    )}
Requirements:  
- Write in **plain Hebrew**.
-Always use gender-neutral or gender-inclusive phrasing for all employees. For example, instead of saying ravid ביצע, write ravid ביצע.ה to reflect that employees may be of any gender.
-Keep all usernames exactly as they appear in the data
- The entire output must be a single valid JSON object with one key, "text"
Question:${question}
 Answer:
    `;
    return await this.callModel(prompt);
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
          // console.warn(
          //   `Could not find original MR or Jira issue for match:`,
          //   match
          // );
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
