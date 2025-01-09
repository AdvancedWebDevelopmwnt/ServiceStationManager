import {
    Alert,
    Button,
    Card,
    CardContent,
    Snackbar,
    Stack,
    TextField,
    Typography,
  } from '@mui/material';
  import React, { useState } from 'react';
  import { useSelector } from 'react-redux';
  import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
  import { LoadingButton } from '@mui/lab';
  import { useNavigate } from 'react-router-dom';
  
  export default function CreateAppointment() {
    const [responseErr, setResponseErr] = useState(false);
    const [errMessage, setErrorMessage] = useState('');
    const [responseSuccess, setResponseSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser.token;
    const navigate = useNavigate();
  
    const [formValues, setFormValues] = useState({
      name: {
        value: '',
        error: false,
        errorMessage: 'Name is required',
      },
      appointment_date: {
        value: '',
        error: false,
        errorMessage: 'Appointment date is required',
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
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: value === '',
          errorMessage: value === '' ? `${name} is required` : '',
        },
      });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      let hasValidationErrors = false;
      const updatedFormValues = { ...formValues };
  
      for (const field in formValues) {
        if (formValues[field].value === '') {
          updatedFormValues[field].error = true;
          hasValidationErrors = true;
        }
      }
  
      setFormValues(updatedFormValues);
  
      if (!hasValidationErrors) {
        createAppointment();
      }
    };
  
    const resetFormValues = () => {
      setFormValues({
        name: { value: '', error: false, errorMessage: 'Name is required' },
        appointment_date: { value: '', error: false, errorMessage: 'Appointment date is required' },
      });
    };
  
    const createAppointment = async () => {
      try {
        setAuthToken(token);
        setLoading(true);
        const payload = {
          name: formValues.name.value,
          appointment_date: formValues.appointment_date.value,
        };
        const response = await axiosInstance.post('/api/appointments', payload);
  
        if (response.data.status === true) {
          setResponseSuccess(true);
          resetFormValues();
        } else {
          setResponseErr(true);
          setErrorMessage(response.data.message);
        }
        setLoading(false);
      } catch (error) {
        setResponseErr(true);
        setErrorMessage('An error occurred while creating the appointment');
        setLoading(false);
      }
    };
  
    return (
      <div>
        <Card>
          <CardContent>
            <Typography variant="h5" style={{ marginBottom: '20px' }}>
              Create an Appointment
            </Typography>
            <form noValidate onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  name="name"
                  variant="outlined"
                  required
                  size="small"
                  value={formValues.name.value}
                  onChange={handleChange}
                  error={formValues.name.error}
                  helperText={formValues.name.error && formValues.name.errorMessage}
                />
                <TextField
                  label="Appointment Date"
                  name="appointment_date"
                  variant="outlined"
                  required
                  size="small"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formValues.appointment_date.value}
                  onChange={handleChange}
                  error={formValues.appointment_date.error}
                  helperText={
                    formValues.appointment_date.error && formValues.appointment_date.errorMessage
                  }
                />
                <LoadingButton
                  loading={loading}
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    formValues.name.error ||
                    formValues.appointment_date.error ||
                    formValues.name.value === '' ||
                    formValues.appointment_date.value === ''
                  }
                >
                  Create
                </LoadingButton>
              </Stack>
            </form>
          </CardContent>
        </Card>
  
        <Snackbar
          open={responseSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSuccess} severity="success" variant="filled">
            Appointment created successfully!
          </Alert>
        </Snackbar>
  
        <Snackbar
          open={responseErr}
          autoHideDuration={3000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseError} severity="error" variant="filled">
            {errMessage}
          </Alert>
        </Snackbar>
      </div>
    );
  }
  