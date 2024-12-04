import {
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';

const SupplierCreate = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const [formValues, setFormValues] = useState({
    name: {
      value: '',
      error: false,
      errorMessage: ' Name is required',
    },
    brand_name: {
      value: '',
      error: false,
      errorMessage: 'Brand Name is required',
    },
    contact_no: {
      value: '',
      error: false,
      errorMessage: 'Contact Number is required',
    },
    address: {
      value: '',
      error: false,
      errorMessage: 'Address is required',
    },
    email: {
      value: '',
      error: false,
      errorMessage: 'Email is required',
    },
    bank_name: {
      value: null,
      error: false,
      errorMessage: 'Bank Name is required',
    },
    branch_name: {
      value: null,
      error: false,
      errorMessage: 'Branch of the Bank is required',
    },
    account_number: {
      value: null,
      error: false,
      errorMessage: 'Account Number of the Bank is required',
    },
  });

  //-----------------------------------------------------------------------------------------------

  //form divider
  const Root = styled('div')(({ theme }) => ({
    width: '100%',
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    '& > :not(style) ~ :not(style)': {
      marginTop: theme.spacing(2),
    },
  }));

  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setResponseSuccess(false);
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setResponseErr(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let isValid = true;
    let errorMessage = '';

    if (name === 'name') {
      if (value != '') {
        isValid = /^[a-zA-Z ]+$/.test(value) && !/  {0,}/.test(value);
        errorMessage = isValid ? '' : 'Only letters are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'brand_name') {
      if (value != '') {
        isValid = /^[a-zA-Z ]+$/.test(value);
        errorMessage = isValid ? '' : 'Only letters are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    }  else if (name === 'contact_no') {
      if (value.trim() !== '') {
        // Check if the value contains only digits and has exactly 10 digits
        isValid = /^\d{0,10}$/.test(value); // Allow up to 10 digits
        if (!isValid || /\s  {1,}/.test(value)) {
          errorMessage = isValid ? '' : 'Phone Number is Invalid';
          isValid = false;
        }
      } else {
        isValid = false;
        errorMessage = 'Phone number is required';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    }
    
 else if (name === 'address') {
      const isValid = value.trim() !== '';
      errorMessage = isValid ? '' : 'Only letters and numbers are allowed';
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'email') {

        // Special handling for 'email' field
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

        setFormValues({
          ...formValues,
          [name]: {
            ...formValues[name],
            value,
            error: !isValid,
            errorMessage : isValid ? '' : 'Email is Invalid'
          },
        });

    } else if (name === 'bank_name') {
      if (value != '') {
        isValid = /^[a-zA-Z ]+$/.test(value);
        errorMessage = isValid ? '' : 'Only letters are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    }  else if (name === 'branch_name') {
      if (value != '') {
        isValid = /^[a-zA-Z ]+$/.test(value);
        errorMessage = isValid ? '' : 'Only letters are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'account_number') {
      if (value != '') {
        isValid = /^[0-9\b]+$/.test(value);
        errorMessage = isValid ? '' : 'Only Numbers are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField].value;
      console.log(currentValue);

      if (currentValue === '') {
        newFormValues = {
          ...newFormValues,
          [currentField]: {
            ...newFormValues[currentField],
            error: true,
          },
        };
        hasValidationErrors = true;
      }else if (/\s{2,}/.test(currentValue)) {
        newFormValues = {
          ...newFormValues,
          [currentField]: {
            ...newFormValues[currentField],
            error: true,
            errorMessage: 'Multiple spaces are not allowed',
          },
        };
        hasValidationErrors = true;
      }
    }
    if (!hasValidationErrors) {
      createCustomer();
    }
    setFormValues(newFormValues);
  };

  const resetFormValues = () => {
    const initialFormValues = Object.fromEntries(
      Object.entries(formValues).map(([key, value]) => [
        key,
        {
          value: '',
          error: false,
          errorMessage: `${key} is required`,
        },
      ])
    );
    setFormValues(initialFormValues);
  };

  const createCustomer = async () => {
    try {
      setAuthToken(token);
      setLoading(true);
      const payload = {
        name: formValues.name.value,
        brand_name: formValues.brand_name.value,
        contact_no: formValues.contact_no.value,
        address: formValues.address.value,
        email: formValues.email.value,
        bank_name: formValues.bank_name.value,
        branch_name: formValues.branch_name.value,
        account_number: formValues.account_number.value,
      };
      await axiosInstance.post('/api/supplier', payload).then((response) => {
        if (response.data.status === true) {
          setResponseSuccess(true);
          resetFormValues();
          setLoading(false);
        } else {
          setLoading(false);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  //-------------------------------------------------------------------------------------------------

  return (
    <div>
      <Card>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" style={{ marginBottom: '20px' }}>
              Create a new Supplier
            </Typography>
            <Button onClick={() => window.history.back()} color="primary">
              Back
            </Button>
          </div>
          <form noValidate onSubmit={handleSubmit}>
            <Root>
              <Divider textAlign="left">Supplier Details</Divider>
            </Root>
            <Stack spacing={2}>
              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Name"
                label=" Name"
                name="name"
                variant="outlined"
                required
                value={formValues.name.value}
                onChange={handleChange}
                error={formValues.name.error}
                helperText={formValues.name.error && formValues.name.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Brand Name"
                label="Brand Name"
                name="brand_name"
                variant="outlined"
                required
                value={formValues.brand_name.value}
                onChange={handleChange}
                error={formValues.brand_name.error}
                helperText={formValues.brand_name.error && formValues.brand_name.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Contact Number"
                label="Contact Number"
                name="contact_no"
                variant="outlined"
                required
                value={formValues.contact_no.value}
                onChange={handleChange}
                error={formValues.contact_no.error}
                helperText={
                  formValues.contact_no.error && formValues.contact_no.errorMessage
                }
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Address"
                label="Address"
                name="address"
                variant="outlined"
                minRows={5}
                value={formValues.address.value}
                onChange={handleChange}
                error={formValues.address.error}
                helperText={formValues.address.error && formValues.address.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Email"
                label="Email"
                name="email"
                variant="outlined"
                value={formValues.email.value}
                onChange={handleChange}
                error={formValues.email.error}
                helperText={formValues.email.error && formValues.email.errorMessage}
              />
              <Root>
                <Divider textAlign="left">Supplier Bank Details</Divider>
              </Root>
              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Bank Name"
                label="Bank Name"
                name="bank_name"
                variant="outlined"
                required
                value={formValues.bank_name.value}
                onChange={handleChange}
                error={formValues.bank_name.error}
                helperText={formValues.bank_name.error && formValues.bank_name.errorMessage}
              />


              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter branch of the bank"
                label="Branch of the bank"
                name="branch_name"
                variant="outlined"
                required
                value={formValues.branch_name.value}
                onChange={handleChange}
                error={formValues.branch_name.error}
                helperText={
                  formValues.branch_name.error && formValues.branch_name.errorMessage
                }
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Account number"
                label="Account Number"
                name="account_number"
                variant="outlined"
                required
                value={formValues.account_number.value}
                onChange={handleChange}
                error={formValues.account_number.error}
                helperText={
                  formValues.account_number.error && formValues.account_number.errorMessage
                }
              />

              <LoadingButton
                loading={loading}
                style={{ width: '50%' }}
                type="submit"
                variant="contained"
                color="primary"
              >
                Create
              </LoadingButton>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={responseSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Supplier has been created Successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={responseErr}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
          Something went wrong!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SupplierCreate;
