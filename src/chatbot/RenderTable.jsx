import React from 'react'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';


function RenderTable({products}) {
  const productData = Object.keys(products.productsList[0].planTypeList[0].planUseList[0].data)
  return (
  
    <>
  <TableContainer component={Paper}>
  <Table sx={{ minWidth: 650 }} aria-label="simple table">
    <TableHead>
      <TableRow>
        <TableCell>Product</TableCell>
        {/* Map through productData for column headers */}
        {productData.map((param, index) => (
          <TableCell key={index}>{param}</TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {/* Map through planUseList for rows */}
      {products.productsList[0].planTypeList[0].planUseList.map((param, index) => (
        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
          <TableCell>{param.data.planProduct}</TableCell>
          {/* Map through productData for columns */}
          {productData.map((item, i) => (
            <TableCell key={i}>{param.data[item]}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
  </>
  )
}

export default RenderTable