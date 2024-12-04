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

export default function ViewVehicleRecord() {
  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [errMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = currentUser.token;
  const params = useParams();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    service_info: {
      vehicle_number: '',
      vehicle_brand: '',
      engine_capacity: '',
      fuel_type: '',
      vehicle_model: '',
      remark: '',
      status: '',
      year_of_made: '',
      millage: '',
      first_name: '',
      last_name: '',
      mobile_number: '',
      nic: '',
      type: '',
      address: '',
      email: '',
      government_order_form:''
    },
   
    assinged_jobs: [],
    images: [],
  });

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

  try {
    const response = await axiosInstance.get(`/api/vehicleService/show/${params.id}`);
    if (response.data.status === true) {
      const { serviceRecord, jobs, images } = response.data;
      setFormValues(prevState => ({
        ...prevState,
        service_info: {
          ...prevState.service_info,
          vehicle_number: serviceRecord.vehicle_number,
          vehicle_brand: serviceRecord.vehicle_brand,
          engine_capacity: serviceRecord.engine_capacity,
          fuel_type: serviceRecord.fuel_type,
          vehicle_model: serviceRecord.vehicle_model,
          remark: serviceRecord.remark,
          status: serviceRecord.status,
          year_of_made: serviceRecord.year_of_made,
          millage: serviceRecord.millage,
          first_name: serviceRecord.first_name,
          last_name: serviceRecord.last_name,
          mobile_number: serviceRecord.mobile_number,
          nic: serviceRecord.nic,
          type: serviceRecord.type,
          address: serviceRecord.address,
          email: serviceRecord.email,
          government_order_form: serviceRecord.government_order_form,
        },
        assinged_jobs: [...jobs],
        images: [...images],
      }));
    } else {
      setErrorMessage(response.data.message);
      setResponseErr(true);
    }
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
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

  return (
    <div>
      <Container maxWidth="ls">
        <Card>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" style={{ marginBottom: '20px' }}>
                View Recrod
              </Typography>
              <Button onClick={() => window.history.back()} color="primary">
                Back
              </Button>
            </div>

            <hr />

            <Grid container>
              <Grid item sm={12} md={6}>
                <Typography variant="h6" style={{ marginBottom: '10px' }} color="grey">
                  Vehicle Record
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth={true}
                    label="Vehicle Number"
                    variant="outlined"
                    disabled
                    value={formValues.service_info.vehicle_number}
                  />
                  <TextField
                    fullWidth={true}
                    label="Vehicle Brand"
                    variant="outlined"
                    disabled
                    value={formValues.service_info.vehicle_brand}
                  />
                  <TextField
                    fullWidth={true}
                    label="Model"
                    variant="outlined"
                    disabled
                    value={formValues.service_info.vehicle_model}
                  />
                  <TextField
                    fullWidth={true}
                    label="Enigne Capacity"
                    variant="outlined"
                    disabled
                    value={formValues.service_info.engine_capacity}
                  />
                  <TextField
                    fullWidth={true}
                    label="Fuel Type"
                    variant="outlined"
                    disabled
                    value={formValues.service_info.fuel_type}
                  />
                  <TextField
                    fullWidth={true}
                    label="Remark"
                    variant="outlined"
                    disabled
                    value={formValues.service_info.remark}
                  />

                  <TextField
                    fullWidth={true}
                    label="Millage"
                    variant="outlined"
                    disabled
                    value={formValues.service_info.millage}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Label> Service Status : </Label>
                    <Chip
                      size="small"
                      label={formValues.service_info.status}
                      color={getStatusChipColor(formValues.service_info.status)}
                      variant="outlined"
                    />
                  </div>
                </Stack>
              </Grid>
              <Grid item sm={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" style={{ marginBottom: '10px' }} color="grey">
                      Customer Record
                    </Typography>
                    <Stack spacing={2}>
                      <span>
                        <Label>First Name : </Label>
                        <Typography variant="lead" style={{ marginLeft: '10px' }} color="grey">
                          {formValues.service_info.first_name}
                        </Typography>
                      </span>
                      <span>
                        <Label>Last Name : </Label>
                        <Typography variant="lead" style={{ marginLeft: '10px' }} color="grey">
                          {formValues.service_info.last_name}
                        </Typography>
                      </span>
                      {/* <span>
                        <Label>Email : </Label>
                        <Typography variant="lead" style={{ marginLeft: '10px' }} color="grey">
                          {formValues.service_info.email}
                        </Typography>
                      </span> */}
                      <span>
                        <Label>Mobile Number : </Label>
                        <Typography variant="lead" style={{ marginLeft: '10px' }} color="grey">
                          {formValues.service_info.mobile_number}
                        </Typography>
                      </span>
                      <span>
                        <Label>NIC : </Label>
                        <Typography variant="lead" style={{ marginLeft: '10px' }} color="grey">
                          {formValues.service_info.nic}
                        </Typography>
                      </span>
                      <span>
                        <Label>Address : </Label>
                        <Typography variant="lead" style={{ marginLeft: '10px' }} color="grey">
                          {formValues.service_info.address}
                        </Typography>
                      </span>
                      <span>
                        <Label>Customer Type : </Label>
                        <Typography variant="lead" style={{ marginLeft: '10px' }} color="grey">
                          {formValues.service_info.type}
                        </Typography>
                      </span>
                      {formValues.service_info.type === 'Government' && (
                        <span>
                          <Label>Order Form: </Label>
                          <Typography variant="lead" style={{ marginLeft: '10px' }} color="grey">
                            {formValues.service_info.government_order_form == 1 ? 'Yes' : 'No'}
                          </Typography>
                        </span>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <hr />
            <Stack spacing={2}>
              <Typography variant="h6" style={{ marginBottom: '10px' }} color="grey">
                Assigned Jobs
              </Typography>
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
                          <Label>{job.status}</Label>
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
            </Stack>

            <Stack spacing={2}>
              <hr />
              <Typography variant="h6" style={{ marginBottom: '10px' }} color="grey">
                Vehicle Images
              </Typography>
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
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
