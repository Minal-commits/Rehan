import React, { useEffect, useState } from 'react';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [stored, setStored] = useState(false);
  const [storedApiKey, setStoredApiKey] = useState('');

  // Check if the API key is stored when the component mounts
  useEffect(() => {
    const checkStoredApiKey = async () => {
      const result = await chrome.storage.local.get('apiKey');
      if (result.apiKey) {
        setStored(true);
        setStoredApiKey(result.apiKey);
      }
    };
    checkStoredApiKey();
  }, []);

  const handleAddApiKey = async () => {
    if (apiKey.trim() === '') {
      alert('API key cannot be empty!');
      return;
    }
    await chrome.storage.local.set({ apiKey });
    setStored(true);
    setStoredApiKey(apiKey); // Update the stored API key state
  };

  const removeApiKey = async () => {
    await chrome.storage.local.remove('apiKey'); // Corrected to use chrome.storage.local
    setStored(false);
    setStoredApiKey(''); // Clear the stored API key from state
  };

  if (stored) {
    return (
      <div className='items-center justify-center w-[350px] h-[450px] px-10 py-6'>
        <img className='w-56 h-56' src='https://media1.tenor.com/m/BSY1qTH8g-oAAAAd/check.gif' alt='success' />
        <h1 className='text-sm font-semibold'>API key added: {storedApiKey}</h1>
        <button
          className="bg-blue-500 text-white py-2 px-3 rounded-md mt-4 text-sm font-semibold"
          onClick={removeApiKey}
        >
          Remove API key
        </button>
      </div>
    );
  }

  return (
    <div className="w-[350px] h-[450px] px-10 py-6">
      <h1 className="text-xl font-bold align-middle">Merlin</h1>
      <div className="pt-2">
        <p className="text-lg text-gray-400 font-semibold">Enter your Gemini API key: </p>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type="text"
          placeholder="Enter your API key"
          className="border-b-2 border-gray-400 py-1 mt-1 w-full outline-none"
        />
        <div className="mt-2">
          <a 
            href="https://www.youtube.com/watch?v=OVnnVnLZPEo" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 text-sm"
          >
            Create API key?
          </a>
        </div>
        <div className="mt-4">
          <button
            className="bg-blue-500 text-white py-2 px-3 rounded-md text-sm font-semibold"
            onClick={handleAddApiKey}
          >
            Add API key
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
