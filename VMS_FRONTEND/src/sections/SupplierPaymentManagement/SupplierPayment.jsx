import {
  Alert,
  Button,
  Card,
  Container,
  Divider,
  FormControl,
  Input,
  Menu,
  Snackbar,
  Stack,
  TextField,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
} from '@mui/material';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { Form, Link, useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';
import { hasPermission } from 'src/helpers/permissionUtils';
import ChequePayment from './Components/ChequePayment';
import CardPayment from './Components/CardPayment';
import CashPayment from './Components/CashPayment';

const SupplierPayment = () => {
  const [paymentType, setPaymentType] = useState('');

  const handlePaymentType = (event) => {
    setPaymentType(event.target.value);
  };

  const [billAmount, setBillAmount] = useState('');

  const handleBillAmountChange = (event) => {
    setBillAmount(event.target.value);
  };

  return (
    <div>
      <Container>
        <Stack direction="row" spacing={2} style={{ marginBottom: '20px' }}>
          <Typography variant="h4">Supplier Payment</Typography>
        </Stack>
        <Divider style={{ backgroundColor: '#212121', marginBottom: 10 }} />
        <Card sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} style={{ marginBottom: '20px' }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="payment-type-label">Payment Type</InputLabel>
              <Select
                labelId="payment-type-label"
                id="payment-type"
                label="Payment Type"
                value={paymentType}
                onChange={handlePaymentType}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
              </Select>
            </FormControl>

            <TextField
              id="bill-amount"
              label="Bill Amount"
              variant="outlined"
              type="number"
              value={billAmount}
              onChange={handleBillAmountChange}
            />
          </Stack>
        </Card>

        <Card sx={{ p: 2 }}>
          {paymentType === 'cheque' && <ChequePayment />}
          {paymentType === 'card' && <CardPayment />}
          {paymentType === 'cash' && <CashPayment />}
        </Card>
      </Container>
    </div>
  );
};

export default SupplierPayment;
