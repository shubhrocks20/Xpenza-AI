import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

export const generateText = async (prompt: string) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
          {"role": "user", "content": prompt},
        ],
    });
    
    return completion.choices[0].message.content
}


