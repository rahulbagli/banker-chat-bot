import { useState, useCallback, useTransition } from 'react';
import { fetchChatResponse } from '../api/chatApi';
import { MESSAGE_TYPES } from '../constants/chatConstants';

export function useChatController() {
  const [responseText, setResponseText] = useState([]);
  const [isPending, startTransition] = useTransition();

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const addUserMessage = useCallback((text) => {
    setResponseText(prev => [
      ...prev,
      {
        type: MESSAGE_TYPES.USER,
        responseText: text
      }
    ]);
  }, []);

  // Loading message
  const addLoading = useCallback(() => {
    setResponseText(prev => [
      ...prev,
      { type: MESSAGE_TYPES.LOADING }
    ]);
  }, []);

  const removeLoading = () => {
    setResponseText(prev =>
      prev.filter(m => m.type !== MESSAGE_TYPES.LOADING)
    );
  };

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isPending) return;

    addUserMessage(text);
    addLoading();

    startTransition(async () => {
      try {
        const [response] = await Promise.all([
          fetchChatResponse(text),
          wait(800)
        ]);

        removeLoading();

        setResponseText(prev => [
          ...prev,
          {
            type: MESSAGE_TYPES.BOT,
            responseCode: response.responseCode,
            responseText: response.responseText,
            queryIntent: response.queryIntent,
            fileName: response.fileName
          }
        ]);

      } catch (err) {
        console.error(err);
        removeLoading();
        setResponseText(prev => [
          ...prev,
          {
            type: MESSAGE_TYPES.ERROR,
            responseText: 'Something went wrong. Please try again.'
          }
        ]);
      }
    });
  }, [addUserMessage, addLoading, isPending]);

  const resetChat = useCallback(() => {
    setResponseText([
      {
        type: MESSAGE_TYPES.SYSTEM,
        responseText: 'Conversation reset.'
      }
    ]);
  }, []);

  return {
    responseText,
    isPending,
    sendMessage,
    resetChat
  };
}
