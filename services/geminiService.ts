// This service now connects to the Node.js backend (server.js)
// This is more secure as the API Key is kept on the server side.

const API_URL = 'http://localhost:3000/api';

export const chatWithConcierge = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  propertyDetails: string
): Promise<string> => {
  
  try {
    // We call the Node.js backend endpoint
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        propertyContext: propertyDetails,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Backend Connection Error:", error);
    
    // Fallback message if the Node.js server isn't running in the preview
    return "⚠️ Le serveur Node.js semble déconnecté. Pour utiliser l'IA, assurez-vous de lancer 'node server.js' dans votre terminal, ou migrez ce code vers Next.js comme prévu !";
  }
};