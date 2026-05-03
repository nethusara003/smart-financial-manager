const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjIxYzU5MDk2MmRlNTJkMmVhMjAzYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzc3NDc5MTI0LCJleHAiOjE3NzgwODM5MjR9.nPMSQRe5vkm9ojOlfxHvnqZK0oXdmyCX35y6ZNW2pNo";

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
  console.log("=== STEP 4: AI ASSISTANT EVALUATION ===\n");
  let relevantCount = 0;
  let tokenLimitCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`\nQ${i+1}: ${q}`);
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
      console.log(`A: ${reply.substring(0, 150)}...`);
      const lowerReply = reply.toLowerCase();
      const isTokenLimit = lowerReply.includes("exceeded the ai model limits");

      if (isTokenLimit) {
        tokenLimitCount++;
      } else if (
        reply.length > 50 &&
        !lowerReply.includes("i'm sorry") &&
        !lowerReply.includes("i don't have")
      ) {
        relevantCount++;
      } else {
        errorCount++;
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
      errorCount++;
    }
  }
  
  console.log("\n=== FINAL SCORE ===");
  console.log(`Relevant: ${relevantCount}/20`);
  console.log(`Token Limit Failures: ${tokenLimitCount}/20`);
  console.log(`Errors: ${errorCount}/20`);
}

testAI();
