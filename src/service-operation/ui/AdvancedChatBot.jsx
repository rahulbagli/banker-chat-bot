import { Box, AppBar, Toolbar, Typography, Button, Paper } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useChatController } from '../hooks/useChatController';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import logo from '../../assets/logo-personal.svg';
import '../css/AdvancedChatBot.scss';

export default function AdvancedChatBot() {
  const { responseText, isPending, sendMessage, resetChat } =
    useChatController();

  return (
    <Box className="chat-root">
      {/* Header */}
      <AppBar position="static" elevation={0} className="chat-header">
        <Toolbar className="chat-toolbar">
          <Box className="chat-brand">
            <img src={logo} alt="Service Logo" className="logo" />
            <Typography variant="h6">
              Service Operations Assistant
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={resetChat}
          >
            Reset
          </Button>
        </Toolbar>
      </AppBar>

      {/* Chat Container */}
      <Paper elevation={2} className="chat-container">
        <MessageList responseText={responseText} />
      </Paper>

      {/* Input */}
      <Paper elevation={3} className="chat-input-wrapper">
        <ChatInput onSend={sendMessage} disabled={isPending} />
      </Paper>
    </Box>
  );
}
