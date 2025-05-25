// Gemini API Configuration
const GEMINI_CONFIG = {
  apiVersion: "v1",
  modelName: "gemini-2.0-flash",
  endpoint: "https://generativelanguage.googleapis.com"
};

// Default refinement prompts
const DEFAULT_REFINEMENT_TYPES = {
  coding: "Refine this into a precise and executable coding prompt suitable for AI understanding. (Only return the improved prompt text. Last refined: 2025-05-24):\n\n",
  productIdea: "Refine this application/product concept into a well-structured prompt. Ensure the goal, target audience, core features, and desired tech stack (if mentioned) are clearly conveyed so the AI can understand and assist with app creation(do not include code just forformat it for app idea) (dont include senarios and multiple options)(Only return the improved prompt text. Last refined: 2025-05-24):\n\n",    
  debugging: "Rephrase this as a clear and concise prompt for code debugging. Focus on describing the problem, expected behavior, and any relevant context so the AI can diagnose and suggest fixes effectively(Only return the improved prompt text. Last refined: 2025-05-24):\n\n",
  businessStrategy: "Refine this prompt to be effective in business, decision-making, or strategic planning contexts. (Only return the improved prompt text. Last refined: 2025-05-24):\n\n"
};

// Enhanced API Call Function
const callGeminiAPI = async (apiKey, text, refinementType) => {
  // Get stored prompts from local storage
  const storage = await chrome.storage.local.get(['customPrompts']);
  const allPrompts = {
    ...DEFAULT_REFINEMENT_TYPES,
    ...(storage.customPrompts || {})
  };

  if (!allPrompts[refinementType]) {
    throw new Error(`Refinement type "${refinementType}" not found`);
  }

  const url = `${GEMINI_CONFIG.endpoint}/${GEMINI_CONFIG.apiVersion}/models/${GEMINI_CONFIG.modelName}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: allPrompts[refinementType] + text }]
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
  if (request.action === "addCustomPrompt") {
    chrome.storage.local.get(['customPrompts'], (result) => {
      const customPrompts = result.customPrompts || {};
      customPrompts[request.key] = request.prompt;
      chrome.storage.local.set({ customPrompts }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  } else if (request.action === "getCustomPrompts") {
    chrome.storage.local.get(['customPrompts'], (result) => {
      sendResponse({ 
        customPrompts: result.customPrompts || {},
        defaultPrompts: DEFAULT_REFINEMENT_TYPES
      });
    });
    return true;
  } else if (request.action === "deleteCustomPrompt") {
    chrome.storage.local.get(['customPrompts'], (result) => {
      const customPrompts = result.customPrompts || {};
      delete customPrompts[request.key];
      chrome.storage.local.set({ customPrompts }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  } else if (request.action === "refineText") {
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
    return true;
  }
});

// Initialize
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    apiKey: "",
    customPrompts: {} 
  });
  console.log("Extension installed");
});