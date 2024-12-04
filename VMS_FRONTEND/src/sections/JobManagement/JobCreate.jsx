import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';

export default function JobCreate() {
  const [isVisible, setIsVisible] = useState(true);
  const [responseErr, setResponseErr] = useState(false);
  const [errMessage, setErrorMessage] = useState('');
  const [responseSuccess, setResponseSuccess] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const token = currentUser.token;
  const navigate = useNavigate();

  const jobs = [
    { id: 'main job', name: 'Main Job' },
    { id: 'sub job', name: 'Sub Job' },
  ];

  const [formValues, setFormValues] = useState({
    name: {
      value: '',
      error: false,
      errorMessage: 'Name is required',
    },
    type: {
      value: '',
      error: false,
      errorMessage: 'Type is required',
    },
    // price: {
    //   value: '',
    //   error: false,
    //   errorMessage: 'Price is required',
    // },
  });

  //---------------------------------------------------------------------------------------------------

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

    const isValid = /^[a-zA-Z0-9 ]+$/.test(value);

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
      createJob();
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

  const createJob = async () => {
    try {
      setAuthToken(token);
      setLoading(true);
      await axiosInstance
        .post('/api/jobs', {
          ...formValues,
          name: formValues.name.value,
          type: formValues.type.value,
         
        })
        .then((response) => {
          if (response.data.status === true) {
            setResponseSuccess(true);
            resetFormValues();
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

  return (
    <div>
      <Card>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" style={{ marginBottom: '20px' }}>
              Create a Job
            </Typography>

            <Button onClick={() => window.history.back()} color="primary">
              Back
            </Button>
          </div>

          <form noValidate onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl sx={{ width: '50%' }} error={formValues.type.error}>
                <InputLabel size="small" id="demo-simple-select-error-label">
                  Select a Job Type
                </InputLabel>
                <Select
                  name="type"
                  size="small"
                  labelId="demo-simple-select-error-label"
                  id="demo-simple-select-error"
                  label="Select a Vehicle Category"
                  onChange={handleChange}
                  defaultValue=""
                >
                  {jobs &&
                    jobs.map((job) => (
                      <MenuItem key={job.id} value={job.id}>
                        {job.name}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {formValues.type.error && formValues.type.errorMessage}
                </FormHelperText>
              </FormControl>

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter name"
                label="Name"
                name="name"
                variant="outlined"
                required
                value={formValues.name.value}
                onChange={handleChange}
                error={formValues.name.error}
                helperText={formValues.name.error && formValues.name.errorMessage}
              />

             

              <LoadingButton
                loading={loading}
                style={{ width: '50%' }}
                type="submit"
                variant="contained"
                color="primary"
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
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Job has been created successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={responseErr}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
