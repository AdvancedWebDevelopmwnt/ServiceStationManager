import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepButton,
  CardActions,
  CardContent,
  Stack,
  Container,
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
import { saveVehicleInfo, saveVehicleNumber, setVehicleLock } from 'src/redux/user/vehicleSlice';
import { clearCustomerInfo, saveCustomerInfo, setCustomerlock } from 'src/redux/user/customerSlice';
import { addJobs, assginedJobs } from 'src/redux/user/jobCart';
import { assginedServiceJobs } from 'src/redux/user/ServiceJobsSlice';

const pageVariants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: '0%', transition: { ease: 'easeInOut', duration: 0.5 } },
  exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut', duration: 0.5 } },
};

export default function SearchVehicleNumber() {
  const { currentUser } = useSelector((state) => state.user);
  const { vehicle_info } = useSelector((state) => state.vehicle);
  const { serviceJobs_info } = useSelector((state) => state.serviceJobs);
  const token = currentUser.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    vehicle_number: {
      value: '',
      error: false,
      errorMessage: 'You must enter the Vehicle Number',
    },
  });

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
    navigate('/servicePortal/superviseSelection');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const isValid = /^[A-Z0-9]{1,10}$/;

    setFormValues({
      ...formValues,
      [name]: {
        ...formValues[name],
        value,
        error: !isValid,
        errorMessage: isValid ? '' : 'Invalid Vehicle Number',
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField].value;

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
      searchVehicleNumber();
    }

    setFormValues(newFormValues);
  };

  const searchVehicleNumber = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        vehicle_number: formValues.vehicle_number.value,
      };

      await axiosInstance
        .post('/api/servicePortal/searchVehicleNumber', payload)
        .then((response) => {
          setLoading(false);
          if (response.data.status === true) {
            const customerdata = {
              first_name: response.data.customer ? response.data.customer.first_name : null,
              email: response.data.customer ? response.data.customer.email : null,
              last_name: response.data.customer ? response.data.customer.last_name : null,
              mobile_number: response.data.customer ? response.data.customer.mobile_number : null,
              customer_type: response.data.customer ? response.data.customer.customer_type : null,
              address: response.data.customer ? response.data.customer.address : null,
              // government_order_form: response.data.customer.government_order_form
            };

            const vehicleData = {
              vehicle_number: response.data.vehicle.vehicle_number,
              vehicle_brand: response.data.vehicle.brand_id,
              vehicle_model: response.data.vehicle.vehicle_model,
              year_of_made: response.data.vehicle.year_of_made,
              engine_capacity: response.data.vehicle.engine_capacity,
              fuel_type: response.data.vehicle.fuel_type,
            };

            dispatch(saveCustomerInfo(customerdata));
            dispatch(saveVehicleInfo(vehicleData));
            // dispatch(assginedJobs(response.data.job));

            navigate('/servicePortal/vehicleSupervise/vehicleInfo');
          } else {
            setErrMsg(response.data.message);
            dispatch(clearCustomerInfo());
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
              Search the Vehicle Number
            </Typography>

            <Stack spacing={2} direction="column" alignItems="center">
              <TextField
                fullWidth
                label="Vehicle Number"
                variant="outlined"
                name="vehicle_number"
                value={formValues.vehicle_number.value}
                onChange={handleChange}
                error={formValues.vehicle_number.error}
                helperText={
                  formValues.vehicle_number.error && formValues.vehicle_number.errorMessage
                }
              />
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
