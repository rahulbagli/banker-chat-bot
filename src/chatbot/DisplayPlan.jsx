import React from 'react'
import { Divider } from '@mui/material';

function DisplayPlan({plans}) {
  return (
    <div>
      {plans.planNameWithNumber.map((row, index) => (
        <span> {++index}. { row} 
        <Divider/>
        </span>
      ))}
    </div>
  )
}

export default DisplayPlan