import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  if (!apiKey) {
    console.warn('Gemini API Key 未配置');
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export const parseTaskWithAI = async (input: string) => {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            dueDate: { type: SchemaType.STRING, description: "ISO date string or null" },
            priority: { type: SchemaType.STRING, enum: ["none", "low", "medium", "high"] },
            tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          }
        }
      }
    });

    const currentDate = new Date().toISOString();
    const prompt = 'Parse the following task input into a structured JSON object. Current Date: ' + currentDate + '. Input: "' + input + '"';

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return JSON.parse(text || '{}');
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return null;
  }
};

export const summarizeNoteWithAI = async (content: string) => {
  const ai = getGenAI();
  if (!ai) return "API Key 未配置";

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = 'Summarize the following note content in one concise sentence: "' + content + '"';

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "摘要生成失败";
  }
};
