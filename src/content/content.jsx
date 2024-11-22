import React, { useEffect, useState } from 'react';
import { prompt } from './prompt'; // Assuming this is your predefined prompt
import { GoogleGenerativeAI } from '@google/generative-ai';

const ContentPage = () => {
  const [chatBoxExpanded, setChatBoxExpanded] = useState(false);
  const [messages, setMessages] = useState([{role: 'ai', message: `Hii, i am Rehan. How can i help you!`}]); // Array to hold messages
  const [userInput, setUserInput] = useState(""); // To hold the user's current input
  const [apiKey, setApiKey] = useState(""); // To hold the API key
  const [loading, setLoading] = useState(false); // Loading state for AI response
  const [fetchingContent, setFetchingContent] = useState(false); // Loading state for fetching page content

  useEffect(() => {
    fetchApiKey();
  }, [apiKey]);

  const handleAskButton = () => {
    if (apiKey === undefined) {
      alert('Please add an API key to use the AI bot');
      return;
    }
    
    // Toggle the chat box expanded state
    setChatBoxExpanded(prevState => !prevState);
  };

  // Function to fetch the visible text content of the page with a word limit
  const fetchCurrentPageContent = async () => {
    setFetchingContent(true); // Start showing the "Fetching content" message
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Array to store the text content from the relevant tags
    let visibleTextContent = [];

    // List of tags to extract text from
    const tagsToExtract = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'span', 'a', 'td'];

    // Check visible elements in the current viewport (check every 10px interval)
    for (let y = scrollY; y < scrollY + viewportHeight; y += 10) {
      for (let x = scrollX; x < scrollX + viewportWidth; x += 10) {
        const element = document.elementFromPoint(x, y);

        if (element) {
          // If the element is one of the desired tags, grab its text content
          if (tagsToExtract.includes(element.tagName.toLowerCase())) {
            // Clean up the text (strip leading/trailing spaces, multiple spaces)
            const textContent = element.textContent.trim().replace(/\s+/g, ' ');

            if (textContent && !visibleTextContent.includes(textContent)) {
              visibleTextContent.push(textContent);
            }
          }
        }
      }
    }

    // Join all the visible text content into one string
    let cleanTextContent = visibleTextContent.join('\n');

    setFetchingContent(false); // Stop showing the "Fetching content" message
    return cleanTextContent;
  };

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!userInput.trim()) return; // Don't proceed if input is empty

    // Clear input immediately to avoid delay
    setUserInput('');

    // Set loading to true while waiting for AI response
    setLoading(true);
    // Add user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', message: userInput },
    ]);

    try {
      // First, fetch the page content and ensure it finishes before proceeding
      const pageContent = await fetchCurrentPageContent(); // Wait for content to be fetched

      // Initialize the AI model with the API key
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-002' });

      // Prepare the prompt by replacing placeholders
      const userPrompt = prompt.replace('{{pageContent}}', pageContent).replace('{{userInput}}', userInput);

      // Send the request to the AI model
      const result = await model.generateContent(userPrompt);
      console.log(result.response.text())
      // If successful, display the AI response in the chat
      const responseText = result?.response?.text();
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'ai', message: responseText },
      ]);
    } catch (error) {
      // If there's an error during any part of the process, display an error message
      console.error("Error during AI response:", error);

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'ai', message: "Sorry, an error occurred while processing your request. Please try again later." },
      ]);
    } finally {
      // Set loading to false regardless of whether the operation was successful or not
      setLoading(false);
    }
  };

  const fetchApiKey = async () => {
    const res = await chrome.storage.local.get('apiKey');
    setApiKey(res.apiKey);
    console.log(res.apiKey);
  };

  if(chatBoxExpanded){
    return (
      <div className='fixed bottom-5 right-5 w-[350px] h-[450px] bg-[#EBEAFF] rounded-lg z-[9999] overflow-hidden' >

        {/* Header section */}
        <div className='w-full h-[50px] bg-[#1a5ce6] px-3 flex flex-row justify-between items-center rounded-t-lg'>
          <p className='text-lg font-semibold text-white'>Rehan</p>
          <p className='text-lg font-semibold text-white cursor-pointer pr-2' onClick={()=>setChatBoxExpanded(false)}>𐤕</p>
        </div>

        {/* Message container */}
        <div className='w-full h-[350px] overflow-y-auto px-3 py-2 pb-2 flex flex-col gap-2 hide-scrollbar'>
          {messages.map((message, index)=>(
              <div key={index} className={`text-black rounded px-4 py-2 ${message.role==='user' ? 'self-end bg-gray-100' : ' bg-blue-100 self-start '}`}>
                <strong>{message.role==='user'?'You':'Rehan'}</strong>
                <div>{message.message}</div>
              </div>
          ))}
        </div>

        {/* Input box */}
        <div className='absolute bottom-0 py-3 w-full px-3 flex flex-row gap-2 items-center border-gray-300 border-t-2 bg-gray-200'>
          <input 
            className='px-3 outline-none text-black w-full bg-gray-200 rounded items-center' 
            type="text" 
            autoFocus
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
            }} placeholder='Enter your query...'/>
          <div className='right-2 bg-[#1a5ce6] px-3 py-2 rounded cursor-pointer text-white font-semibold' onClick={()=> handleSendMessage()}>Ask</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        className="fixed bottom-5 right-5 px-4 py-2 bg-[#1a5ce6] rounded text-white cursor-pointer z-50 text-xl"
        onClick={handleAskButton}
      >
        Ask AI
      </div>
    </div>
  );
};

export default ContentPage;
