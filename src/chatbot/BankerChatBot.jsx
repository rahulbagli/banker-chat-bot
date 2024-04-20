import React, { useState, useRef, useEffect } from 'react';
import { Box, Container, Grid, Paper, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import './bankerChat.scss'
import axios from 'axios';
import TypewriterResponse from './TypewriterResponse';
import TableCompare from './TableCompare';
import TableDisplay from './TableDisplay';
import DisplayPlan from './DisplayPlan';
import DisplayPlanType from './DisplayPlanType';
import DisplayProduct from './DisplayProduct';

async function postCall(input) {
  try {
    const response = await axios.post('http://localhost:9090/v1/banker/chatbot/query',
      input,
      {
        headers: { 'Content-Type': 'application/json' },
      });
    return response.data;
  } catch (error) {
    console.error('Error sending request:', error);
  }
}

function camelCaseToWords(text) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function BankerChatBot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function showResponse(inputTxt, userType) {
    setMessages((prevMessages) => [...prevMessages, { text: inputTxt, type: userType }]);
  }

  async function handleInputChange(event) {
    setInput(event.target.value);
  }

  async function handleSendClick() {
    showResponse(input, 'user');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    backendCall();
   
  };

  async function backendCall() {
    try {
      const response = await postCall(input.trim());
      setResponse(response);
      setError(null);
      showResponse(response.responseText, 'response');
      await new Promise((resolve) => setTimeout(resolve, 2700));
      if(response.responseCode == 200 && response.queryIntent == 'Compare_Product'){
        showResponse(compareTable(response.productList), 'response');
      } else  if(response.responseCode == 206 && response.queryIntent == 'Compare_Product'){
        showResponse(displayTable(response?.productList), 'response');
      } else  if(response.responseCode == 206 && response.queryIntent == 'Product_Detail'){
        showResponse(displayTable(response?.productList), 'response');
      }else  if(response.responseCode == 200 && response.queryIntent == 'Display_Plans'){
        showResponse(displayPlans(response), 'response');
      }else  if(response.responseCode == 200 && response.queryIntent == 'Display_Products'){
        showResponse(displayProducts(response), 'response');
      }else  if(response.responseCode == 200 && response.queryIntent == 'Display_PlanType'){
        showResponse(displayPlanTypes(response), 'response');
      } else {
      }
      setInput('');
    } catch (error) {
      console.error('Error sending request:', error);
      setError(error.message || 'An error occurred.'); 
    }
  }

  const compareTable = (products) => {
    return (
      <TableCompare products={products} camelCaseToWords = {camelCaseToWords}/>
    );
  };

  const displayTable = (products) => {
    return (
      <TableDisplay products={products} camelCaseToWords = {camelCaseToWords}/>
    );
  };

  const displayPlanTypes = (planTypes) => {
    return (
      <DisplayPlanType planTypes={planTypes}/>
    );
  };

  const displayPlans = (plans) => {
    return (
      <DisplayPlan plans={plans}/>
    );
  };

  const displayProducts = (products) => {
    return (
      <DisplayProduct products={products}/>
    );
  };

  return (
    <Container style={{ width: '100vw' }}>
      <Box>
        <Grid container spacing={2}>
          <Grid item lg={12}>
            <Paper elevation={3} sx={{ height: 600, padding: '10px', overflowY: 'auto' }}>
              <div className="chat-container">

                {messages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.type}`} ref={messagesEndRef}>
                      {
                        message.type == 'user' ? message.text : <TypewriterResponse response={message.text} />
                      }
                  </div>

                ))}
              </div>

            </Paper>
          </Grid>
          <Grid item lg={10}>
            <TextField
              fullWidth
              label="Type your query"
              variant="outlined"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSendClick();
                }
              }}
            />
          </Grid>
          <Grid item lg={2} sx={{ alignContent: 'center' }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSendClick}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default BankerChatBot