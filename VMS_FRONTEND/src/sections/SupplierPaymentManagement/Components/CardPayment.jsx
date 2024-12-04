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
  
  const CardPayment = () => {
    return (
      <div>
        <Container>
          <Typography variant="h4">Card Payment</Typography>
          <Card sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} style={{ marginBottom: '20px' }}>
              <TextField
                id="outlined-basic"
                label="Card Number"
                variant="outlined"
                fullWidth
              />
              <TextField
                id="outlined-basic"
                label="Card Holder Name"
                variant="outlined"
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2} style={{ marginBottom: '20px' }}>
              <TextField
                id="outlined-basic"
                label="Expiry Date"
                variant="outlined"
                fullWidth
              />
              <TextField
                id="outlined-basic"
                label="CVV"
                variant="outlined"
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2} style={{ marginBottom: '20px' }}>
              <TextField
                id="outlined-basic"
                label="Amount"
                variant="outlined"
                fullWidth
              />
              <Button variant="contained" color="primary">
                Pay
              </Button>
            </Stack>
            </Card>
        </Container>
      </div>
    );
  };
  
  export default CardPayment;
  