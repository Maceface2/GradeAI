const API_KEY = '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';

export const gradePaper = async (answers, answerKey) => {
    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',  
          messages: [
            { role: 'system', content: 'You are an AI grader that compares student answers to an answer key and grades the responses based on correctness.' },
            { role: 'user', content: `Here is the answer key: ${answerKey}. Here are the student’s answers: ${answers}. Please grade the student’s responses and give feedback.` },
          ],
          max_tokens: 1000,
        }),
      });
  
      const data = await response.json();
      return data.choices[0].message.content; // Get the grading result and feedback
    } catch (error) {
      console.error('Error with ChatGPT API:', error);
      return 'Sorry, something went wrong. Please try again later.';
    }
  };