import React from 'react'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function TableCompare({ products, camelCaseToWords }) {
    const productData = Object.keys(products.productsList[0].planTypeList[0].planUseList[0].data)
    return (
        <>
            <TableContainer component={Paper}>
                <Table size="small" sx={{ minWidth: 550 }} aria-label="a dense table">
                    <TableHead sx={{ bgcolor: '#183a61b3' }}>
                        <TableRow>
                            <TableCell></TableCell>
                            {products.productsList.map((row, index) => (
                                <TableCell key={index} sx={{ color: 'white' }}>{row['product']}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.productsList.map((row, index) => {
                            return row.planTypeList[0].planUseList[index]?.planUse && (
                                <>
                                    <TableRow key={index} sx={{ backgroundColor: 'e3e3e3' }}>
                                        <TableCell key={index} sx={{ textAlign: 'left', color: 'blue', fontSize: '12px', fontWeight:600}}>
                                            {row.planTypeList[0].planType} -</TableCell>
                                            <TableCell key={index} sx={{ textAlign: 'left', color: 'blue', fontSize: '12px', fontWeight:600 }}>
                                            {row.planTypeList[0].planUseList[index].planUse}</TableCell>
                                    </TableRow>
                                    {
                                        productData.map((colProperty, idx) => {
                                            const colVals = products.productsList.map((row) =>
                                                row.planTypeList[0].planUseList[index].data[colProperty]);
                                            return (
                                                <TableRow>
                                                    <TableCell key={index} sx={{ color: '#130db5', bgcolor: 'rgb(169 192 223 /82% )'}}>
                                                        {camelCaseToWords(colProperty)}
                                                        </TableCell>
                                                    {colVals.map((colVal, index) => {
                                                        const isDiff = colVals.indexOf(colVal) !==  colVals.lastIndexOf(colVal);
                                                        const color = isDiff ? 'inherit' : 'red' 
                                                        return (


                                                            <TableCell key={index} sx={{ color }}>{colVal}</TableCell>

                                                        )
                                                    })}
                                                </TableRow>
                                            )
                                        })}
                                </>
                            )
                        }
                        )}


                    </TableBody >
                </Table>
            </TableContainer>
        </>
    )
}

export default TableCompare