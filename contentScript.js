// Verify Chrome API is available
if (!chrome?.runtime?.sendMessage) {
    alert("Chrome API not loaded! Reload the page.");
    throw new Error("Chrome runtime unavailable");
  }
  
  console.log("✅ Chrome messaging API verified");
  
  const createButton = (inputElement) => {
    const button = document.createElement('button');
    button.className = 'refine-button';
    button.textContent = '✨ Refine';
    
    button.addEventListener('click', async () => {
      try {
        console.log("📤 Sending text to background...");
        
        // Direct promise-based messaging
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: 'refineText', text: inputElement.value },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            }
          );
        });
  
        console.log("📥 Received:", response);
        inputElement.value = response.refinedText || "Error: Empty response";
        
      } catch (error) {
        console.error("💥 Full error:", error);
        alert(`Failed: ${error.message}\n\nOpen DevTools (F12) for details`);
      }
    });
  
    inputElement.insertAdjacentElement('afterend', button);
    console.log("➕ Button added to", inputElement);
  };
  
  // Enhanced input detection
  document.addEventListener('focusin', (e) => {
    if (e.target.matches('textarea, input[type="text"]')) {
      createButton(e.target);
    }
  });
  
  // Initialize existing fields
  document.querySelectorAll('textarea, input[type="text"]').forEach(createButton);
  
  console.log("🔍 Ready to refine text!");

  // Add retry logic for messages
const sendWithRetry = async (message, retries = 3) => {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      if (retries > 0 && error.message.includes('context')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return sendWithRetry(message, retries - 1);
      }
      throw error;
    }
  };
  
  // Usage:
  button.addEventListener('click', async () => {
    try {
      const response = await sendWithRetry({
        action: 'refineText',
        text: input.value
      });
      input.value = response.refinedText;
    } catch (error) {
      console.error("Final error:", error);
      alert("Please reload the page and extension");
    }
  });