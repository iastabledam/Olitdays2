
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: In a production environment, API calls should ideally go through a backend proxy 
// to secure the API Key, but for this frontend implementation we use it directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithConcierge = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  systemInstruction: string
): Promise<string> => {
  
  try {
    const model = 'gemini-3-flash-preview';

    // Convert history to the format expected by the SDK
    // The SDK expects 'user' and 'model' roles.
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // Add the current user message to the conversation history for the API call
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slightly creative but focused
        // maxOutputTokens removed to comply with guidelines for thinking models
      }
    });

    return response.text || "Désolé, je n'ai pas pu générer de réponse pour le moment.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "⚠️ Service momentanément indisponible. Veuillez contacter votre hôte directement en cas d'urgence.";
  }
};
