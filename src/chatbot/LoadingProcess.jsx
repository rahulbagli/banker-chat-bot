import React from 'react'
import LinearProgress from '@mui/material/LinearProgress';
import { Box } from '@mui/material';

function LoadingProcess() {
    return (
        <Box sx={{ width: '100%' }}>
          Processing... <LinearProgress />
        </Box>
      );
}

export default LoadingProcess