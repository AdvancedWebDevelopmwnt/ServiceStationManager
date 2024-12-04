import {
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
  FormControl,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import dateFormat from 'src/helpers/dateFormat';
import dayjs from 'dayjs';



const ProductEdit = () => {
  const { currentUser } = useSelector((state) => state.user);
  // console.log(currentUser);
  const token = currentUser.token;
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useParams();

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
    purchasing_price: {
      value: '',
      error: false,
      errorMessage: 'Perchasing Price is required',
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

  console.log(formValues)

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    let isValid = true;
    let errorMessage = '';

    if (name === 'name') {
      if (value != '') {
        isValid = /^[a-zA-Z ]+$/.test(value);
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
    } else if (name === 'purchasing_price') {
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
    }

    // console.log(formValues)
  };

  const handleExpireDateChange = (date) => {
    setFormValues({
      ...formValues,
        expire_date: {
        ...formValues.expire_date,
        value: date,
        error: false,
        errorMessage: '',
      },
    });
  };



  const handleSubmit = (e) => {
    e.preventDefault();

    // console.log('formd submit');
    // console.log(formValues);
    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;
    // console.log(formFields);
    // console.log(newFormValues);

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField].value;
      console.log(currentValue);

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
      upDateProduct();
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
    console.log(data)
    const newFormValues = {...formValues};

    Object.keys(newFormValues).forEach((key) => {
      if (key === 'expire_date' ) {
        newFormValues[key] = {
          ...newFormValues[key],
          value: data[key] ? new Date(data[key]) : null,
          error: false,
          errorMessage: '',
        };
      } else {
        newFormValues[key] = {
          ...newFormValues[key],
          value: data[key] || '',
          error: false,
          errorMessage: '',
        };

      }
    })

    setFormValues(newFormValues);

  };

  const getProductData = async () => {
    setAuthToken(token);

    const response = await axiosInstance.get(`/api/product/show/${params.id}`);
    if (response.data.status === true) {
      // const formattedRows = response.data.product.map((row) => ({
      //   ...row,
      //   expire_date: dateFormat(row.expire_date),
      
      // }));
      updateFormValues(response.data.product);
    } else {
      setResponseErr(true);
    }
  };

  

  const upDateProduct = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        name: formValues.name.value,
        item_code: formValues.item_code.value,
        model: formValues.model.value,
        selling_price: formValues.selling_price.value,
        purchasing_price: formValues.purchasing_price.value,
        expire_date: formValues.expire_date.value,
      };
      await axiosInstance.post(`/api/product/${params.id}`, payload).then((response) => {
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

  useEffect(() => {
    getProductData();
}, []);

  //------------------------------------------------------------------------------
  return (
    <div>
      <Card>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" style={{ marginBottom: '20px' }}>
              Update a product
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
                name="purchasing_price"
                variant="outlined"
                required
                value={formValues.purchasing_price.value}
                onChange={handleChange}
                error={formValues.purchasing_price.error}
                helperText={
                  formValues.purchasing_price.error && formValues.purchasing_price.errorMessage
                }
              />

              <FormControl sx={{width: "50%" }} error={formValues.expire_date.error}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            size="small"
                            label="Expire Date"
                            value={dayjs(dateFormat(formValues.expire_date.value))}
                            onChange={handleExpireDateChange}
                            name="expire_date"
                            slotProps={{ 
                                textField: {  
                                    size:'small', 
                                    variant: 'outlined' ,
                                    error:formValues.expire_date.error,
                                    helperText:formValues.expire_date.error && formValues.expire_date.errorMessage
                                } 
                              }}
                        />
                    </LocalizationProvider>
                </FormControl>

              <LoadingButton
                loading={loading}
                style={{ width: '50%' }}
                type="submit"
                variant="contained"
                color="primary"
              >
                Update
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
          Product has been Updated Successfully
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

export default ProductEdit;
