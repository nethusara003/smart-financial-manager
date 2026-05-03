const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzUyZDBlYmE0N2VjODQwNDY0MGQ4OCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzc3NDg1NzU1LCJleHAiOjE3NzgwOTA1NTV9.9J5eVCR09doQdAXlzpwFuzfuTZIVbrgjyWau6DuOURY";

const questions = [
  "How much did I spend on food last month?",
  "Am I on track with my budget this month?",
  "What categories am I overspending in?",
  "How can I reduce my monthly expenses?",
  "What is my income to expense ratio?",
  "How much should I save for retirement?",
  "When can I retire based on my current savings?",
  "What is my biggest expense category?",
  "Can you predict my expenses for next month?",
  "How has my spending changed over the last 3 months?",
  "What is my average monthly income?",
  "Am I saving enough each month?",
  "What percentage of my income goes to food?",
  "How much have I saved in total?",
  "What would happen if I increased my monthly savings by 10%?",
  "Are my expenses increasing or decreasing over time?",
  "What is my debt situation?",
  "How accurate are my expense forecasts?",
  "What is my financial health score?",
  "Give me a summary of my financial situation."
];

async function testAI() {
  console.log("=== STEP 4: AI ASSISTANT EVALUATION (PROD) ===\n");
  let relevantCount = 0;
  let tokenLimitCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`--- Q${i+1}: ${q}`);
    try {
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ message: q })
      });
      const data = await response.json();
      const reply = data.reply || data.message || "NO REPLY";
      const truncated = reply.substring(0, 200).replace(/\n/g, ' ');
      console.log(`A: ${truncated}...`);
      
      if (reply.includes("exceeded the AI model limits")) {
        console.log(`VERDICT: TOKEN LIMIT HIT`);
        tokenLimitCount++;
      } else if (reply.length > 30) {
        console.log(`VERDICT: RELEVANT`);
        relevantCount++;
      } else {
        console.log(`VERDICT: ERROR/IRRELEVANT`);
        errorCount++;
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
      errorCount++;
    }
    console.log("");
  }
  
  console.log("=== FINAL SCORE ===");
  console.log(`Relevant: ${relevantCount}/20`);
  console.log(`Token Limit Failures: ${tokenLimitCount}/20`);
  console.log(`Errors: ${errorCount}/20`);
}

testAI();
