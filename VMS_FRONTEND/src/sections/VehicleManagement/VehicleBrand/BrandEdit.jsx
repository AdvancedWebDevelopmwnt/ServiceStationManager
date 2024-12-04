import {
    Alert,
    AlertTitle,
    Button,
    Card,
    CardContent,
    FormControlLabel,
    FormHelperText,
    Radio,
    RadioGroup,
    Snackbar,
    Stack,
    TextField,
    Typography,
  } from '@mui/material';
  import React, { useEffect, useState } from 'react';
  import { useSelector } from 'react-redux';
  import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
  import { LoadingButton } from '@mui/lab';
  import { useNavigate, useParams } from 'react-router-dom';
  
  export default function BrandEdit() {
    const [responseErr, setResponseErr] = useState(false);
    const [responseSuccess, setResponseSuccess] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const [errMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false);
    const token = currentUser.token; 
    const params = useParams();
    const navigate = useNavigate()
  
    const [formValues, setFormValues] = useState({
      id: {
        value: '',
      },
  
      name: {
        value: '',
        error: false,
        errorMessage: 'name is required',
      },

      disabled:{
        value: '0',
        error: false,
        errorMessage: 'You must select Status',
     }
  
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
        updateBrand();
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
  
    const getBrandData = async () => {
      setAuthToken(token);
  
      const response = await axiosInstance.get(`/api/brand/show/${params.id}`);
      if (response.data.status === true) {
       
        const brandData = response.data.brand
        brandData.disabled = brandData.disabled.toString();
        updateFormValues(brandData);
      } else {
        setErrorMessage(response.data.message)
        setResponseErr(true);
      }
    };

    
  
    const updateBrand = async () => {
      try {
        setAuthToken(token);
        setLoading(true);
        await axiosInstance
          .post(`/api/brand/${params.id}`, {
            ...formValues,
            name: formValues.name.value,
            disabled:formValues.disabled.value == '0' ? false : true
          })
          .then((response) => {
            if (response.data.status === true) {
              setResponseSuccess(true);
              setLoading(false);
            } else {
              setLoading(false);
              setResponseErr(true);
              setErrorMessage(response.data.message)
            }
          });
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
  
    useEffect(() => {
      getBrandData();
    }, []);
  
    return (
      <div>
        <Card>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" style={{ marginBottom: '20px' }}>
                Edit a Vehicle Brand
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
                  placeholder="Enter your name"
                  label="Name"
                  name="name"
                  variant="outlined"
                  required
                  value={formValues.name.value}
                  onChange={handleChange}
                  error={formValues.name.error}
                  helperText={formValues.name.error && formValues.name.errorMessage}
                />

                <RadioGroup
                    name='disabled'
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    defaultValue=""
                    value={formValues.disabled.value}
                    onChange={handleChange}
                    >
                    <FormControlLabel
                        value="0" 
                        control={<Radio />}
                        label="Active"
                    />
                    <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label="De-Active"
                    />
                </RadioGroup>
                <FormHelperText error={formValues.disabled.error}>
                {formValues.disabled.error && formValues.disabled.errorMessage}
                </FormHelperText>
  
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
            Vehicle Brand has been updated successfully
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