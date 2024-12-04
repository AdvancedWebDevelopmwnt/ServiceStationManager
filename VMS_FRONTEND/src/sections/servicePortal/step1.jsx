import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Button, TextField, Stepper, Step, StepButton, CardActions, CardContent, Stack, Container, Snackbar, Alert } from '@mui/material';

import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { saveVehicleInfo, saveVehicleNumber, setVehicleLock, setVehicleUnlock } from 'src/redux/user/vehicleSlice';
import { saveCustomerInfo, setCustomerlock } from 'src/redux/user/customerSlice';


const pageVariants = {
  initial: { opacity: 0, x: "-100%" },
  animate: { opacity: 1, x: "0%", transition: { ease: "easeInOut", duration: 0.5 } },
  exit: { opacity: 0, x: "100%", transition: { ease: "easeInOut", duration: 0.5 } },
};

export default function Step1() {
  const { currentUser } = useSelector((state) => state.user);
  const { vehicle_info } = useSelector((state) => state.vehicle);
  const token = currentUser.token; 
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    vehicle_number: {
      value: '',
      error: false,
      errorMessage: 'You must enter the Vehicle Number',
    },
  })

 


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
    try{
      setAuthToken(token)
      const response = await axiosInstance.get('/api/checkuser')
     if(response.data == null){
       dispatch(signInFailure())
       navigate('/')
     }
    }catch(err){
      console.log(err)
    }
  }

  const navigateToBack = () => {
      navigate('/servicePortal/welcome')
  }

  

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    const uppercaseValue = value.toUpperCase();

    setFormValues({
      ...formValues,
      [name]: {
        ...formValues[name],
        value: uppercaseValue, 
        error: false, 
        errorMessage: ''
      },
    });
  }
  


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
      searchVehicleServiceStatus()
      // searchVehicleNumber();
    }

    setFormValues(newFormValues);
  };

  const searchVehicleServiceStatus = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        vehicle_number: formValues.vehicle_number.value
      };

      await axiosInstance
        .post('/api/servicePortal/searchVehicleServiceStatus', payload)
        .then((response) => {
          if (response.data.status === true) {
            setErrMsg(response.data.message)
            setLoading(false)
            setResponseErr(true);
          }
          else {   
            setLoading(false);
            dispatch(saveVehicleNumber(formValues.vehicle_number.value))
            dispatch(setVehicleUnlock())
            navigate('/servicePortal/step2')
          }   
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  const searchVehicleNumber = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        vehicle_number: formValues.vehicle_number.value
      };

      await axiosInstance
        .post('/api/servicePortal/searchVehicleNumber', payload)
        .then((response) => {
          if (response.data.status === true) {
            setLoading(false);
            if(response.data.vehicle != null) {
            
              dispatch(saveVehicleNumber(response.data.vehicle.vehicle_number))
             
              const data = { 
                vehicle_brand: response.data.vehicle.brand_id,
                vehicle_model: response.data.vehicle.vehicle_model,
                year_of_made: response.data.vehicle.year_of_made,
                engine_capacity: response.data.vehicle.engine_capacity,
                fuel_type: response.data.vehicle.fuel_type,
                vehicle_number: response.data.vehicle.vehicle_number
                
              }

              dispatch(saveVehicleInfo(data))
              dispatch(setVehicleLock())

             

              if(response.data.customer != null){
                const customerdata = { 
                  first_name:  response.data.customer.first_name,
                  last_name: response.data.customer.last_name,
                  mobile_number: response.data.customer.mobile_number,
                  nic: response.data.customer.nic,
                  customer_type: response.data.customer.type,
                  address: response.data.customer.address,
                }
  
                dispatch(saveCustomerInfo(customerdata))
                dispatch(setCustomerlock())
              }

              navigate('/servicePortal/step2')
            
            }else{
              dispatch(saveVehicleNumber(formValues.vehicle_number.value))
              dispatch(setVehicleUnlock())
              navigate('/servicePortal/step2')
            }
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
  }

  useEffect(() => {
    if(token){
      checkTokenExpire()
    }
  },[])

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      <Container maxWidth="md">
        <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center',minHeight: '100vh', }}>
          <Card sx={{ p: 5, margin: 'auto', width: '100%' }}>
            <Typography variant="h5" style={{ textAlign: 'center', marginBottom:'20px' }}>
              Enter the Vehicle Number
            </Typography>

            <Stack spacing={2} direction="column" alignItems="center">
              <TextField 
               fullWidth  
               label="Vehicle Number"
               variant="outlined" 
               name='vehicle_number' 
               value={formValues.vehicle_number.value}
               onChange={handleChange}
               error={formValues.vehicle_number.error}
               helperText={formValues.vehicle_number.error && formValues.vehicle_number.errorMessage}
               />
            </Stack>

            <Stack spacing={2} direction="row" alignItems="flex-end" justifyContent="flex-end" mt={2}>
              <Button variant="outlined" color="error" onClick={navigateToBack} startIcon={<Iconify icon="bx:arrow-back" />}>
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
   
  )
}
