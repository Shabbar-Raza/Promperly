// Gemini API Configuration
const GEMINI_CONFIG = {
  apiVersion: "v1",
  modelName: "gemini-2.0-flash",
  endpoint: "https://generativelanguage.googleapis.com"
};

// Default refinement prompts
const DEFAULT_REFINEMENT_TYPES = {
  coding: "Refine this into a precise and executable coding prompt suitable for AI understanding and give output in markdown format. (Only return the improved prompt text. Last refined: 2025-05-24):\n\n",
  productIdea: "Next AI Prompt: Generate a Prompt for a Landing Page\n\nYour new mission\nFrom all the information in the conversation above, your new mission is to generate the best possible Lovable.dev prompt for creating a high-converting landing page.\n\nThis landing page must perfectly reflect the customer's pain points, language, and motivations, using the Before-After-Bridge (BAB) copywriting framework. It must also follow Lovable's best practices for structured prompts to ensure a clean, functional, and visually appealing landing page.\n\nYour role is both an expert copywriter and a Lovable.dev landing page creation expert.\n\nThink step by step\nSummarize the key pain points, motivations, and desires expressed in the conversation.\nExtract the best possible customer wording from the AI-generated business insights to maintain authenticity.\nCraft a landing page structure that follows Lovable's best UI/UX practices and adheres to conversion best practices.\nGenerate the perfect Lovable.dev prompt, ensuring the AI produces not only great copy but also an effective design.\n\nLanding Page Structure (Follow this format in the Lovable Prompt)\n1️⃣ Above the Fold (First Section)\nThis is the first thing the visitor sees when landing on the page. It must be immediately clear what the product is, who it's for, and why it matters.\n\nHeadline: (Use customer's exact wording when possible)\nCan be one of these:\nA short, direct statement of what the product does\nA powerful question that resonates with the visitor's pain\nA vision of the desired outcome\nSubheadline: Clarifies the offer in simple words, mentioning:\nWho it's for\nWhat problem it solves\nHow it's different or easier than other solutions\nBullet Points: 3-5 benefits of the product (each backed by a feature).\nCall to Action (CTA): Simple, action-driven button text.\n\n2️⃣ Current Pain (The 'Before')\nThis section vividly describes the visitor's current struggles, making them feel seen and understood.\n\nTitle: A question or statement that instantly connects with the visitor's situation.\n3 Pain Points: Short paragraphs painting scenes of frustration (use customer wording!).\nBelief Deconstruction: Breaks the visitor's false assumptions about the problem (e.g., why past solutions haven't worked).\n\n3️⃣ Desired Outcome (The 'After')\nNow, shift the focus to what life looks like once the problem is solved.\n\nTitle: A call to imagine their transformed life.\n3 Outcome Blocks: Short descriptions of the new reality, linked to emotions.\nNew Paradigm Introduction: Introduce a new way to solve the problem—setting up the product as the breakthrough.\n\n4️⃣ Introducing the Product\nNow, finally introduce the offer.\n\nProduct Name + Short Description\n3-Step Process: If applicable, outline how it works in 3 simple steps.\nMessage from the Founder: A personal statement to humanize the product.\nFinal CTA Block: Last push to get the visitor to take action (with urgency).\n\nLovable.dev Best Practices (Incorporate These in the Lovable Prompt!)\nBe extremely clear in the request (no vague instructions like 'make a good landing page').\nSpecify structure upfront (above-the-fold, pain points, solution, CTA, etc.).\nEnsure strong CTA placement (e.g., after key sections).\nSpecify a clean, conversion-optimized design (modern UI, clear typography, mobile-friendly layout).\nUse Lovable's integrations wisely (e.g., include a contact form, email collection, Stripe for payments if relevant).\n\nNow, Generate the Lovable.dev Prompt\nNow, based on all the insights gathered, write a Lovable.dev prompt that will generate a full landing page that follows the structure above, using the customer's own words wherever possible.\n\nThe Lovable prompt must:\n\nClearly instruct Lovable to create a landing page.\nInclude all the required sections and design instructions.\nUse the customer's own wording for headlines, pain points, and outcomes.\nEnsure mobile responsiveness and a professional aesthetic.\n\nOutput:\nA full Lovable.dev prompt that the user can copy and paste into Lovable to generate a fully functional, high-converting landing page.\n\nFinal Step\nOnce the Lovable.dev prompt is generated, review it to ensure:\n✅ It includes clear instructions for layout & design.\n✅ It follows conversion copywriting principles.\n✅ It uses real customer insights from the previous conversation.\n✅ It's structured for Lovable to execute flawlessly.\n\nNow, generate the best possible Lovable.dev prompt! 🚀\n (Only return the output not text as okay i have done this or anything else)",
  debugging: "Rephrase this as a clear and concise prompt for code debugging. Focus on describing the problem, expected behavior, and any relevant context so the AI can diagnose and suggest fixes effectivelyc and use markdown fortmat in output \n\n use this output format -> 'I’m getting an error in my [programming language] code. Here’s the code: \n\n[paste problematic code here] \n\n The error message is: [paste full error message here]. \n\n What are the potential causes and how can I fix it? I suspect the issue might be related to [your suspicion if any].' (Only return the improved prompt text as output. Last refined: 2025-05-24):\n\n",
  SystemDesign: "Refine this prompt to be effective in system design and architecture; output prompt in this format -> 'I need to design a system for [describe system purpose and key features e.g. a real time chat application an e commerce recommendation engine a blogging platform]. What are some suitable architectural patterns (e.g., microservices, monolithic, event-driven, serverless) and technologies I should consider? Discuss pros and cons for [specific constraints like scalability cost team expertise time to market performance targets].' . (Only return the improved prompt text , not any additional text such as here is this or sure or rely words like these. Last refined: 2025-05-24):\n\n"
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