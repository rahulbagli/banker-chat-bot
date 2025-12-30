import React, { useState, useEffect } from 'react';

function TypewriterResponse({ response}) {
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    if (!response || isTyping) return; 

    const typeResponse = async () => {
      setIsTyping(true); 

      for (let i = 0; i < response.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 30)); 
        setTypedText((prevText) => prevText + response[i]);
      }
      setIsTyping(false); 
    };

    typeResponse();
  }, [response]); 

  return (
    <div>
      {isTyping ? (
        <span>{typedText} |</span> 
      ) : (
        <span>{response}</span> 
      )}
    </div>
  );
}

export default TypewriterResponse