// Gemini API Configuration
const GEMINI_CONFIG = {
  apiVersion: "v1", // Changed from v1beta
  modelName: "gemini-2.0-flash", // Updated model name
  endpoint: "https://generativelanguage.googleapis.com"
};

// Enhanced API Call Function
const callGeminiAPI = async (apiKey, text, refinementType) => {
  const prompts = {
    coding: "Refine this into a precise and executable coding prompt suitable for AI understanding. (Only return the improved prompt text. Last refined: 2025-05-24):\n\n",
    productIdea: "Refine this application/product concept into a well-structured prompt. Ensure the goal, target audience, core features, and desired tech stack (if mentioned) are clearly conveyed so the AI can understand and assist with app creation(do not include code just forformat it for app idea) (dont include senarios and multiple options)(Only return the improved prompt text. Last refined: 2025-05-24):\n\n",    
    debugging: "Rephrase this as a clear and concise prompt for code debugging. Focus on describing the problem, expected behavior, and any relevant context so the AI can diagnose and suggest fixes effectively(Only return the improved prompt text. Last refined: 2025-05-24):\n\n",
    businessStrategy: "Refine this prompt to be effective in business, decision-making, or strategic planning contexts. (Only return the improved prompt text. Last refined: 2025-05-24):\n\n"
  };
  

  const url = `${GEMINI_CONFIG.endpoint}/${GEMINI_CONFIG.apiVersion}/models/${GEMINI_CONFIG.modelName}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompts[refinementType] + text }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API ${response.status}: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(`Failed to call Gemini API: ${error.message}`);
  }
};

// Message Handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "refineText") return false;

  chrome.storage.local.get(["apiKey"], async (result) => {
    if (!result.apiKey) {
      return sendResponse({ error: "API key not configured. Please set your Gemini API key." });
    }

    try {
      const refinedText = await callGeminiAPI(
        result.apiKey,
        request.text,
        request.refinementType
      );
      sendResponse({ refinedText });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  });

  return true; // Keep message port open
});

// Initialize
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ apiKey: "" });
  console.log("Extension installed");
});