
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client safely
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  // Check if key is missing or is a placeholder
  if (!apiKey || apiKey === 'YOUR_API_KEY' || apiKey.length < 10) return null;
  return new GoogleGenAI({ apiKey });
};

// Mock responses for Demo Mode (when API fails or is missing)
const getMockResponse = async (message: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('wifi') || lowerMsg.includes('internet')) {
    return "✨ [Mode Démo] Le Wifi est 'HostFlow_Guest' et le mot de passe est 'Welcome2024'. Profitez-en !";
  }
  
  if (lowerMsg.includes('code') || lowerMsg.includes('cle') || lowerMsg.includes('clé') || lowerMsg.includes('acces') || lowerMsg.includes('accès')) {
    return "🔑 [Mode Démo] Le code de la boîte à clé est le 4589. Le boîtier se trouve juste à droite de la porte d'entrée.";
  }

  if (lowerMsg.includes('poubelle') || lowerMsg.includes('ordure')) {
    return "🗑️ [Mode Démo] Le local poubelle est situé au rez-de-chaussée, première porte à gauche en sortant de l'ascenseur.";
  }

  if (lowerMsg.includes('parking') || lowerMsg.includes('garer')) {
    return "🚗 [Mode Démo] Vous avez une place réservée au sous-sol, numéro 42. Le bip est sur le plan de travail.";
  }

  return "🤖 [Assistant Démo] Je suis votre concierge virtuel. En production, je serais connecté à l'IA Gemini pour répondre intelligemment. Ici, je simule une réponse car votre clé API n'a pas la facturation activée ou est manquante.";
};

export const chatWithConcierge = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  systemInstruction: string
): Promise<string> => {
  
  const ai = getAiClient();

  // IMMEDIATE FALLBACK if no client
  if (!ai) {
    console.warn("Gemini API Key missing. Using Demo Mode.");
    return await getMockResponse(message);
  }

  try {
    const model = 'gemini-3-flash-preview';

    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Je n'ai pas pu générer de réponse.";

  } catch (error: any) {
    // Catch Billing, Quota, or Network errors gracefully
    console.error("Gemini API Error (likely Billing/Quota):", error);
    
    // Return friendly fallback instead of crashing or showing error text
    return await getMockResponse(message);
  }
};
