document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const refineBtn = document.getElementById('refineBtn');
    const copyBtn = document.getElementById('copyBtn');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
  
    // Load saved API key
    chrome.storage.local.get(['apiKey'], function(result) {
      if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
      }
    });
  
    // Save API key
    saveApiKeyBtn.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      chrome.storage.local.set({ apiKey }, () => {
        showToast(apiKey ? 'API key saved' : 'API key cleared');
      });
    });
  
    // Refine text
    refineBtn.addEventListener('click', async () => {
      const text = document.getElementById('userInput').value.trim();
      if (!text) {
        showToast('Please enter some text');
        return;
      }
  
      setLoading(true);
      
      try {
        const refinementType = document.getElementById('refinementType').value;
        const response = await chrome.runtime.sendMessage({
          action: 'refineText',
          text,
          refinementType
        });
  
        if (response.error) {
          throw new Error(response.error);
        }
  
        document.getElementById('refinedOutput').value = response.refinedText;
        showToast('Refinement complete');
      } catch (error) {
        showToast(error.message);
        console.error('Refinement error:', error);
      } finally {
        setLoading(false);
      }
    });
  
    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
      const output = document.getElementById('refinedOutput');
      output.select();
      document.execCommand('copy');
      showToast('Copied to clipboard');
    });
  
    // Helper functions
    function setLoading(isLoading) {
      refineBtn.disabled = isLoading;
      refineBtn.classList.toggle('loading', isLoading);
      refineBtn.innerHTML = isLoading 
        ? '<span class="btn-content"><svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg> Processing...</span>'
        : '<span class="btn-content"><svg class="btn-icon" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg> Refine Text</span>';
    }
  
    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }, 10);
    }
  });