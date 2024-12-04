import {
    Alert,
    Button,
    Card,
    Container,
    Divider,
    Snackbar,
    Stack,
    TextField,
    Typography,
  } from '@mui/material';
  import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
  import { Link, useNavigate } from 'react-router-dom';
  import Iconify from 'src/components/iconify';
  import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
  import React, { useEffect, useState } from 'react';
  import { useSelector } from 'react-redux';
  import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';
  import { hasPermission } from 'src/helpers/permissionUtils';
  
  const CashPayment = () => {
    return (
      <div>
        <Container>
          <Typography variant="h4"> Cash Payment </Typography>
          <Card sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} style={{ marginBottom: '20px' }}>
              <TextField
                id="outlined-basic"
                label="Amount"
                variant="outlined"
                fullWidth
              />
              <TextField
                id="outlined-basic"
                label="Date"
                variant="outlined"
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2} style={{ marginBottom: '20px' }}>
              <TextField
                id="outlined-basic"
                label="Time"
                variant="outlined"
                fullWidth
              />
              <TextField
                id="outlined-basic"
                label="Transaction ID"
                variant="outlined"
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2} style={{ marginBottom: '20px' }}>
              <Button variant="contained" style={{ marginRight: '10px' }}>
                Save
              </Button>
            </Stack>
            </Card>
            
        </Container>
      </div>
    );
  };
  
  export default CashPayment;
  