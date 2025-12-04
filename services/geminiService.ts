import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseTaskWithAI = async (input: string) => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse the following task input into a structured JSON object. 
      Current Date: ${new Date().toISOString()}.
      Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            dueDate: { type: Type.STRING, description: "ISO date string or null" },
            priority: { type: Type.STRING, enum: ["none", "low", "medium", "high"] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return null;
  }
};

export const summarizeNoteWithAI = async (content: string) => {
  if (!apiKey) return "API Key missing";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the following note content in one concise sentence: "${content}"`
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Failed to summarize";
  }
};