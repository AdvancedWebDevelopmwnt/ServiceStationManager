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
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon,
  IconButton,
  ListItemAvatar,
  Avatar,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
import Autocomplete from '@mui/material/Autocomplete';
import { calcLength, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice.js';
import { useNavigate, useParams } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { saveCustomerInfo, setCustomerUnlock } from 'src/redux/user/customerSlice.js';
import InputAdornment from '@mui/material/InputAdornment';
import Label from 'src/components/label';
import { clearVehicleInfo } from 'src/redux/user/vehicleSlice';
import { add, get, set } from 'lodash';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const jobStatus = [
  { id: 1, name: 'Confirmed' },
  { id: 2, name: 'Reject' },
  { id: 3, name: 'Completed' },
];

const vehicleStatus = [
  { id: 1, name: 'Pending' },
  { id: 2, name: 'Completed' },
  { id: 3, name: 'Ongoing' },
];

const pageVariants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: '0%', transition: { ease: 'easeInOut', duration: 0.5 } },
  exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut', duration: 0.5 } },
};

export default function VehicleInfoPage() {
  const { currentUser } = useSelector((state) => state.user);
  const { customer_info } = useSelector((state) => state.customer);
  const { vehicle_info } = useSelector((state) => state.vehicle);
  const { jobs_info } = useSelector((state) => state.jobs);

  const token = currentUser.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('one');

  const [vehiclemodel, setVehicleModel] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [vehicle_services, setVehicleServices] = useState({});
  const [vehicle_jobs, setVehicleJobs] = useState([]);
  const [inputVehicleStatus, setInputVehicleStatus] = useState({
    vehicle_number: '',
    status: '',
  });
  const [jobStatuses, setJobStatuses] = useState([]);
  const [mainJobs, setMainJobs] = useState([]);
  const [subJobs, setSubJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [openVehicleInfo, setOpenVehicleInfo] = useState(false);
  const [openCustomerInfo, setOpenCustomerInfo] = useState(false);

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
  });

  const customerTypes = [
    { id: 1, name: 'Government' },
    { id: 2, name: 'Private' },
    { id: 3, name: 'Person' },
  ];

  const colums = [
    { id: 'name', label: 'Job Name', minWidth: 170 },
    { id: 'type', label: 'Job Type', minWidth: 170 },
    { id: 'price', label: 'Price', minWidth: 170 },
    {
      id: 'action',
      label: 'Action',
      minWidth: 170,
      format: (value, row) => (
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => {
            addJobsIntoVehicle(row.id, row.name, row.type);
          }}
        >
          Add Job
        </Button>
      ),
    },
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
    dispatch(setCustomerUnlock());
    navigate('/servicePortal/vehicleSupervise/searchvehicleNumber');
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

  const handleUnlock = () => {
    dispatch(setCustomerUnlock());
  };

  const handleSubmit = (e) => {
    if (loading) return;
    e.preventDefault();

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
      };
      dispatch(saveCustomerInfo(data));
      saveOrUpdateCustomerInfo();
    }

    setFormValues(newFormValues);
  };

  const saveOrUpdateCustomerInfo = async () => {
    try {
      if (loading) return;
      setAuthToken(token);
      setLoading(true);

      const payload = {
        first_name: formValues.first_name.value,
        last_name: formValues.last_name.value,
        mobile_number: formValues.mobile_number.value,
        nic: formValues.nic.value,
        customer_type: formValues.customer_type.value,
        address: formValues.address.value,
      };

      await axiosInstance
        .post('/api/servicePortal/saveOrUpdateCustomerInfo', payload)
        .then((response) => {
          if (response.data.status === true) {
            // setLoading(false);
            navigate('/servicePortal/step4');
          } else {
            setErrMsg(response.data.message);
            // setLoading(false);
            setResponseErr(true);
          }
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const getMainJobs = async () => {
    try {
      setAuthToken(token);

      await axiosInstance.get('/api/jobs/getMainJobs').then((response) => {
        if (response.data.status == true) {
          setMainJobs(response.data.job);
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
          setSubJobs(response.data.job);
        } else {
          setErrMsg(response.data.message);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getAllJobs = async () => {
    try {
      setAuthToken(token);

      await axiosInstance.get('/api/jobs/getAllJobs').then((response) => {
        if (response.data.status == true) {
          setAllJobs(response.data.job);
        } else {
          setErrMsg(response.data.message);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeTabs = (event, newValue) => {
    setValue(newValue);
  };

  const getVicleData = async () => {
    try {
      if (loading) return;
      setAuthToken(token);
      setLoading(true);
      await axiosInstance
        .get(`/api/servicePortal/getVehicleInfo/${vehicle_info.vehicle_number}`)
        .then((response) => {
          if (response.data.status === true && response.data.vehicle_service_log != null) {
            setVehicleServices(response.data.vehicle_service_log);
            setVehicleJobs(response.data.vehicle_jobs);
            setInputVehicleStatus(response.data.vehicle_service_log.status);
            setJobStatuses(
              response.data.vehicle_jobs.map((job) => ({ jobId: job.id, status: job.status }))
            );

            setLoading(false);
          } else {
            setErrMsg(response.data.message);
            setLoading(true);
            setResponseErr(true);
          }
        });
    } catch (err) {
      setLoading(false);
    }
  };

  const addJobsIntoVehicle = async (job_id, name, type) => {
    if (
      vehicle_jobs.find(
        (job) => job.job_id === job_id && (job.status === 'Confirmed' || job.status === 'Completed')
      )
    ) {
      setErrMsg('Job already added');
      setResponseErr(true);
      return;
    }

    setVehicleJobs([...vehicle_jobs, { job_id, name, type, status: 'Confirmed' }]);
    setJobStatuses([
      ...jobStatuses,
      { jobId: job_id, name: name, type: type, status: 'Confirmed' },
    ]);
  };

  const handleRemoveJob = (jobId) => () => {
    setVehicleJobs(vehicle_jobs.filter((job) => job.job_id !== jobId));
    setJobStatuses(jobStatuses.filter((job) => job.jobId !== jobId));
  };

  const handleViclestateUpdate = async () => {
    try {
      if (loading) return;
      setAuthToken(token);
      setLoading(true);
      const payload = {
        vehicle_number: vehicle_info.vehicle_number,
        status: inputVehicleStatus.status,
      };


      await axiosInstance
        .post(`/api/servicePortal/updateVehicleStatus`, payload)
        .then((response) => {
          if (response.data.status === true) {
            getVicleData();
            setLoading(false);
          } else {
            setErrMsg(response.data.message);
            setLoading(true);
            setResponseErr(true);
          }
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleJobStatusChange = (jobId, newStatus) => {
    setJobStatuses(
      jobStatuses.map((job) => (job.jobId === jobId ? { ...job, status: newStatus } : job))
    );
  };

  const updateAllJobs = async () => {
    if (loading) return;
    setLoading(true);
    await Promise.all(
      jobStatuses.map((job) => {
        const payload = {
          vehicle_number: vehicle_info.vehicle_number,
          job_id: job.jobId,
          status: job.status,
        };

        return axiosInstance
          .post(`/api/servicePortal/updateJobStatus`, payload)
          .then((response) => {
            if (response.data.status === true) {
              getVicleData();
              setLoading(false);
            } else {
              setErrMsg(response.data.message);
              setLoading(true);
              setResponseErr(true);
            }
          });
      })
    );
  };

  const handleClickOpenVehicleInfo = () => {
    setOpenVehicleInfo(true);
  };

  const handleCloseVehicleInfo = () => {
    setOpenVehicleInfo(false);
  };

  const handleClickOpenCustomerInfo = () => {
    setOpenCustomerInfo(true);
  };

  const handleCloseCustomerInfo = () => {
    setOpenCustomerInfo(false);
  };

  useEffect(() => {
    if (token) {
      checkTokenExpire();
      getVicleData();
      getMainJobs();
      getSubJobs();
      getAllJobs();
    }
  }, []);

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      <Container maxWidth="full">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <Card sx={{ p: 1, margin: 'auto', width: '100%' }}>
            <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '10px' }}>
              Vehicle Supervise
            </Typography>
            <Grid container spacing={2} direction={'row'} justifyContent="center">
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <List dense={true}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                        mb={1}
                      >
                        <Typography variant="h6" color="inherit">
                          Select Jobs
                        </Typography>

                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="outlined"
                            color="success"
                            endIcon={<Iconify icon="streamline:task-list" />}
                            onClick={handleClickOpenVehicleInfo}
                          >
                            view Vehicle Detail
                          </Button>
                          <Button
                            variant="outlined"
                            color="success"
                            endIcon={<Iconify icon="streamline:task-list" />}
                            onClick={handleClickOpenCustomerInfo}
                          >
                            view Customer Detail
                          </Button>
                          <Button variant="contained" disabled={loading} onClick={navigateToBack}>
                            Back
                          </Button>
                        </Stack>
                      </Stack>
                      <Divider style={{ backgroundColor: '#212121', marginBottom: 10 }} />

                      <TableComponent
                        table_rows={allJobs}
                        columns={colums.map((column) => ({
                          ...column,
                          format: column.format
                            ? (value, row) => column.format(value, row)
                            : (value) => (value ? value : '-'),
                        }))}
                        isLoading={loading}
                      />
                    </List>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} md={6}>
                    <List dense={true}>
                      <Typography variant="h6" color="inherit">
                        Jobs Information
                      </Typography>
                      <Divider style={{ backgroundColor: '#212121', marginBottom: 10 }} />
                      {!loading ? (
                        <TableContainer style={{ maxHeight: 200, overflow: 'auto' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell style={{ width: '150px' }}>Job Name</TableCell>
                                <TableCell style={{ width: '200px' }} align="center">
                                  Status
                                </TableCell>
                                <TableCell style={{ width: '200px' }} align="center">
                                  Action
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {vehicle_jobs &&
                                vehicle_jobs.map((job) => (
                                  <TableRow key={job.id}>
                                    <TableCell>{job.name}</TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={job.status}
                                        style={{
                                          color:
                                            job.status === 'Confirmed'
                                              ? 'green'
                                              : job.status === 'Reject'
                                              ? 'red'
                                              : job.status === 'Completed'
                                              ? '#22a6b3'
                                              : '',
                                          borderColor:
                                            job.status === 'Confirmed'
                                              ? 'green'
                                              : job.status === 'Reject'
                                              ? 'red'
                                              : job.status === 'Completed'
                                              ? '#22a6b3'
                                              : '',
                                          borderRadius: '16px',
                                        }}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      {job.vehicle_service_log_id ? (
                                        <>
                                          <IconButton edge="end" aria-label="edit">
                                            <Iconify name="edit" icon="material-symbols:edit" />
                                          </IconButton>
                                          <Select
                                            value={
                                              (
                                                jobStatuses.find((job) => job.jobId === job.id) ||
                                                {}
                                              ).status
                                            }
                                            style={{
                                              width: '150px',
                                              marginLeft: '10px',
                                              height: '33px',
                                            }}
                                            onChange={(e) =>
                                              handleJobStatusChange(job.id, e.target.value)
                                            }
                                          >
                                            {jobStatus.map((status) => (
                                              <MenuItem key={status.name} value={status.name}>
                                                {status.name}
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        </>
                                      ) : (
                                        <IconButton
                                          edge="end"
                                          aria-label="delete"
                                          onClick={handleRemoveJob(job.job_id)}
                                        >
                                          <Iconify name="delete" icon="material-symbols:delete" />
                                        </IconButton>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography>Loading...</Typography>
                      )}
                      <Box marginTop={2} display="flex" justifyContent="flex-end">
                        <LoadingButton
                          variant="contained"
                          disabled={loading}
                          onClick={updateAllJobs}
                          size="small"
                        >
                          Update Job Status
                        </LoadingButton>
                      </Box>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <List dense={true}>
                      <Typography variant="h6" color="inherit">
                        Vehicle Status
                      </Typography>
                      <Divider style={{ backgroundColor: '#212121', marginBottom: 10 }} />
                      {!loading ? (
                        <TableContainer>
                          <Table size="small" style={{ overflow: 'hidden' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell style={{ width: '150px' }}>Vehicle Number</TableCell>
                                <TableCell style={{ width: '200px' }} align="center">
                                  Current Status
                                </TableCell>
                                <TableCell style={{ width: '200px' }} align="center">
                                  Action
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>{vehicle_services?.vehicle_number}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={vehicle_services?.status}
                                    style={{
                                      backgroundColor:
                                        vehicle_services?.status === 'Pending'
                                          ? 'orange'
                                          : vehicle_services?.status === 'Completed'
                                          ? 'green'
                                          : vehicle_services?.status === 'Ongoing'
                                          ? 'blue'
                                          : '',
                                      color: 'white',
                                      borderRadius: '16px',
                                    }}
                                    variant="contained"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <IconButton edge="end" aria-label="edit">
                                      <Iconify name="edit" icon="material-symbols:edit" />
                                    </IconButton>
                                    <Select
                                      labelId="vehicle-state-select-label"
                                      id="vehicle-state-select"
                                      value={inputVehicleStatus.status}
                                      label="vehicle status"
                                      style={{ width: '150px', marginLeft: '10px', height: '33px' }}
                                      onChange={(e) =>
                                        setInputVehicleStatus({
                                          ...inputVehicleStatus,
                                          status: e.target.value,
                                        })
                                      }
                                    >
                                      {vehicleStatus?.map((status) => (
                                        <MenuItem key={status?.name} value={status?.name}>
                                          {status?.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography>Loading...</Typography>
                      )}
                      <Box marginTop={2} display="flex" justifyContent="flex-end">
                        <LoadingButton
                          variant="contained"
                          disabled={loading}
                          onClick={handleViclestateUpdate}
                          size="small"
                        >
                          Update Status
                        </LoadingButton>
                      </Box>
                    </List>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Stack spacing={2}></Stack>
          </Card>

          <Dialog
            open={openVehicleInfo}
            onClose={handleCloseVehicleInfo}
            aria-label="vehicle-info-dialog"
            aria-describedby="vehicle-info-dialog-description"
            fullWidth={true}
            maxWidth={'sm'}
          >
            {/* <DialogTitle id="vehicle-info-dialog-title">Vehicle Information</DialogTitle> */}
            <DialogContent>
              <List dense={true}>
                <Typography variant="h6" color="inherit">
                  Vehicle Information
                </Typography>
                <Divider style={{ backgroundColor: '#212121', marginBottom: 10 }} />

                {vehicle_info.vehicle_number && (
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Vehicle Number :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {vehicle_info.vehicle_number}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {vehicle_info.vehicle_brand && (
                  <Grid container spacing={2}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Brand :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {vehicle_info.vehicle_brand}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {vehicle_info.vehicle_model && (
                  <Grid container spacing={2}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Model :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {vehicle_info.vehicle_model}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {vehicle_info.year_of_made && (
                  <Grid container spacing={2}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Year of Made :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {vehicle_info.year_of_made}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {vehicle_info.engine_capacity && (
                  <Grid container spacing={2}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Engine Capacity :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {vehicle_info.engine_capacity}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {vehicle_info.fuel_type && (
                  <Grid container spacing={2}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Fuel Type :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {vehicle_info.fuel_type}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseVehicleInfo}>Close</Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openCustomerInfo}
            onClose={handleCloseCustomerInfo}
            aria-label="customer-info-dialog"
            aria-describedby="customer-info-dialog-description"
            fullWidth={true}
            maxWidth={'sm'}
          >
            {/* <DialogTitle id="customer-info-dialog-title">Customer Information</DialogTitle> */}
            <DialogContent>
              <List dense={true}>
                <Typography variant="h6" color="inherit">
                  Customer Informations
                </Typography>
                <Divider style={{ backgroundColor: '#212121', marginBottom: 10 }} />

                {customer_info.first_name && (
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        First Name :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {customer_info.first_name}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {customer_info.last_name && (
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Last Name :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {customer_info.last_name}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {customer_info.mobile_number && (
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Mobile Number :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {customer_info.mobile_number}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {customer_info.address && (
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Customer Address :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {customer_info.address}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {customer_info.customer_type && (
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Customer Type :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {customer_info.customer_type}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {customer_info.customer_type == 'Government' && (
                  <Grid container spacing={1}>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="subtitle1" color="inherit">
                        Order Form :
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} sm={6}>
                      <Typography variant="body1" color="inherit">
                        {customer_info.government_order_form == 1 ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCustomerInfo}>Close</Button>
            </DialogActions>
          </Dialog>
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
