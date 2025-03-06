export const gradeSubmission = async (answerKeyText, submissionText) => {
  try {
    // Fetch API key from hello endpoint
    const keyResponse = await fetch('/api/hello');
    const keyData = await keyResponse.json();
    const OPENAI_API_KEY = keyData.openAiKey;
    
    const prompt = `
      You are an AI grading assistant. Your task is to grade a student's submission against an answer key.
      
      ANSWER KEY:
      ${answerKeyText}
      
      STUDENT SUBMISSION:
      ${submissionText}
      
      Please grade the submission on a scale of 0-100. Be lenient in your grading and give students the benefit of the doubt. Focus on conceptual understanding rather than exact wording or notation. If the student demonstrates partial understanding, award partial credit generously.
      
      Provide detailed feedback on what was correct and what needs improvement. Focus more on if the answer and work makes sense conceptually rather than exact notation or formatting.
      
      Format your response as a JSON object with the following structure:
      {
        "grade": (numeric score between 0-100),
        "feedback": (detailed explanation of the grade)
      }
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI grading assistant that evaluates student submissions. Be generous and lenient in your grading approach." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      return JSON.parse(aiResponse);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error("Failed to parse the AI response into valid JSON format");
    }
  } catch (error) {
    console.error("Error in grading process:", error);
    throw error;
  }
};
