import {
    Alert,
    AlertTitle,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
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
  import { useNavigate, useParams } from 'react-router-dom';
  
  export default function VehicleRegistrationEdit() {
    const [responseErr, setResponseErr] = useState(false);
    const [responseSuccess, setResponseSuccess] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const [errMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false);
    const token = currentUser.token; 
    const params = useParams();
    const navigate = useNavigate()
    const [vehicleBrands, setVehicleBrands] = useState([]);
  
    const [formValues, setFormValues] = useState({
        first_name: {
          value: '',
          error: false,
          errorMessage: 'First Name is required',
        },
        last_name: {
          value: '',
          error: false,
          errorMessage: 'Last Name is required',
        },
        nic:{
          value: '',
          error: false,
          errorMessage: '',
        },
        mobile_number:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
        address:{
          value: '',
          error: false,
          errorMessage: '',
        },
        
        vehicle_number:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
        vehicle_brand:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
        vehicle_model:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
        year_of_made:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
        engine_capacity:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
        fuel_type:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
        remark:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
        millage:{
          value: '',
          error: false,
          errorMessage: '',
        },
    
    
       
      });
    
      const fuelTypes = [
        { id: 1, name: 'Patrol' },
        { id: 2, name: 'Diesel' },
        { id: 3, name: 'Hybrid' },
        { id: 4, name: 'Electric' },
      ];
    
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

    const requiredFields = ['first_name', 'last_name', 'mobile_number', 'vehicle_number', 'vehicle_model', 'vehicle_brand', 'year_of_made'];
  
    const handleChange = (e) => {
      const { name, value } = e.target;

      let newFormValues = { ...formValues };
      newFormValues[name].value = value;

      if(requiredFields.includes(name) && value === ''){
        newFormValues[name].error = true;
        newFormValues[name].errorMessage = `${name} is required`;
      }else{
        newFormValues[name].error = false;
        newFormValues[name].errorMessage = '';
      }

      setFormValues(newFormValues);
    };
  
    const handleSubmit = (e) => {
        e.preventDefault();
      
        const requiredFields = ['first_name', 'last_name', 'mobile_number', 'vehicle_number', 'vehicle_model', 'vehicle_brand', 'year_of_made'];
        let newFormValues = { ...formValues };
        let hasValidationErrors = false;
      
        for (let index = 0; index < requiredFields.length; index++) {
          const currentField = requiredFields[index];
          const currentValue = formValues[currentField].value;
      
          if (currentValue === '') {
            newFormValues = {
              ...newFormValues,
              [currentField]: {
                ...newFormValues[currentField],
                error: true,
                errorMessage: 'This field is required',
              },
            };
            hasValidationErrors = true;
           
          }
        }
      
        if (!hasValidationErrors) {
            updaVehicleRegistration();
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
  
      const response = await axiosInstance.get(`/api/register/show/${params.id}`);
      if (response.data.status === true) {
       
        const vehicleData = response.data.vehicleData[0]
        updateFormValues(vehicleData);
      } else {
        setErrorMessage(response.data.message)
        setResponseErr(true);
      }
    };

    const getAllBrand = async () => {
        try {
          setAuthToken(token);
    
          await axiosInstance.get('/api/brand').then((response) => {
            if (response.data.status == true) {
              setVehicleBrands(response.data.brand);
            } else {
              setErrMsg(response.data.message);
              setResponseErr(true);
            }
          });
        } catch (err) {
          console.error(err);
        }
      };
  
    const updaVehicleRegistration = async () => {
      try {
        setAuthToken(token);
        setLoading(true);
        
        const payload = {
              first_name:formValues.first_name.value,
              last_name:formValues.last_name.value,
              nic:formValues.nic.value,
              mobile_number:formValues.mobile_number.value,
              address:formValues.address.value,
              vehicle_number:formValues.vehicle_number.value,
              vehicle_brand:formValues.vehicle_brand.value,
              vehicle_model:formValues.vehicle_model.value,
              year_of_made:formValues.year_of_made.value,
              engine_capacity:formValues.engine_capacity.value,
              fuel_type:formValues.fuel_type.value
            }
        await axiosInstance
          .post(`/api/register/${params.id}`,payload)
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
        getVehicleData();
        getAllBrand()
    }, []);
  
    return (
      <div>
         <Container maxWidth="lg">
            <form noValidate onSubmit={handleSubmit}>
             <Card>
                <CardContent>
                <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
                    <Button onClick={() => window.history.back()} color="primary">
                    Back
                    </Button>
                </div>
                    <Typography variant="h5">Edit Customer Record</Typography>
                    <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item md={6}>
                        <TextField
                        fullWidth={true}
                        label="First Name"
                        name="first_name"
                        variant="outlined"
                        required
                        value={formValues.first_name.value}
                        onChange={handleChange}
                        error={formValues.first_name.error}
                        helperText={formValues.first_name.error && formValues.first_name.errorMessage}
                        />
                    </Grid>

                    <Grid item md={6}>
                        <TextField
                        fullWidth={true}
                        label="Last Name"
                        name="last_name"
                        variant="outlined"
                        required
                        value={formValues.last_name.value}
                        onChange={handleChange}
                        error={formValues.last_name.error}
                        helperText={formValues.last_name.error && formValues.last_name.errorMessage}
                        />
                    </Grid>
                    
                    </Grid>
                    <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item md={6}>
                        <TextField
                        fullWidth={true}
                        label="Mobile Number"
                        name="mobile_number"
                        variant="outlined"
                        required
                        value={formValues.mobile_number.value}
                        onChange={handleChange}
                        error={formValues.mobile_number.error}
                        helperText={formValues.mobile_number.error && formValues.mobile_number.errorMessage}
                        />
                    </Grid>

                    <Grid item md={6}>
                        <TextField
                        fullWidth={true}
                        label="NIC"
                        name="nic"
                        variant="outlined"
                        value={formValues.nic.value}
                        onChange={handleChange}
                        error={formValues.nic.error}
                        helperText={formValues.nic.error && formValues.nic.errorMessage}
                        />
                    </Grid>
                    
                    </Grid>

                    <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item md={6}>
                        <TextField
                        fullWidth={true}
                        label="Address"
                        name="address"
                        variant="outlined"
                        value={formValues.address.value}
                        onChange={handleChange}
                        error={formValues.address.error}
                        helperText={formValues.address.error && formValues.address.errorMessage}
                        />
                    </Grid>

                    
                    
                    </Grid>
                </CardContent>
                </Card>

            

                <Card style={{marginTop:'10px'}}>
                <CardContent>
                    <Typography variant="h5">Edit Vehicle Record</Typography>
                    <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item md={6}>
                        <TextField
                        fullWidth={true}
                        label="Vehicle Number"
                        name="vehicle_number"
                        variant="outlined"
                        required
                        value={formValues.vehicle_number.value}
                        onChange={handleChange}
                        error={formValues.vehicle_number.error}
                        helperText={formValues.vehicle_number.error && formValues.vehicle_number.errorMessage}
                        />
                    </Grid>

                    <Grid item md={6}>
                        <FormControl sx={{ width: '100%' }} error={formValues.vehicle_brand.error}>
                            <InputLabel id="demo-simple-select-error-label">
                            Select a Vehicle Brand
                            </InputLabel>
                            <Select
                            name="vehicle_brand"
                            labelId="demo-simple-select-error-label"
                            id="demo-simple-select-error"
                            label="Select a Vehicle Category"
                            defaultValue=""
                            value={formValues.vehicle_brand.value || ''}
                            onChange={(e) => {
                                handleChange(e);
                                // getAllModelRelatedToBrand(e);
                            }}
                            >
                            {vehicleBrands &&
                                vehicleBrands.map((brand) => (
                                <MenuItem key={brand.name} value={brand.id}>
                                    {brand.name}
                                </MenuItem>
                                ))}
                            </Select>

                            <FormHelperText>
                            {formValues.vehicle_brand.error && formValues.vehicle_brand.errorMessage}
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                </Grid>

                    <Grid container spacing={2} style={{marginTop:'10px'}}>
                    <Grid item md={6}>
                        <TextField
                        fullWidth={true}
                        label="Vehicle Model"
                        name="vehicle_model"
                        variant="outlined"
                        required
                        value={formValues.vehicle_model.value}
                        onChange={handleChange}
                        error={formValues.vehicle_model.error}
                        helperText={formValues.vehicle_model.error && formValues.vehicle_model.errorMessage}
                        />
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                        fullWidth={true}
                        label="Year of Make"
                        name="year_of_made"
                        variant="outlined"
                        required
                        type='number'
                        value={formValues.year_of_made.value}
                        onChange={handleChange}
                        error={formValues.year_of_made.error}
                        helperText={formValues.year_of_made.error && formValues.year_of_made.errorMessage}
                        />
                    </Grid>
                    
                    </Grid>

                    <Grid container spacing={2} style={{marginTop:'10px'}}>
                        <Grid item md={6}>
                        <TextField
                            fullWidth={true}
                            label="Engine Capacity"
                            name="engine_capacity"
                            variant="outlined"
                            value={formValues.engine_capacity.value}
                            onChange={handleChange}
                            error={formValues.engine_capacity.error}
                            helperText={formValues.engine_capacity.error && formValues.engine_capacity.errorMessage}
                            />
                        </Grid>
                        <Grid item md={6}>
                        <FormControl sx={{ width: '100%' }} error={formValues.fuel_type.error}>
                            <InputLabel id="demo-simple-select-error-label">Select a Fuel Type</InputLabel>
                            <Select
                                name="fuel_type"
                                labelId="demo-simple-select-error-label"
                                id="demo-simple-select-error"
                                label="Select a Fuel type"
                                onChange={handleChange}
                                defaultValue=""
                                value={formValues.fuel_type.value}
                            >
                                {fuelTypes &&
                                fuelTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.name}>
                                    {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                {formValues.fuel_type.error && formValues.fuel_type.errorMessage}
                            </FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>

                
                </CardContent>

                <CardActions>
                <LoadingButton
                        loading={loading}
                        disabled={loading}
                        style={{ width: '50%' }}
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Update Records
                    </LoadingButton>
                </CardActions>
                </Card>
            </form>

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
                Record Updated Successfully
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
        </Container>
      </div>
    );
  }