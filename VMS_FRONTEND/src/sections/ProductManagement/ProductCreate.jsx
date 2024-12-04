import {
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  MenuItem,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';

const ProductCreate = () => {
  const { currentUser } = useSelector((state) => state.user);
  // console.log(currentUser);
  const token = currentUser.token;
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const [units, setUnits] = useState([
    { value: 'kg', label: 'Kilogram' },
    { value: 'l', label: 'Liter' },
    { value: 'per unit', label: 'Per Unit' },
  ]);

  const [formValues, setFormValues] = useState({
    name: {
      value: '',
      error: false,
      errorMessage: 'Name is required',
    },
    item_code: {
      value: '',
      error: false,
      errorMessage: 'Item Code is required',
    },
    model: {
      value: '',
      error: false,
      errorMessage: 'Model is required',
    },
    selling_price: {
      value: '',
      error: false,
      errorMessage: 'Selling Price is required',
    },
    perchasing_price: {
      value: '',
      error: false,
      errorMessage: 'Perchasing Price is required',
    },
    units: {
      value: '',
      error: false,
      errorMessage: 'Units is required',
    },
    expire_date: {
      value: null,
      error: false,
      errorMessage: 'Date is required',
    },
  });

  //-------------------------------------------------------------------------------------------------

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
    // console.log(name, value);
    let isValid = true;
    let errorMessage = '';

    if (name === 'name') {
      if (value != '') {
        isValid = /^[a-zA-Z ]+$/.test(value) && !/  {1,}/.test(value);
        errorMessage = isValid ? '' : 'Only letters are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'item_code') {
      const isValid = /^[a-zA-Z0-9-]+$/.test(value);
      errorMessage = isValid ? '' : 'Only letters and numbers are allowed';
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'model') {
      const isValid = /^[a-zA-Z0-9-]+$/.test(value);
      errorMessage = isValid ? '' : 'Only letters and numbers are allowed';
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'selling_price') {
      if (value !== '') {
        isValid = /^[0-9.]+$/.test(value); // Allow digits and decimal point
        errorMessage = isValid ? '' : 'Only numbers are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'perchasing_price') {
      if (value !== '') {
        isValid = /^[0-9.]+$/.test(value); // Allow digits and decimal point
        errorMessage = isValid ? '' : 'Only numbers are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    } else if (name === 'units') {
      if (value !== '') {
        isValid = /^[a-zA-Z ]+$/.test(value) && !/  {1,}/.test(value);
        errorMessage = isValid ? '' : 'Only letters are allowed';
      }
      setFormValues({
        ...formValues,
        [name]: {
          ...formValues[name],
          value,
          error: !isValid,
          errorMessage,
        },
      });
    }
  };

  const handleChangeDate = (date) => {
    // Handle date changes
    // setFormValues({
    //   ...formValues,
    //   expire_date: {
    //     value: date,
    //     error: false, // Update error based on validation logic
    //     errorMessage: '', // Update error message if necessary
    //   },
    // });

    setFormValues({
      ...formValues,
      ['expire_date']: {
        ...formValues['expire_date'],
        value: date,
        error: false,
        errorMessage: '',
      },
    });

    console.log(`Date: ${date}`);

    // console.log(formValues)
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

    // Check for empty values and validation errors related to multiple spaces
    formFields.forEach((currentField) => {
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
      } else if (/\s{2,}/.test(currentValue)) {
        newFormValues = {
          ...newFormValues,
          [currentField]: {
            ...newFormValues[currentField],
            error: true,
            errorMessage: 'Multiple spaces are not allowed',
          },
        };
        hasValidationErrors = true;
      }
    });

    if (!hasValidationErrors) {
      createProduct();
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

  const createProduct = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        name: formValues.name.value,
        item_code: formValues.item_code.value,
        model: formValues.model.value,
        selling_price: formValues.selling_price.value,
        purchasing_price: formValues.perchasing_price.value,
        units: formValues.units.value,
        expire_date: formValues.expire_date.value,
      };
      await axiosInstance.post('/api/product', payload).then((response) => {
        if (response.data.status === true) {
          setResponseSuccess(true);
          resetFormValues();
          setLoading(false);
        } else {
          setLoading(false);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  //------------------------------------------------------------------------------
  return (
    <div>
      <Card>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" style={{ marginBottom: '20px' }}>
              Create new Product
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
                placeholder="Enter Name"
                label="Name"
                name="name"
                variant="outlined"
                required
                value={formValues.name.value}
                onChange={handleChange}
                error={formValues.name.error}
                helperText={formValues.name.error && formValues.name.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Item Code"
                label="Item Code"
                name="item_code"
                variant="outlined"
                required
                value={formValues.item_code.value}
                onChange={handleChange}
                error={formValues.item_code.error}
                helperText={formValues.item_code.error && formValues.item_code.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Model"
                label="Model"
                name="model"
                variant="outlined"
                required
                value={formValues.model.value}
                onChange={handleChange}
                error={formValues.model.error}
                helperText={formValues.model.error && formValues.model.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Selling Price"
                label="Selling Price"
                name="selling_price"
                variant="outlined"
                required
                value={formValues.selling_price.value}
                onChange={handleChange}
                error={formValues.selling_price.error}
                helperText={formValues.selling_price.error && formValues.selling_price.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Purchesing Price"
                label="Purchesing Price"
                name="perchasing_price"
                variant="outlined"
                required
                value={formValues.perchasing_price.value}
                onChange={handleChange}
                error={formValues.perchasing_price.error}
                helperText={
                  formValues.perchasing_price.error && formValues.perchasing_price.errorMessage
                }
              />

              {/* add input as selection for units */}
              <TextField
                size="small"
                style={{ width: '50%' }}
                select
                label="Units"
                name="units"
                value={formValues.units.value}
                onChange={handleChange}
                variant="outlined"
                required
                error={formValues.units.error}
                helperText={formValues.units.error && formValues.units.errorMessage}
              >
                {units.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                  <DatePicker
                    defaultValue={null}
                    label="Expire Date"
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" style={{ width: '50%' }} />
                    )}
                    onChange={handleChangeDate}
                    name="expire_date"
                    value={formValues.expire_date.value}
                    error={formValues.expire_date.error}
                    helperText={formValues.expire_date.error && formValues.expire_date.errorMessage} // Provide the desired function to handle date changes
                  />
                </DemoContainer>
              </LocalizationProvider>

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
          Product has been created Successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={responseErr}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
          Something went wrong!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductCreate;
