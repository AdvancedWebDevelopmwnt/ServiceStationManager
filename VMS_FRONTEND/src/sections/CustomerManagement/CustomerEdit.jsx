import {
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Select,
} from '@mui/material';
import Radio from '@mui/material/Radio';
import React, { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

export default function CustomerEdit() {

  const [loading, setLoading] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const params = useParams();
  const navigate = useNavigate();
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
    orderForm: { value: '', error: false, errorMessage: 'Order Form is required' },
  });

  const customerTypes = [
    { id: 'Government', name: 'Government' },
    { id: 'Private', name: 'Private' },
    { id: 'Company', name: 'Company' },
  ];

  const formOrderTypes = [
    { id: 0, name: 'No' },
    { id: 1, name: 'Yes' },
  ];

  //-----------------------------------------------------------------------------------------------

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

  const updateFormValues = (data) => {
    console.log(data);
    const newFormValues = { ...formValues };

    Object.keys(newFormValues).forEach((key) => {
      newFormValues[key] = {
        ...newFormValues[key],
        value: data[key] || '',
        error: false,
        errorMessage: '',
      };
    });

    setFormValues(newFormValues);
  };

  const getCutomerData = async () => {
    setAuthToken(token);

    const response = await axiosInstance.get(`/api/customer/show/${params.id}`);
    if (response.data.status === true) {
      console.log(response.data);

      const CustomerData = response.data.customer;
      CustomerData.orderForm = CustomerData.government_order_form == 1 ? 'Yes' : 'No';

      updateFormValues(CustomerData);
    } else {
      setResponseErr(true);
    }
    console.log(response);
  };

  // ----------------- submit form values ----------------
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
      updateCustomer();
    }
    setFormValues(newFormValues);
  };


  // --------------------- update customer --------------------
  const updateCustomer = async () => {
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
      await axiosInstance.post(`/api/customer/${params.id}`, payload).then((response) => {
        if (response.data.status === true) {
          setResponseSuccess(true);
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

  useEffect(() => {
    getCutomerData();
  }, []);


  console.log(formValues);

  //-------------------------------------------------------------------------------------------------

  return (
    <div>
      <Card>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" style={{ marginBottom: '20px' }}>
              Update a Customer
            </Typography>
            <Button onClick={() => window.history.back()} color="primary">
              Back
            </Button>
          </div>
          <form noValidate onSubmit={handleSubmit}>
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

              <FormControl sx={{ width: '50%' }} error={formValues.type.error}>
                <InputLabel size="small" id="demo-simple-select-error-label">
                  Type
                </InputLabel>
                <Select
                  name="type"
                  size="small"
                  labelId="demo-simple-select-error-label"
                  id="demo-simple-select-error"
                  label="Type"
                  onChange={handleChange}
                  defaultValue=""
                  value={formValues.type.value}
                >
                  {customerTypes &&
                    customerTypes.map((customerType) => (
                      <MenuItem key={customerType.id} value={customerType.name}>
                        {customerType.name}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {formValues.type.error && formValues.type.errorMessage}
                </FormHelperText>
              </FormControl>

              {formValues.type.value === 'Government' && (
                <FormControl>
                  <FormLabel>Order Form</FormLabel>
                  <RadioGroup
                    name="orderForm"
                    value={formValues.orderForm.value}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio />} label="No" />
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
                Update
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
          Customer has been Updated Successfully
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

