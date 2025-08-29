import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/env";

export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const promptAi = async (message: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${message}`,
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // To disable thinking
      },
    },
  });

  return response.text;
};
