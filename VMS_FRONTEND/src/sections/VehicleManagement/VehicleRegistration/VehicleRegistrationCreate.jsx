import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Grid,
  Container,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Divider,
  CardActions,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Snackbar,
  Alert,
} from '@mui/material';

import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import {
  saveVehicleInfo,
  saveVehicleNumber,
  setVehicleLock,
  setVehicleUnlock,
} from 'src/redux/user/vehicleSlice';
import { saveCustomerInfo, setCustomerlock } from 'src/redux/user/customerSlice';


export default function VehicleRegistrationCreate() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const [errMessage, setErrorMessage] = useState('');
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const token = currentUser.token;
  const [vehicleBrands, setVehicleBrands] = useState([]);

  const [formValues, setFormValues] = useState({
    first_name: {
      value: '',
      error: false,
      errorMessage: 'First Name is required',
    },
    last_name: {
      value: '',
      error: false,
      errorMessage: 'Last Name is required',
    },
    nic: {
      value: '',
      error: false,
      errorMessage: '',
    },
    mobile_number: {
      value: '',
      error: false,
      errorMessage: '',
    },

    address: {
      value: '',
      error: false,
      errorMessage: '',
    },

    vehicle_number: {
      value: '',
      error: false,
      errorMessage: '',
    },

    vehicle_brand: {
      value: '',
      error: false,
      errorMessage: '',
    },

    vehicle_model: {
      value: '',
      error: false,
      errorMessage: '',
    },

    year_of_made: {
      value: '',
      error: false,
      errorMessage: '',
    },

    engine_capacity: {
      value: '',
      error: false,
      errorMessage: '',
    },

    fuel_type: {
      value: '',
      error: false,
      errorMessage: '',
    },

    remark: {
      value: '',
      error: false,
      errorMessage: '',
    },

    millage: {
      value: '',
      error: false,
      errorMessage: '',
    },
  });

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

  const fuelTypes = [
    { id: 1, name: 'Patrol' },
    { id: 2, name: 'Diesel' },
    { id: 3, name: 'Hybrid' },
    { id: 4, name: 'Electric' },
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

  const handleInputChange = (e, setRecord) => {
    setRecord((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const getAllBrand = async () => {
    try {
      setAuthToken(token);

      await axiosInstance.get('/api/brand').then((response) => {
        if (response.data.status == true) {
          setVehicleBrands(response.data.brand);
        } else {
          setErrMsg(response.data.message);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

 

    setFormValues({
      ...formValues,
      [name]: {
        ...formValues[name],
        value,
        error: false,
        errorMessage: '',
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      'first_name',
      'last_name',
      'mobile_number',
      'vehicle_number',
      'vehicle_model',
      'vehicle_brand',
      'year_of_made',
    ];
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

    for (let index = 0; index < requiredFields.length; index++) {
      const currentField = requiredFields[index];
      const currentValue = formValues[currentField].value;

      if (currentValue === '') {
        newFormValues = {
          ...newFormValues,
          [currentField]: {
            ...newFormValues[currentField],
            error: true,
            errorMessage: 'This field is required',
          },
        };
        hasValidationErrors = true;
      }
    }

    if (!hasValidationErrors) {
      CreateRecords();
    }

    setFormValues(newFormValues);
  };

  const CreateRecords = async () => {
    const payload = {
      customerRecord: {
        first_name: formValues.first_name.value,
        last_name: formValues.last_name.value,
        nic: formValues.nic.value,
        mobile_number: formValues.mobile_number.value,
        address: formValues.address.value,
      },

      vehicleRecord: {
        vehicle_number: formValues.vehicle_number.value,
        vehicle_brand: formValues.vehicle_brand.value,
        vehicle_model: formValues.vehicle_model.value,
        year_of_made: formValues.year_of_made.value,
        engine_capacity: formValues.engine_capacity.value,
        fuel_type: formValues.fuel_type.value,
      },
    };

    try {
      setAuthToken(token);
      setLoading(true);
      await axiosInstance.post('/api/register/vehicleRegistration', payload).then((response) => {
        if (response.data.status === true) {
          setResponseSuccess(true);
          setLoading(false);
          setFormValues(initialFormValues);
        } else {
          setLoading(false);
          setResponseErr(true);
          setErrorMessage(response.data.message);
        }
      });
    } catch (err) {
      setResponseErr(true);
      setErrorMessage("Couldn't save the record");
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      checkTokenExpire();
      getAllBrand();
    }
  }, []);

  return (
    <Container maxWidth="lg">
      <form noValidate onSubmit={handleSubmit}>
        <Card>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
              <Button onClick={() => window.history.back()} color="primary">
                Back
              </Button>
            </div>
            <Typography variant="h5">Create Customer Record</Typography>
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="First Name"
                  name="first_name"
                  variant="outlined"
                  required
                  value={formValues.first_name.value}
                  onChange={handleChange}
                  error={formValues.first_name.error}
                  helperText={formValues.first_name.error && formValues.first_name.errorMessage}
                />
              </Grid>

              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="Last Name"
                  name="last_name"
                  variant="outlined"
                  required
                  value={formValues.last_name.value}
                  onChange={handleChange}
                  error={formValues.last_name.error}
                  helperText={formValues.last_name.error && formValues.last_name.errorMessage}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="Mobile Number"
                  name="mobile_number"
                  variant="outlined"
                  required
                  value={formValues.mobile_number.value}
                  onChange={handleChange}
                  error={formValues.mobile_number.error}
                  helperText={
                    formValues.mobile_number.error && formValues.mobile_number.errorMessage
                  }
                />
              </Grid>

              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="NIC"
                  name="nic"
                  variant="outlined"
                  value={formValues.nic.value}
                  onChange={handleChange}
                  error={formValues.nic.error}
                  helperText={formValues.nic.error && formValues.nic.errorMessage}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="Address"
                  name="address"
                  variant="outlined"
                  value={formValues.address.value}
                  onChange={handleChange}
                  error={formValues.address.error}
                  helperText={formValues.address.error && formValues.address.errorMessage}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card style={{ marginTop: '10px' }}>
          <CardContent>
            <Typography variant="h5">Create Vehicle Record</Typography>
            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="Vehicle Number"
                  name="vehicle_number"
                  variant="outlined"
                  required
                  value={formValues.vehicle_number.value}
                  onChange={handleChange}
                  error={formValues.vehicle_number.error}
                  helperText={
                    formValues.vehicle_number.error && formValues.vehicle_number.errorMessage
                  }
                />
              </Grid>

              <Grid item md={6}>
                <FormControl sx={{ width: '100%' }} error={formValues.vehicle_brand.error}>
                  <InputLabel id="demo-simple-select-error-label">
                    Select a Vehicle Brand
                  </InputLabel>
                  <Select
                    name="vehicle_brand"
                    labelId="demo-simple-select-error-label"
                    id="demo-simple-select-error"
                    label="Select a Vehicle Category"
                    defaultValue={formValues.vehicle_brand.value}
                    value={formValues.vehicle_brand.value || ''}
                    onChange={(e) => {
                      handleChange(e);
                      // getAllModelRelatedToBrand(e);
                    }}
                  >
                    {vehicleBrands &&
                      vehicleBrands.map((brand) => (
                        <MenuItem key={brand.name} value={brand.id}>
                          {brand.name}
                        </MenuItem>
                      ))}
                  </Select>

                  <FormHelperText>
                    {formValues.vehicle_brand.error && formValues.vehicle_brand.errorMessage}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="Vehicle Model"
                  name="vehicle_model"
                  variant="outlined"
                  required
                  value={formValues.vehicle_model.value}
                  onChange={handleChange}
                  error={formValues.vehicle_model.error}
                  helperText={
                    formValues.vehicle_model.error && formValues.vehicle_model.errorMessage
                  }
                />
              </Grid>
              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="Year of Make"
                  name="year_of_made"
                  variant="outlined"
                  required
                  value={formValues.year_of_made.value}
                  onChange={handleChange}
                  error={formValues.year_of_made.error}
                  helperText={formValues.year_of_made.error && formValues.year_of_made.errorMessage}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} style={{ marginTop: '10px' }}>
              <Grid item md={6}>
                <TextField
                  fullWidth={true}
                  label="Engine Capacity"
                  name="engine_capacity"
                  variant="outlined"
                  value={formValues.engine_capacity.value}
                  onChange={handleChange}
                  error={formValues.engine_capacity.error}
                  helperText={
                    formValues.engine_capacity.error && formValues.engine_capacity.errorMessage
                  }
                />
              </Grid>
              <Grid item md={6}>
                <FormControl sx={{ width: '100%' }} error={formValues.fuel_type.error}>
                  <InputLabel id="demo-simple-select-error-label">Select a Fuel Type</InputLabel>
                  <Select
                    name="fuel_type"
                    labelId="demo-simple-select-error-label"
                    id="demo-simple-select-error"
                    label="Select a Fuel type"
                    onChange={handleChange}
                    defaultValue=""
                    value={formValues.fuel_type.value}
                  >
                    {fuelTypes &&
                      fuelTypes.map((type) => (
                        <MenuItem key={type.id} value={type.name}>
                          {type.name}
                        </MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>
                    {formValues.fuel_type.error && formValues.fuel_type.errorMessage}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>

          <CardActions>
            <LoadingButton
              loading={loading}
              style={{ width: '50%' }}
              type="submit"
              variant="contained"
              color="primary"
            >
              Save Records
            </LoadingButton>
          </CardActions>
        </Card>
      </form>

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
          Vehicle successfully Registered
        </Alert>
      </Snackbar>

      <Snackbar
        open={responseErr}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
