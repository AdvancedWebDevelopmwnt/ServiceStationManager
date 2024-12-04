import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { LoadingButton } from '@mui/lab';
import { useNavigate, useParams } from 'react-router-dom';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import config from 'src/helpers/config.js';
import dateFormat from 'src/helpers/dateFormat';

export default function ViewVehicleRecord() {
  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [errMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = currentUser.token;
  const params = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const [formValues, setFormValues] = useState({
    vehicle_info: {
      vehicle_number: '',
      brand_name: '',
      engine_capacity: '',
      fuel_type: '',
      model_name: '',
      remark: '',
      status: '',
      year_of_made: '',
      millage: '',
      check_in_time: '',
    },
    customer_info: {
      first_name: '',
      last_name: '',
      mobile_number: '',
      nic: '',
      type: '',
      address: '',
      email: '',
    },
    assinged_jobs: [],
    images: [],
  });

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box p={3}>{children}</Box>}
      </div>
    );
  };

  //---------------------------------------------------------------------------------------------------

  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    navigate('/vehicleCategory/list');
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

    const isValid = /^[a-zA-Z0-9 ]+$/.test(value);

    setFormValues({
      ...formValues,
      [name]: {
        ...formValues[name],
        value,
        error: !isValid,
        errorMessage: isValid ? '' : 'Special characters are not allowed',
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
      updateCategory();
    }

    setFormValues(newFormValues);
  };

  const resetFormValues = () => {
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
    setFormValues(initialFormValues);
  };

  const updateFormValues = (data) => {
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

  const getVehicleData = async () => {
    setAuthToken(token);

    console.log(`params.id`, params.id);
    const response = await axiosInstance.get(`/api/vehicleLog/show/${params.id}`);
    console.log(`response`, response.data);
    if (response.data.status === true) {
      const { vehicleRecod, customerRecod, jobs, images } = response.data;
      setFormValues({
        vehicle_info: { ...vehicleRecod, check_in_time: dateFormat(vehicleRecod.check_in_time) },
        customer_info: { ...customerRecod },
        assinged_jobs: [...jobs],
        images: [...images],
      });
    } else {
      setErrorMessage(response.data.message);
      setResponseErr(true);
    }
  };

  const updateCategory = async () => {
    try {
      setAuthToken(token);
      setLoading(true);
      await axiosInstance
        .post(`/api/brands/${params.id}`, {
          ...formValues,
          name: formValues.name.value,
        })
        .then((response) => {
          if (response.data.status === true) {
            setResponseSuccess(true);
            setLoading(false);
          } else {
            setLoading(false);
            setResponseErr(true);
            setErrorMessage(response.data.message);
          }
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Completed':
        return 'success';
      case 'Ongoing':
        return 'primary';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    getVehicleData();
  }, []);
  const [activeTabValue, setActiveTabValue] = useState(0);

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          textColor="inherit"
          value={activeTabValue}
          onChange={(e, val) => setActiveTabValue(val)}
        >
          <Tab label="Vehicle Record" />
          <Tab label="Customer Record" />
          <Tab label="Assigned Jobs" />
          <Tab label="Vehicle Images" />
        </Tabs>
      </Box>

      {activeTabValue === 0 && (
        <Grid item sm={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <span>
                  <Label>Vehicle Number</Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.vehicle_info.vehicle_number}
                  </Typography>
                </span>
                <span>
                  <Label>Vehicl Brand </Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.vehicle_info.brand_name}
                  </Typography>
                </span>
                <span>
                  <Label>Vehicle Model</Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.vehicle_info.vehicle_model}
                  </Typography>
                </span>
                <span>
                  <Label>Enigne Capacity</Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.vehicle_info.engine_capacity}
                  </Typography>
                </span>
                <span>
                  <Label>Fuel Type</Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.vehicle_info.fuel_type}
                  </Typography>
                </span>
                <span>
                  <Label>Remark</Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.vehicle_info.remark}
                  </Typography>
                </span>
                <span>
                  <Label>Millage</Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.vehicle_info.millage}
                  </Typography>
                </span>
                <span>
                  <Label>Check in</Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.vehicle_info.check_in_time}
                  </Typography>
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Label> Service Status : </Label>
                  <Chip
                    size="small"
                    label={formValues.vehicle_info.status}
                    color={getStatusChipColor(formValues.vehicle_info.status)}
                    variant="outlined"
                  />
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}

      {activeTabValue === 1 && (
        <Grid item sm={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <span>
                  <Label>First Name : </Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.customer_info.first_name}
                  </Typography>
                </span>
                <span>
                  <Label>Last Name : </Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.customer_info.last_name}
                  </Typography>
                </span>
                <span>
                  <Label>Email : </Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.customer_info.email}
                  </Typography>
                </span>
                <span>
                  <Label>Mobile Number : </Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.customer_info.mobile_number}
                  </Typography>
                </span>
                <span>
                  <Label>NIC : </Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.customer_info.nic}
                  </Typography>
                </span>
                <span>
                  <Label>Address : </Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.customer_info.address}
                  </Typography>
                </span>
                <span>
                  <Label>Customer Type : </Label>
                  <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                    {formValues.customer_info.type}
                  </Typography>
                </span>
                {formValues.customer_info.type === 'Government' && (
                  <span>
                    <Label>Order Form: </Label>
                    <Typography variant="lead" style={{ marginLeft: '10px' }} color="inherit">
                      {formValues.customer_info.government_order_form == 1 ? 'Yes' : 'No'}
                    </Typography>
                  </span>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}

      {activeTabValue === 2 && (
        <Grid item sm={12} md={6}>
          <Card>
            <CardContent>
              <List dense={true}>
                {formValues.assinged_jobs && formValues.assinged_jobs.length > 0 ? (
                  formValues.assinged_jobs.map((job) => (
                    <ListItem
                      style={{
                        color:
                          job.status === 'Confirmed'
                            ? 'green'
                            : job.status === 'Reject'
                            ? 'red'
                            : job.status === 'Completed'
                            ? '#22a6b3'
                            : '',
                        textDecoration: job.status === 'Reject' ? 'line-through' : 'none',
                      }}
                      key={job.id} // Add a unique key for each ListItem
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <Iconify icon="carbon:task-tools" />
                        </Avatar>
                      </ListItemAvatar>

                      <Grid container spacing={2}>
                        <Grid item xs={6} md={6}>
                          <ListItemText primary={job.name} secondary={job.type} />
                        </Grid>
                        <Grid item xs={6} md={6}>
                          <Label
                            style={{
                              color:
                                job.status === 'Confirmed'
                                  ? 'green'
                                  : job.status === 'Reject'
                                  ? 'red'
                                  : job.status === 'Completed'
                                  ? '#22a6b3'
                                  : '',
                            }}
                          >
                            {job.status}
                          </Label>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No assigned jobs.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}

      {activeTabValue === 3 && (
        <Grid item sm={12} md={6}>
          <Card>
            <CardContent>
              {formValues.images && formValues.images.length > 0 ? (
                <ImageList sx={{ width: 800, height: 500 }} cols={3} rowHeight={164}>
                  {formValues.images.map((item) => (
                    <ImageListItem key={item.image_path}>
                      <img
                        srcSet={`storage/${item.image_path}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                        src={`${config}/${item.image_path}`}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No images available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </div>
  );
}
