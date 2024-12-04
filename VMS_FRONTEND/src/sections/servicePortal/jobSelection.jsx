import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Button, TextField,  FormControl, FormHelperText, InputLabel, MenuItem,Select,Stack, Container, Snackbar, Alert, Grid, CardContent, ListItem, ListItemAvatar, ListItemText, List, IconButton, Avatar, Divider } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice.js';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { clearCustomerInfo, saveCustomerInfo, setCustomerUnlock,} from 'src/redux/user/customerSlice.js';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { ResetcartError, addJobs, clearAllJobs, deleteJob } from 'src/redux/user/jobCart';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { isError } from 'lodash';
import { clearVehicleInfo } from 'src/redux/user/vehicleSlice';


const pageVariants = {
  initial: { opacity: 0, x: "-100%" },
  animate: { opacity: 1, x: "0%", transition: { ease: "easeInOut", duration: 0.5 } },
  exit: { opacity: 0, x: "100%", transition: { ease: "easeInOut", duration: 0.5 } },
};

export default function JobSelection() {
  const { currentUser } = useSelector((state) => state.user);
  const { customer_info } = useSelector((state) => state.customer);
  const { jobs_info } = useSelector((state) => state.jobs)
  const { vehicle_info } = useSelector((state) => state.vehicle);

  const token = currentUser.token; 
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [jobs, setJobs] = useState([])
  const [subjobs, setSubjobs] = useState([])

  const [value, setValue] = useState('one');
  const [currentTime, setCurrentTime] = useState(new Date());
  const dispacth = useDispatch();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [open, setOpen] = useState(false);
  const [openDetailModal, setOpenDetailModal] =  useState(false)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setResponseSuccess(false);
    dispacth(clearVehicleInfo())
    dispacth(clearCustomerInfo())
    dispacth(clearAllJobs())
    navigate('/servicePortal/welcome')
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    dispatch(ResetcartError())
  };

  const handleCloseWarning = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setResponseErr(false)
  }

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
      navigate('/servicePortal/step4')
  }

  

  const addJobsIntoCart = (id,name,type) => {

    dispatch(addJobs({id:id,name:name,type:type}))
  }


  const handleSubmit = (e) => {
    setOpenDetailModal(true)
  };

  const SaveJobDetails = async () => {
    setAuthToken(token);
    setLoading(true);

    const payload= {
      vehicle_number: vehicle_info.vehicle_number,
      jobs: jobs_info.job_cart,
      millage: vehicle_info.millage
    }

    const response = await axiosInstance.post('/api/servicePortal/saveJobs',payload)

    if (response.data.status === true) {
      setLoading(false);
      setOpenDetailModal(false)
      setResponseSuccess(true)
     
    } else {
        setOpenDetailModal(false)
        setErrMsg(response.data.message);
        setLoading(false);
        setResponseErr(true);
    }
  }

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false)
  }


  const getMainJobs =  async () => {
    try{
      
      setAuthToken(token);

      await axiosInstance
        .get('/api/jobs/getMainJobs')
        .then((response) => {
            if(response.data.status == true){
               setJobs(response.data.job)
            }else{
              setErrMsg(response.data.message);
              setResponseErr(true);
            }
        })

    }catch(err){
      console.error(err);
    }
  }

  
  const getSubJobs =  async () => {
    try{
      
      setAuthToken(token);

      await axiosInstance
        .get('/api/jobs/getSubJobs')
        .then((response) => {
            if(response.data.status == true){
               setSubjobs(response.data.job)
            }else{
              setErrMsg(response.data.message);
              setResponseErr(true);
            }
        })

    }catch(err){
      console.error(err);
    }
  }



 

  const removeJob = (jobId) => {
    dispatch(deleteJob(jobId))
  }

  useEffect(() => {
    if(token){
      checkTokenExpire()
      getMainJobs()
      getSubJobs()
    }
  },[])

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      <Container >
        <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center',minHeight: '100vh', }}>
          <Card sx={{ p: 5, margin: 'auto', width: '100%' }}>
            <Typography variant="h5" style={{ textAlign: 'center', marginBottom:'20px' }}>
              Select Jobs
            </Typography>

            <TabContext value={value} textColor="secondary">
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab label="Main Job" value="one" />
                        <Tab label="Sub Job" value="two"/>
                    </TabList>
                </Box>
                <TabPanel value="one">
                    <Grid container spacing={2}>
                        {jobs && jobs.map((job) => {
                            return (
                            <Grid item xs={12} sm={4} key={job.id}>
                                <Box style={{
                                    backgroundColor:'#dfe4ea',
                                    borderRadius: '5px', 
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                                >
                                <Iconify icon="carbon:task-tools" width={60} />
                                <Typography variant="h5" style={{ textAlign: 'center' }}>{job.name}</Typography>
                                <Button
                                    fullWidth
                                    variant='contained'
                                    color='success'
                                    size='large'
                                    startIcon={<Iconify icon="tdesign:task-add-1"/>}
                                    onClick={()=>{addJobsIntoCart(job.id,job.name,job.type)}}
                                >
                                    Add Job
                                </Button>
                                </Box>
                            </Grid>
                            );
                        })}
                    </Grid>
                </TabPanel>
                <TabPanel value="two">
                <Grid container spacing={2}>
                        {subjobs && subjobs.map((subjob) => {
                            return (
                            <Grid item xs={12} sm={4} key={subjob.id}>
                                <Box style={{
                                    backgroundColor:'#dfe4ea',
                                    borderRadius: '5px', 
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                                >
                                <Iconify icon="carbon:task-tools" width={60} />
                                <Typography variant="h5" style={{ textAlign: 'center' }}>{subjob.name}</Typography>
                                <Button
                                    fullWidth
                                    variant='contained'
                                    color='success'
                                    size='large'
                                    startIcon={<Iconify icon="tdesign:task-add-1"/>}
                                    onClick={()=>{addJobsIntoCart(subjob.id,subjob.name,subjob.type)}}
                                
                                >
                                    Add Job
                                </Button>
                                </Box>
                            </Grid>
                            );
                        })}
                    </Grid>
                </TabPanel>
            </TabContext>

           
            <Snackbar
                open={jobs_info.isErrorInCart}
                autoHideDuration={3000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
                    Cannot Add Same Job
                </Alert>
            </Snackbar>

            <Snackbar
                open={responseErr}
                autoHideDuration={3000}
                onClose={handleCloseWarning}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                <Alert onClose={handleCloseWarning} severity="error" variant="filled" sx={{ width: '100%' }}>
                    {erroMsg}
                </Alert>
            </Snackbar>

            <Snackbar
              open={responseSuccess}
              autoHideDuration={3000}
              onClose={handleCloseSuccess}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert onClose={handleCloseSuccess} severity="success" variant="filled" sx={{ width: '100%' }}>
                 Successfully Register the vehicle
              </Alert>
            </Snackbar>

            
            <Stack spacing={2} direction="row" alignItems="flex-end" justifyContent="flex-end" mt={2}>
              <Button variant="outlined" color="error" onClick={navigateToBack} startIcon={<Iconify icon="bx:arrow-back" />}>
                Back
              </Button>
             
              {jobs_info.job_cart.length > 0  && (
                <Button
                    variant="outlined"
                    color="success"
                    endIcon={<Iconify icon="streamline:task-list"/>}
                    onClick={handleClickOpen}
                    >
                    View Assigned Jobs
                </Button>
              )}
             
  
              <Button
                disabled={jobs_info.job_cart.length == 0}
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Finish
              </Button>
            </Stack>
          </Card>

          <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
             Assigned Job List
            </DialogTitle>
            <DialogContent>
                <List dense={true}>
                    {jobs_info.job_cart && jobs_info.job_cart.map((job) => (
                        <ListItem
                            key={job.id} // Add a unique key for each ListItem
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => {removeJob(job.id)}}>
                                    <Iconify icon="material-symbols:delete" />
                                </IconButton>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar>
                                    <Iconify icon="carbon:task-tools" />
                                </Avatar>
                            </ListItemAvatar>

                            <ListItemText primary={job.name} secondary={job.type} />
                        </ListItem>
                    ))}
                    
                </List>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} color='error'>Cancel</Button>
            </DialogActions>
          </Dialog>

          <Dialog
            fullWidth={true}
            maxWidth="md"
            open={openDetailModal}
            onClose={handleCloseDetailModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
             Detail Form
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                     Please confirm the information you entered
                </DialogContentText>
                
                <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="Vehicle Number"
                            variant="outlined" 
                            disabled
                            value={vehicle_info.vehicle_number}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="Fuel Type"
                            variant="outlined" 
                            disabled
                            value={vehicle_info.fuel_type}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="Millage"
                            variant="outlined" 
                            disabled
                            value={vehicle_info.millage}
                        />
                    </Grid>
                  
                </Grid>
                <Divider style={{margin:'10px'}}/>
                <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="First Name"
                            variant="outlined" 
                            disabled
                            value={customer_info.first_name}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="Last Name"
                            variant="outlined" 
                            disabled
                            value={customer_info.last_name}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="Mobile Number"
                            variant="outlined" 
                            disabled
                            value={customer_info.mobile_number}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="Customer Type"
                            variant="outlined" 
                            disabled
                            value={customer_info.customer_type}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2} style={{marginTop:'10px'}}>
                  {customer_info.customer_type == 'Government' && (
                      <Grid item xs={12} sm={6}>
                      <TextField 
                          fullWidth  
                          label="Order Form"
                          variant="outlined" 
                          disabled
                          value={customer_info.government_order_form == 1  ? 'Yes' : 'No'}
                      />
                      </Grid>
                  )}
                   
                </Grid>
                <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="NIC"
                            variant="outlined" 
                            disabled
                            value={customer_info.nic}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="Address"
                            variant="outlined" 
                            disabled
                            value={customer_info.address}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            fullWidth  
                            label="Check In Time"
                            variant="outlined" 
                            disabled
                            value={currentTime.toLocaleTimeString()}
                        />
                    </Grid>
                   
                </Grid>
            </DialogContent>
            
            <DialogActions>
             <Button onClick={handleCloseDetailModal} color='error'>Cancel</Button>
             <LoadingButton
                loading={loading}
                onClick={SaveJobDetails}
              >
                Confirm
              </LoadingButton>
            
            </DialogActions>
          </Dialog>
        </div>
      </Container>

         
    </motion.div>
   
  )
}
