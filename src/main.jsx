import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import BankerChatBot from './chatbot/BankerChatBot.jsx'
import AdvancedChatBot from './service-operation/ui/AdvancedChatBot.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
 // <React.StrictMode>
    <AdvancedChatBot />
 // </React.StrictMode>,
)
