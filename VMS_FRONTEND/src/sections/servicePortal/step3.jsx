import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Container,
  Snackbar,
  Alert,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice.js';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import {
  saveCustomerInfo,
  saveCustomerType,
  setCustomerUnlock,
} from 'src/redux/user/customerSlice.js';
import InputAdornment from '@mui/material/InputAdornment';

const pageVariants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: '0%', transition: { ease: 'easeInOut', duration: 0.5 } },
  exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut', duration: 0.5 } },
};

export default function Step3() {
  const { currentUser } = useSelector((state) => state.user);
  const { customer_info } = useSelector((state) => state.customer);
  const token = currentUser.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [vehiclemodel, setVehicleModel] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);

  const [formValues, setFormValues] = useState({
    first_name: {
      value: customer_info.first_name ? customer_info.first_name : '',
      error: false,
      errorMessage: 'You must enter First Name',
    },

    last_name: {
      value: customer_info.last_name ? customer_info.last_name : '',
      error: false,
      errorMessage: 'You must enter Last Name',
    },

    mobile_number: {
      value: customer_info.mobile_number ? customer_info.mobile_number : '',
      error: false,
      errorMessage: 'You must enter the Mobile Number',
    },

    address: {
      value: customer_info.address ? customer_info.address : '',
      error: false,
      errorMessage: '',
    },

    nic: {
      value: customer_info.nic ? customer_info.nic : '',
      error: false,
      errorMessage: '',
    },

    customer_type: {
      value: customer_info.customer_type ? customer_info.customer_type : '',
      error: false,
      errorMessage: 'You must slect the Customer Type',
    },

    government_order_form: {
      value: 'Yes',
      error: false,
      errorMessage: '',
    },
  });

  const customerTypes = [
    { id: 1, name: 'Government' },
    { id: 2, name: 'Private' },
    { id: 3, name: 'Company' },
  ];

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

  const checkTokenExpire = async () => {
    try {
      setAuthToken(token);
      const response = await axiosInstance.get('/api/checkuser');
      if (response.data == null) {
        dispatch(signInFailure());
        navigate('/');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const navigateToBack = () => {
    navigate('/servicePortal/step2');
  };

  

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    const skipUppercase = name === 'nic' || name === 'mobile_number' || name === 'customer_type' || name === 'government_order_form:';

    const uppercaseValue = skipUppercase ? value : value.toUpperCase();
  
    setFormValues({
      ...formValues,
      [name]: {
        ...formValues[name],
        value: uppercaseValue,
        error: false,
        errorMessage: '',
      },
    });

    if (name == 'customer_type') {
      let data = {
        customer_type: value,
      };

      dispatch(saveCustomerType(data));
    }
  };

  const handleUnlock = () => {
    dispatch(setCustomerUnlock());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formValues);

    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField].value;

      if (currentField !== 'nic' && currentField !== 'address') {
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
    }

    if (!hasValidationErrors) {
      const data = {
        first_name: formValues.first_name.value,
        last_name: formValues.last_name.value,
        mobile_number: formValues.mobile_number.value,
        nic: formValues.nic.value,
        customer_type: formValues.customer_type.value,
        address: formValues.address.value,
        government_order_form: formValues.government_order_form.value,
      };
      dispatch(saveCustomerInfo(data));
      saveOrUpdateCustomerInfo();
    }

    setFormValues(newFormValues);
  };

  const saveOrUpdateCustomerInfo = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        first_name: formValues.first_name.value,
        last_name: formValues.last_name.value,
        mobile_number: formValues.mobile_number.value,
        nic: formValues.nic.value,
        customer_type: formValues.customer_type.value,
        address: formValues.address.value,
        government_order_form: formValues.government_order_form.value,
      };

      await axiosInstance
        .post('/api/servicePortal/saveOrUpdateCustomerInfo', payload)
        .then((response) => {
          if (response.data.status === true) {
            setLoading(false);
            navigate('/servicePortal/step4');
          } else {
            setErrMsg(response.data.message);
            setLoading(false);
            setResponseErr(true);
          }
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const skipStep = () =>{
    navigate('/servicePortal/step4')
  }

  useEffect(() => {
    if (token) {
      checkTokenExpire();
    }
  }, []);

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      <Container maxWidth="md">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <Card sx={{ p: 5, margin: 'auto', width: '100%' }}>
            <Typography variant="h5" style={{ textAlign: 'center', marginBottom: '20px' }}>
              Owner's Information
            </Typography>

            <Stack spacing={2} direction="column" alignItems="center">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={customer_info.isLocked}
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    name="first_name"
                    value={formValues.first_name.value}
                    onChange={handleChange}
                    error={formValues.first_name.error}
                    helperText={formValues.first_name.error && formValues.first_name.errorMessage}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          {customer_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={customer_info.isLocked}
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    name="last_name"
                    value={formValues.last_name.value}
                    onChange={handleChange}
                    error={formValues.last_name.error}
                    helperText={formValues.last_name.error && formValues.last_name.errorMessage}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          {customer_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={customer_info.isLocked}
                    fullWidth
                    label="Mobile Number"
                    variant="outlined"
                    name="mobile_number"
                    value={formValues.mobile_number.value}
                    onChange={handleChange}
                    error={formValues.mobile_number.error}
                    helperText={
                      formValues.mobile_number.error && formValues.mobile_number.errorMessage
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          {customer_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    disabled={customer_info.isLocked}
                    fullWidth
                    label="NIC"
                    variant="outlined"
                    name="nic"
                    value={formValues.nic.value}
                    onChange={handleChange}
                    error={formValues.nic.error}
                    helperText={formValues.nic.error && formValues.nic.errorMessage}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          {customer_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl sx={{ width: '100%' }} error={formValues.customer_type.error}>
                    <InputLabel id="demo-simple-select-error-label">
                      Select a Customer Type
                    </InputLabel>
                    <Select
                      disabled={customer_info.isLocked}
                      name="customer_type"
                      labelId="demo-simple-select-error-label"
                      id="demo-simple-select-error"
                      label="Select a Customer Type"
                      onChange={handleChange}
                      defaultValue={formValues.customer_type.value || ''}
                      value={formValues.customer_type.value || ''}
                      endAdornment={
                        customer_info.isLocked && (
                          <InputAdornment position="start">
                            <Iconify icon="material-symbols:lock" />
                          </InputAdornment>
                        )
                      }
                    >
                      {customerTypes &&
                        customerTypes.map((type) => (
                          <MenuItem key={type.id} value={type.name}>
                            {type.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                      {formValues.customer_type.error && formValues.customer_type.errorMessage}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {customer_info.customer_type == 'Government' && (
                    <FormControl>
                      <FormLabel id="demo-radio-buttons-group-label">Order Form</FormLabel>
                      <RadioGroup
                        name="government_order_form"
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        defaultValue=""
                        value={formValues.government_order_form.value}
                        onChange={handleChange}
                      >
                        <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="No" control={<Radio />} label="No" />
                      </RadioGroup>
                    </FormControl>
                  )}
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    disabled={customer_info.isLocked}
                    fullWidth
                    label="Address"
                    variant="outlined"
                    name="address"
                    value={formValues.address.value}
                    onChange={handleChange}
                    error={formValues.address.error}
                    helperText={formValues.address.error && formValues.address.errorMessage}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          {customer_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>

            <Stack
              spacing={2}
              direction="row"
              alignItems="flex-end"
              justifyContent="flex-end"
              mt={2}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={navigateToBack}
                startIcon={<Iconify icon="bx:arrow-back" />}
              >
                Back
              </Button>

              {customer_info.isLocked && (
                <Button
                  variant="outlined"
                  color="success"
                  endIcon={<Iconify icon="uis:unlock" />}
                  onClick={handleUnlock}
                >
                  Unlock
                </Button>
              )}

                <Button
                  variant="outlined"
                  color="secondary"
                  endIcon={<Iconify icon="fluent:next-20-filled" />}
                  onClick={skipStep}
                >
                  Skip
                </Button>

              <LoadingButton
                loading={loading}
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Next
              </LoadingButton>
            </Stack>
          </Card>
        </div>
      </Container>

      <Snackbar
        open={responseErr}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
          {erroMsg}
        </Alert>
      </Snackbar>
    </motion.div>
  );
}
