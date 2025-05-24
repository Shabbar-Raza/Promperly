document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.local.set({ apiKey }, () => {
      alert('API key saved!');
    });
  });
  
  chrome.storage.local.get(['apiKey'], (result) => {
    document.getElementById('apiKey').value = result.apiKey || '';
  });