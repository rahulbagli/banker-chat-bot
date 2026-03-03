import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import BankerChatBot from './chatbot/BankerChatBot.jsx'
import AdvancedChatBot from './service-operation/ui/AdvancedChatBot.jsx'
import SimpleExample from './three-d/SimpleExample.jsx'
import ServiceWorkFlowSimulator from './three-d/ServiceWorkFlowSimulator.jsx'
import WorkFlowSimulator from './rewards/WorkFlowSimulator.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
 // <React.StrictMode>
    //<AdvancedChatBot />
   // <DynamicTraceFlow />
   //<SimpleExample />
  //  <ServiceWorkFlowSimulator />
  <WorkFlowSimulator />
 // </React.StrictMode>,
)
