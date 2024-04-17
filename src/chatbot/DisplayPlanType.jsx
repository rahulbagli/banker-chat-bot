import React from 'react'
import { Divider } from '@mui/material';

function DisplayPlanType({planTypes}) {
  return (
    <div>
    {planTypes.planTypes.map((row, index) => (
      <span> {++index}. { row} 
      <Divider/>
      </span>
    ))}
  </div>
  )
}

export default DisplayPlanType