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
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import {
  clearVehicleInfo,
  saveVehicleInfo,
  saveVehicleNumber,
  setVehicleUnlock,
} from 'src/redux/user/vehicleSlice';
import InputAdornment from '@mui/material/InputAdornment';

const pageVariants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: '0%', transition: { ease: 'easeInOut', duration: 0.5 } },
  exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut', duration: 0.5 } },
};

export default function Step2() {
  const { currentUser } = useSelector((state) => state.user);
  const { vehicle_info } = useSelector((state) => state.vehicle);
  const token = currentUser.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [vehicleBrands, setVehicleBrands] = useState([]);

  const [formValues, setFormValues] = useState({
    vehicle_number: {
      value: vehicle_info.vehicle_number,
      error: false,
      errorMessage: 'You must enter the vehicle number',
    },

    model: {
      value: vehicle_info.vehicle_model ? vehicle_info.vehicle_model : '',
      error: false,
      errorMessage: 'You must enter vehicle model',
    },

    year_of_made: {
      value: vehicle_info.year_of_made ? vehicle_info.year_of_made : '',
      error: false,
      errorMessage: 'You must enter year of made',
    },

    engine_capacity: {
      value: vehicle_info.engine_capacity ? vehicle_info.engine_capacity : '',
      error: false,
      errorMessage: 'You must enter engine capacity',
    },

    fuel_type: {
      value: vehicle_info.fuel_type ? vehicle_info.fuel_type : '',
      error: false,
      errorMessage: 'You must select Fuel Type',
    },

    brand: {
      value: vehicle_info.vehicle_brand ? vehicle_info.vehicle_brand : '',
      error: false,
      errorMessage: 'You must select vehicle Brand',
    },

    remark: {
      value: vehicle_info.remark ? vehicle_info.remark : '',
      error: false,
      errorMessage: '',
    },

    millage: {
      value: vehicle_info.millage ? vehicle_info.millage : '',
      error: false,
      errorMessage: '',
    },
  });

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

  const navigateToBack = () => {
    dispatch(clearVehicleInfo());
    navigate('/servicePortal/step1');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    const skipUppercase = name === 'brand' || name === 'year_of_made' || name === 'fuel_type';
  
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const requiredFields = ['vehicle_number'];
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
      const data = {
        vehicle_number: vehicle_info.vehicle_number,
        vehicle_brand: formValues.brand.value,
        vehicle_model: formValues.model.value,
        year_of_made: formValues.year_of_made.value,
        engine_capacity: formValues.engine_capacity.value,
        fuel_type: formValues.fuel_type.value,
        remark: formValues.remark.value,
        millage: formValues.millage.value,
      };
      dispatch(saveVehicleInfo(data));
      navigate('/servicePortal/step3');
    }
  
    setFormValues(newFormValues);
  };

  

  const getAllBrand = async () => {
    try {
      setAuthToken(token);

      await axiosInstance.get('/api/servicePortal/getAllBrands').then((response) => {
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

  const handleUnlock = () => {
    dispatch(setVehicleUnlock(false));
  };

  useEffect(() => {
    if (token) {
      checkTokenExpire();
      getAllBrand();
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
              Vehicle's Information
            </Typography>

            <Stack spacing={2} direction="column" alignItems="center">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    variant="outlined"
                    name="vehicle_number"
                    value={formValues.vehicle_number.value}
                    disabled
                    inputProps={{
                      endadornment: (
                        <InputAdornment position="start">
                          {vehicle_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <FormControl sx={{ width: '100%' }} error={formValues.brand.error}>
                    <InputLabel id="demo-simple-select-error-label">
                      Select a Vehicle Brand
                    </InputLabel>
                    <Select
                      disabled={vehicle_info.isLocked}
                      name="brand"
                      labelId="demo-simple-select-error-label"
                      id="demo-simple-select-error"
                      label="Select a Vehicle Category"
                      onChange={(e) => {
                        handleChange(e);
                        // getAllModelRelatedToBrand(e);
                      }}
                      defaultValue={formValues.brand.value || ''}
                      value={formValues.brand.value || ''}
                      endadornment={
                        vehicle_info.isLocked && (
                          <InputAdornment position="start">
                            <Iconify icon="material-symbols:lock" />
                          </InputAdornment>
                        )
                      }
                    >
                      {vehicleBrands &&
                        vehicleBrands.map((brand) => (
                          <MenuItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                      {formValues.brand.error && formValues.brand.errorMessage}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>

              {/* <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                    <Autocomplete
                    fullWidth
                    disabled={vehicle_info.isLocked}
                    name='model'
                    options={vehiclemodel}
                    getOptionLabel={(option) => option.label}
                    value={vehiclemodel.find((item) => item.value === formValues.model.value) || null}
                    onChange={ModelChange}        
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Select a Vehicle Model"
                        variant="outlined"
                        required
                        error={formValues.model.error}
                        helperText={formValues.model.error && formValues.model.errorMessage}
                       
                      />
                    )}
                  />
                </Grid>
              </Grid> */}
               <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <TextField
                    fullWidth
                    label="Vehicle Model"
                    variant="outlined"
                    name="model"
                    value={formValues.model.value}
                    onChange={handleChange}
                    error={formValues.model.error}
                    helperText={formValues.model.error && formValues.model.errorMessage}
                    inputProps={{
                      endadornmentt: (
                        <InputAdornment position="start">
                          {vehicle_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <FormControl sx={{ width: '100%' }} error={formValues.fuel_type.error}>
                    <InputLabel id="demo-simple-select-error-label">Select a Fuel Type</InputLabel>
                    <Select
                      disabled={vehicle_info.isLocked}
                      name="fuel_type"
                      labelId="demo-simple-select-error-label"
                      id="demo-simple-select-error"
                      label="Select a Fuel type"
                      onChange={handleChange}
                      defaultValue=""
                      value={formValues.fuel_type.value}
                      endAdornment={
                        vehicle_info.isLocked && (
                          <InputAdornment position="start">
                            <Iconify icon="material-symbols:lock" />
                          </InputAdornment>
                        )
                      }
                      inputProps={{
                        endadornment: (
                          <InputAdornment position="start">
                            {vehicle_info.isLocked && <Iconify icon="material-symbols:lock" />}
                          </InputAdornment>
                        ),
                      }}
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

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <TextField
                    fullWidth
                    label="Year of Make"
                    variant="outlined"
                    name="year_of_made"
                    value={formValues.year_of_made.value}
                    onChange={handleChange}
                    inputProps={{
                      endadornmentt: (
                        <InputAdornment position="start">
                          {vehicle_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <TextField
                    fullWidth
                    label="Engine Capacity"
                    variant="outlined"
                    name="engine_capacity"
                    value={formValues.engine_capacity.value}
                    onChange={handleChange}
                    inputProps={{
                      endadornmentt: (
                        <InputAdornment position="start">
                          {vehicle_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <TextField
                    fullWidth
                    label="Reamrk"
                    variant="outlined"
                    name="remark"
                    value={formValues.remark.value}
                    onChange={handleChange}
                    inputProps={{
                      endadornmentt: (
                        <InputAdornment position="start">
                          {vehicle_info.isLocked && <Iconify icon="material-symbols:lock" />}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <TextField
                    fullWidth
                    label="Millage"
                    variant="outlined"
                    name="millage"
                    value={formValues.millage.value}
                    onChange={handleChange}
                    inputProps={{
                      endadornment: (
                        <InputAdornment position="start">
                          {vehicle_info.isLocked && <Iconify icon="material-symbols:lock" />}
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
