import {
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Divider,
} from '@mui/material';
import React, {  useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';
import Radio from '@mui/material/Radio';
import { styled } from '@mui/material/styles';



export default function CustomerCreate(){
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const [formValues, setFormValues] = useState({
    first_name: {
      value: '',
      error: false,
      errorMessage: ' First Name is required',
    },
    last_name: {
      value: '',
      error: false,
      errorMessage: 'Last Name is required',
    },
    mobile_number: {
      value: '',
      error: false,
      errorMessage: 'Mobile Number is required',
    },
    email: {
      value: '',
      error: false,
      errorMessage: 'Email is required',
    },
    nic: {
      value: '',
      error: false,
      errorMessage: 'NIC is required',
    },
    address: {
      value: null,
      error: false,
      errorMessage: 'Address is required',
    },
    type: {
      value: null,
      error: false,
      errorMessage: 'Type is required',
    },
    orderForm: { value: 'No', error: false, errorMessage: 'Order Form is required' },
  });

  //-----------------------------------------------------------------------------------------------

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

    if (name === 'first_name') {
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
    } else if (name === 'last_name') {
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
    } else if (name === 'mobile_number') {
      if (value != '') {
        isValid = /^\d{10}$/.test(value);
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
    } else if (name === 'email') {

        // Special handling for 'email' field
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

        setFormValues({
          ...formValues,
          [name]: {
            ...formValues[name],
            value,
            error: !isValid,
            errorMessage: isValid ? '' : 'Enter a valid email address',
          },
        });

    } else if (name === 'nic') {
      const isValid = /^[vV0-9-]+$/.test(value);
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
    } else if (name === 'address') {
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
    } else if (name === 'type') {
      isValid = value !== '';
      errorMessage = isValid ? '' : 'Select a type';
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'orderForm') {
      isValid = value !== '';
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
        first_name: formValues.first_name.value,
        last_name: formValues.last_name.value,
        mobile_number: formValues.mobile_number.value,
        email: formValues.email.value,
        nic: formValues.nic.value,
        address: formValues.address.value,
        type: formValues.type.value,
        government_order_form: formValues.orderForm.value,
      };
      await axiosInstance.post('/api/customer', payload).then((response) => {
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
              Create a new Customer
            </Typography>
            <Button onClick={() => window.history.back()} color="primary">
              Back
            </Button>
          </div>


          <form noValidate onSubmit={handleSubmit}>
            <Root>
                <Divider textAlign="left"></Divider>
            </Root>
            <Stack spacing={2}>
              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter First Name"
                label="First Name"
                name="first_name"
                variant="outlined"
                required
                value={formValues.first_name.value}
                onChange={handleChange}
                error={formValues.first_name.error}
                helperText={formValues.first_name.error && formValues.first_name.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Last Name"
                label="Last Name"
                name="last_name"
                variant="outlined"
                required
                value={formValues.last_name.value}
                onChange={handleChange}
                error={formValues.last_name.error}
                helperText={formValues.last_name.error && formValues.last_name.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Mobile Number"
                label="Mobile Number"
                name="mobile_number"
                variant="outlined"
                required
                value={formValues.mobile_number.value}
                onChange={handleChange}
                error={formValues.mobile_number.error}
                helperText={formValues.mobile_number.error && formValues.mobile_number.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Email"
                label="Email"
                name="email"
                variant="outlined"
                required
                value={formValues.email.value}
                onChange={handleChange}
                error={formValues.email.error}
                helperText={formValues.email.error && formValues.email.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter NIC Number"
                label="NIC Number"
                name="nic"
                variant="outlined"
                value={formValues.nic.value}
                onChange={handleChange}
                error={formValues.nic.error}
                helperText={formValues.nic.error && formValues.nic.errorMessage}
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

              <FormControl sx={{ width: '50%' }} error={formValues.type.error}>
                <InputLabel size="small">Type</InputLabel>
                <Select
                  required
                  name="type"
                  size="small"
                  label="Select a Vehicle Category"
                  onChange={handleChange}
                  value={formValues.type.value}
                >
                  <MenuItem value={'government'}>Government</MenuItem>
                  <MenuItem value={'Private'}>Cash</MenuItem>
                  <MenuItem value={'Company'}>Credit</MenuItem>
                </Select>
                <FormHelperText>
                  {formValues.type.error && formValues.type.errorMessage}
                </FormHelperText>
              </FormControl>

              {formValues.type.value === 'government' && (
                <FormControl>
                  <FormLabel>Order Form</FormLabel>
                  <RadioGroup
                    name="orderForm"
                    value={formValues.orderForm.value}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              )}

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
          Customer has been created Successfully
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


