import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Button, TextField, Stepper, Step, StepButton, CardActions, CardContent, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice';
import { useNavigate } from 'react-router-dom';


const ServiceCard = ({ title,bgcolor,activebg,path }) => {

  const navigate = useNavigate()
  const { currentUser } = useSelector((state) => state.user);
  const navigateToSelection = (path) => {
    navigate(path)
  } 

  return (
    <motion.div
      whileHover={{ scale: 1.1, backgroundColor: activebg }}
      whileTap={{ scale: 0.8 }}
      style={{
        width: '100%',
        maxWidth: 420,
        backgroundColor: bgcolor,
        borderRadius: 16,
        padding: 16,
        cursor: 'pointer',
        margin: '8px',
      }}
      onClick={() => navigateToSelection(path)}
    >
      <Typography variant="h6" style={{ textAlign: 'center', color:'white' }}>
        {title}
      </Typography>
    </motion.div>
  );
};

export default function SelectionPage() {
  const theme = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token; 
  const dispatch = useDispatch()
  const navigate = useNavigate()

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

  const hasVehicleRegistrationPermission = currentUser.permissions[0]?.permission_list.includes('vehicle-registration');
  const hasVehicleServicePermission = currentUser.permissions[0]?.permission_list.includes('vehicle-supervise');

  useEffect(() => {
    if(token){
      checkTokenExpire()
    }
  },[])

  return (

    <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center',minHeight: '100vh', }}>
          <Card sx={{ p: 5, margin: 'auto', }}>
            <Typography variant="h3" style={{ textAlign: 'center' }}>
              Supervise Selection
            </Typography>

            <Stack spacing={2} direction="column" alignItems="center">
           
            {hasVehicleServicePermission && (
              <ServiceCard title="Job Management" bgcolor="#192a56" activebg="#273c75" path="/servicePortal/vehicleSupervise/searchvehicleNumber" />
            )}
            {hasVehicleServicePermission && (
              <ServiceCard title="Onging Services" bgcolor="#F79F1F" activebg="#FFC312" path="/servicePortal/vehicleSupervise/ongoingServices" />
            )}
            {hasVehicleServicePermission && (
              <ServiceCard title="Completed Services" bgcolor="#192a56" activebg="#273c75" path="/servicePortal/vehicleSupervise/completedServices" />
            )}
            </Stack>
            
          </Card>
    </div>
   

  )
}
