import React from 'react'
import { Divider } from '@mui/material';

function DisplayProduct({ products }) {
  return (
    <div>
    {products.productName.map((row, index) => (
      <span> {++index}. { row} 
      <Divider/>
      </span>
    ))}
  </div>
  )
}

export default DisplayProduct