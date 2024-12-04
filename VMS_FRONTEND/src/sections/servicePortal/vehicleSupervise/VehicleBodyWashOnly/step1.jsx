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
  CardContent,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice.js';
import { Form, useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import {
  clearCustomerInfo,
  saveCustomerInfo,
  setCustomerUnlock,
} from 'src/redux/user/customerSlice.js';
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
import { isError, set } from 'lodash';
import { clearVehicleInfo } from 'src/redux/user/vehicleSlice';
import ImageCaptureModal from 'src/layouts/dashboard/common/ImageCaptureModal';

const pageVariants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: '0%', transition: { ease: 'easeInOut', duration: 0.5 } },
  exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut', duration: 0.5 } },
};

export default function JobSelection() {
  const { currentUser } = useSelector((state) => state.user);
  const { customer_info } = useSelector((state) => state.customer);
  const { jobs_info } = useSelector((state) => state.jobs);
  const { vehicle_info } = useSelector((state) => state.vehicle);

  const token = currentUser.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  /////////////////////////////

  const [jobs, setJobs] = useState([]);
  const [subjobs, setSubjobs] = useState([]);

  const [formValues, setFormValues] = useState({
    vehicle_number: {
      value: '',
      error: false,
      errorMessage: 'You must enter the Vehicle Number',
    },
    vehicle_image: {
      value: '',
      imgUrl: '',
      error: false,
      errorMessage: 'You must capture the Vehicle Image',
    },
  });

  //image
  const [imageName, setimageName] = useState('');
  const [captureModalOpen, setCaptureModalOpen] = useState(false);

  const handleCloseCaptureModal = () => {
    setCaptureModalOpen(false);
  };

  const handleOpenCaptureModal = (imageName) => {
    setimageName(imageName);
    setCaptureModalOpen(true);
    setFormValues({
      ...formValues,
      [imageName]: {
        ...formValues[imageName],
        error: false,
        errorMessage: '',
      },
    });
  };

  const handleSaveImage = (imageSrc, imgType) => {
    fetch(imageSrc)
      .then((res) => {
        return res.blob();
      })
      .then((blob) => {
        console.log(`blob`, blob);
        setFormValues((prev) => ({
          ...prev,
          vehicle_image: {
            ...prev.vehicle_image,
            value: blob,
            imgUrl: URL.createObjectURL(blob),
            error: false,
            errorMessage: '',
          },
        }));
      });

    setCaptureModalOpen(false);
  };

  //jobs
  const [bodyWashJob, setBodyWashJob] = useState({
    id: '',
    name: '',
    type: '',
  });

  const [jobError, setJobError] = useState({
    isError: false,
    errorMsg: '',
  });

  const handleAddBodyWashJob = (job) => {
    console.log(`job`, job);

    if (bodyWashJob.id) {
      if (bodyWashJob.id === job.id) {
        console.log(`Cannot add same job`);
        setJobError({
          isError: true,
          errorMsg: 'Cannot add same job',
        });
      }
      if (bodyWashJob.id !== job.id) {
        console.log(`Cannot add same job`);
        setJobError({
          isError: true,
          errorMsg: 'Only one job can be added',
        });
      }
    } else {
      setBodyWashJob({
        id: job.id,
        name: job.name,
        type: job.type,
      });
    }
  };

  useEffect(() => {
    console.log(`bodyWashJob`, bodyWashJob);
    console.log(`error msg`, jobError.errorMsg);
  }, [bodyWashJob, jobError]);

  //vehicle
  const handleVehicleNumber = (e) => {
    const { name, value } = e.target;

    const uppercaseValue = value.toUpperCase();

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
    console.log(`formValues`, formValues);
    e.preventDefault();
    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;
    console.log(`formFields`, formFields);
    console.log(`newFormValues`, newFormValues);
    console.log(`body job`, bodyWashJob);

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField].value;
      console.log(`currentValue`, currentValue);
    }
    if (!hasValidationErrors) {
      console.log(`ok`);
      const payload = {
        vehicle_number: formValues.vehicle_number.value,
        vehicle_image: formValues.vehicle_image.value,
        job: bodyWashJob,
      };
      console.log(`payload`, payload);
      saveOrupdateBodywashOnly(payload);
    }

    setFormValues(newFormValues);

    setOpenDetailModal(true);
  };

  const saveOrupdateBodywashOnly = async (payload) => {
    setAuthToken(token);
    setLoading(true);
    const response = await axiosInstance.post('/api/bodyWash/saveOrupdateBodywashOnly', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(`response`, response);

    if (response.data.status === true) {
      setLoading(false);
      setResponseSuccess(true);
    } else {
      setErrMsg(response.data.message);
      setLoading(false);
      setResponseErr(true);
    }

    console.log(response);
  };

  const saveOrupdateVehicleInfo = async () => {
    setAuthToken(token);
    setLoading(true);
    const payload = {
      vehicle_image: formValues.vehicle_image.value,
    };

    const response = await axiosInstance.post(
      '/api/servicePortal/saveOrupdateVehicleInfo',
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log(`response`, response);

    if (response.data.status === true) {
      setLoading(false);
    } else {
      setErrMsg(response.data.message);
      setLoading(false);
      setResponseErr(true);
    }

    console.log(response);
  };

  const getBodyWashJobs = async () => {
    try {
      setAuthToken(token);
      const response = await axiosInstance.get('/api/bodyWash/getBodyWashJobs');
      if (response.data.status == true) {
        setJobs(response.data.job);
      } else {
        setErrMsg(response.data.message);
        setResponseErr(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /////////////////////////////

  const [value, setValue] = useState('one');
  const [currentTime, setCurrentTime] = useState(new Date());
  const dispacth = useDispatch();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [open, setOpen] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);

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
    dispacth(clearVehicleInfo());
    dispacth(clearCustomerInfo());

    navigate('/servicePortal/welcome');
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setJobError({
      ...jobError,
      isError: false,
    });

    dispatch(ResetcartError());
  };

  const handleCloseWarning = (event, reason) => {
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
    navigate('/servicePortal/welcome');
  };

  const addJobsIntoCart = (id, name, type) => {
    dispatch(addJobs({ id: id, name: name, type: type }));
  };

  const SaveJobDetails = async () => {
    setAuthToken(token);
    setLoading(true);

    const payload = {
      vehicle_number: vehicle_info.vehicle_number,
      jobs: jobs_info.job_cart,
      millage: vehicle_info.millage,
    };

    const response = await axiosInstance.post('/api/servicePortal/saveJobs', payload);

    if (response.data.status === true) {
      setLoading(false);
      setOpenDetailModal(false);
      setResponseSuccess(true);
    } else {
      setOpenDetailModal(false);
      setErrMsg(response.data.message);
      setLoading(false);
      setResponseErr(true);
    }
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
  };

  const getMainJobs = async () => {
    try {
      setAuthToken(token);

      await axiosInstance.get('/api/jobs/getMainJobs').then((response) => {
        if (response.data.status == true) {
          setJobs(response.data.job);
        } else {
          setErrMsg(response.data.message);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getSubJobs = async () => {
    try {
      setAuthToken(token);

      await axiosInstance.get('/api/jobs/getSubJobs').then((response) => {
        if (response.data.status == true) {
          setSubjobs(response.data.job);
        } else {
          setErrMsg(response.data.message);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const removeJob = (jobId) => {
    dispatch(deleteJob(jobId));
  };

  useEffect(() => {
    if (token) {
      checkTokenExpire();
      getBodyWashJobs();
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
              Vehicle Body Wash Only Registration
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={12} md={12}>
                <Typography>Enter vehicle Number</Typography>
                <Divider style={{ margin: '1px' }} />

                <Stack spacing={2} pt={1} direction="column" alignItems="center">
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    variant="outlined"
                    name="vehicle_number"
                    size="medium"
                    value={formValues.vehicle_number.value}
                    onChange={handleVehicleNumber}
                    error={formValues.vehicle_number.error}
                    helperText={
                      formValues.vehicle_number.error && formValues.vehicle_number.errorMessage
                    }
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                <Typography>Capture Vehicle Image</Typography>
                <Divider style={{ margin: '1px' }} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px',
                  }}
                >
                  <Card style={{ backgroundColor: '#f1f2f6', width: '80%' }}>
                    <CardContent>
                      <Typography variant="h6" style={{ textAlign: 'center' }}>
                        Vehicle Image
                      </Typography>
                      <Button
                        onClick={() => handleOpenCaptureModal('vehicle_image')}
                        variant="outlined"
                        color="success"
                        style={{ width: '100%' }}
                      >
                        Capture
                      </Button>
                      {formValues.vehicle_image.value && (
                        <img
                          src={formValues.vehicle_image.imgUrl}
                          alt="Vehicle Image"
                          style={{ width: '100%', marginTop: '10px' }}
                        />
                      )}

                      <FormHelperText
                        style={{ textAlign: 'center' }}
                        error={formValues.vehicle_image.error}
                      >
                        {formValues.vehicle_image.error && formValues.vehicle_image.errorMessage}
                      </FormHelperText>
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            </Grid>
            <ImageCaptureModal
              isOpen={captureModalOpen}
              imgType={imageName}
              onClose={handleCloseCaptureModal}
              onSave={handleSaveImage}
            />

            <Typography>Add Body Wash Job</Typography>

            <TabContext value={value} textColor="secondary">
              <Divider style={{ margin: '10px' }} />
              <TabPanel value="one">
                <Grid container spacing={2}>
                  {jobs &&
                    jobs.map((job) => {
                      return (
                        <Grid item xs={12} sm={4} key={job.id}>
                          <Box
                            style={{
                              backgroundColor: '#dfe4ea',
                              borderRadius: '5px',
                              padding: '20px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <Iconify icon="carbon:task-tools" width={60} />
                            <Typography variant="h5" style={{ textAlign: 'center' }}>
                              {job.name}
                            </Typography>
                            <Button
                              fullWidth
                              variant="contained"
                              color="success"
                              size="large"
                              startIcon={<Iconify icon="tdesign:task-add-1" />}
                              onClick={() => {
                                handleAddBodyWashJob(job);
                              }}
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
              open={jobError.isError}
              autoHideDuration={3000}
              onClose={handleCloseError}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert
                onClose={handleCloseError}
                severity="error"
                variant="filled"
                sx={{ width: '100%' }}
              >
                {jobError.errorMsg}
              </Alert>
            </Snackbar>

            <Snackbar
              open={responseErr}
              autoHideDuration={3000}
              onClose={handleCloseWarning}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert
                onClose={handleCloseWarning}
                severity="error"
                variant="filled"
                sx={{ width: '100%' }}
              >
                {erroMsg}
              </Alert>
            </Snackbar>

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
                Successfully Register the vehicle
              </Alert>
            </Snackbar>

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

              {bodyWashJob.id && (
                <Button
                  variant="outlined"
                  color="success"
                  endIcon={<Iconify icon="streamline:task-list" />}
                  onClick={handleClickOpen}
                >
                  View Assigned Jobs
                </Button>
              )}

              <Button
                disabled={bodyWashJob.id && formValues.vehicle_number.value.trim() ? false : true}
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
            <DialogTitle id="alert-dialog-title">Assigned Job List</DialogTitle>
            {bodyWashJob.id && (
              <DialogContent>
                <List dense={true}>
                  <ListItem
                    key={bodyWashJob.id} // Add a unique key for each ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          setBodyWashJob({});
                        }}
                      >
                        <Iconify icon="material-symbols:delete" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <Iconify icon="carbon:task-tools" />
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText primary={bodyWashJob.name} secondary={bodyWashJob.type} />
                  </ListItem>
                </List>
              </DialogContent>
            )}
            <DialogActions>
              <Button onClick={handleClose} color="error">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Container>
    </motion.div>
  );
}
