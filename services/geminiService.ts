import { GoogleGenAI, Type } from "@google/genai";
import { Fortune } from "../types";

export async function fetchBizarreFortunes(): Promise<Fortune[]> {
  try {
    // Initialize the client inside the function to ensure process.env.API_KEY is available.
    // The apiKey is injected by Vite during the build process via the 'define' configuration.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 20 extremely unique, bizarre, and surreal fortune cookie messages. Use dream logic, surreal humor, and slightly ominous but harmless advice. Example: 'The ants are judging your choice of socks today.' or 'Your future contains a very confused turtle.' Include a luck score (0-100) and a quirky category like 'Dream Logic', 'Cryptic', or 'Kitchen Wisdom'.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              category: { type: Type.STRING },
              luckScore: { type: Type.NUMBER }
            },
            required: ["text", "category", "luckScore"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Error fetching fortunes:", error);
  }
  return [];
}