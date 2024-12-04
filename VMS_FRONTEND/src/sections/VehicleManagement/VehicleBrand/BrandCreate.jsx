import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
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

export default function BrandCreate() {
  const [isVisible, setIsVisible] = useState(true);
  const [responseErr, setResponseErr] = useState(false);
  const [errMessage, setErrorMessage] = useState('');
  const [responseSuccess, setResponseSuccess] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const token = currentUser.token;
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    name: {
      value: '',
      error: false,
      errorMessage: 'Name is required',
    },
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

    if (value === '') {
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: false,
          errorMessage: '',
        },
      });
    } else {
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
    }
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
      createBrand();
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

  const createBrand = async () => {
    try {
      setAuthToken(token);
      setLoading(true);
      await axiosInstance
        .post('/api/brand', {
          ...formValues,
          name: formValues.name.value,
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
            <Typography Typography variant="h5" style={{ marginBottom: '20px' }}>
              Create a Vehicle Brand
            </Typography>

            <Button onClick={() => window.history.back()} color="primary">
              Back
            </Button>
          </div>

          <form noValidate onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                size="small"
                style={{ width: '50%' }}
                label="Name"
                name="name"
                variant="outlined"
                required
                value={formValues.name.value}
                onChange={handleChange}
                error={formValues.name.error}
                helperText={formValues.name.error && <span>{formValues.name.errorMessage}</span>}
              />

              <LoadingButton
                loading={loading}
                disabled={formValues.name.error || formValues.name.value === ''}
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
          Vehicle Brand has been created successfully
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
