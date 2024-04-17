import React from 'react'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function TableDisplay({ products }) {
    const productData = Object.keys(products.productsList[0].planTypeList[0].planUseList[0].data)
    return (
        <>
            <TableContainer component={Paper}>
                <Table size="small" sx={{ minWidth: 550 }} aria-label="a dense table">
                    <TableHead sx={{ bgcolor: '#183a61b3' }}>
                        <TableRow>
                            {
                                productData.map((param, index) => (
                                    <TableCell sx={{ color: 'white' }}>{param}</TableCell>
                                ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {
                            products.productsList[0].planTypeList[0].planUseList.map((param, index) => (
                                <>
                                    <TableRow>
                                        <TableCell sx={{ textAlign: 'left', color: 'blue', fontSize: '12px' }}>{param.planUse}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{param.data.planProduct}</TableCell>
                                        <TableCell>{param.data.param1}</TableCell>
                                        <TableCell>{param.data.param2}</TableCell>
                                        <TableCell>{param.data.param3}</TableCell>
                                    </TableRow>
                                </>
                            ))}

                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default TableDisplay