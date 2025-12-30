import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import '../css/AdvancedChatBot.scss';
import SendIcon from '@mui/icons-material/Send';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box className="chat-input-root">
      <TextField
        className="chat-textfield"
        fullWidth
        multiline
        maxRows={4}
        placeholder="Type your message..."
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <Button
        className="chat-send-btn"
        variant="contained"
        disabled={disabled}
         endIcon={<SendIcon />}
        onClick={handleSend}
      >
        Send
      </Button>
    </Box>
  );
}
