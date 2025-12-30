import { API_BASE_URL, BASE_PATH } from '../constants/chatConstants';
import axios from 'axios';

export async function fetchChatResponse(message) {
try {
    const response = await axios.post(`${API_BASE_URL}${BASE_PATH}/query`,
      message,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
     
    return response.data;
  } catch (error) {
    console.error('Error sending request:', error);
  }
}
