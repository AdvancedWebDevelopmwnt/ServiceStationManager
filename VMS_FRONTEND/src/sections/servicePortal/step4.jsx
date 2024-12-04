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
  CardContent,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice.js';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { saveCustomerInfo } from 'src/redux/user/customerSlice.js';
import ImageCaptureModal from 'src/layouts/dashboard/common/ImageCaptureModal';

const pageVariants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: '0%', transition: { ease: 'easeInOut', duration: 0.5 } },
  exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut', duration: 0.5 } },
};

export default function Step4() {
  const { currentUser } = useSelector((state) => state.user);
  const { customer_info } = useSelector((state) => state.customer);
  const { vehicle_info } = useSelector((state) => state.vehicle);
  const token = currentUser.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [imageName, setimageName] = useState('');

  const [formValues, setFormValues] = useState({
    interior_image_1: {
      value: '',
      imgUrl: '',
      error: false,
      errorMessage: 'Please upload Interior image',
    },
      interior_image_2:{
          value:'',
          imgUrl:'',
          error:false,
          errorMessage:'Please upload Interior image'

      },
      exterior_image_1:{
          value:'',
          imgUrl:'',
          error:false,
          errorMessage:'Please upload Exterior image'

      },

      exterior_image_2:{
          value:'',
          imgUrl:'',
          error:false,
          errorMessage:'Please upload Exterior image'
      },

      exterior_image_3:{
          value:'',
          imgUrl:'',
          error:false,
          errorMessage:'Please upload Exterior image'
      },

      exterior_image_4:{
          value:'',
          imgUrl:'',
          error:false,
          errorMessage:'Please upload Exterior image'
      },

      carpet_image:{
          value:'',
          imgUrl:'',
          error:false,
          errorMessage:'Please upload Carpet image'
      },
      engine_image:{
        value:'',
        imgUrl:'',
        error:false,
        errorMessage:'Please upload Engine Bay image'
     },

     trunk_image:{
      value:'',
      imgUrl:'',
      error:false,
      errorMessage:'Please upload Trunk image'
    }
  });

  const customerTypes = [
    { id: 1, name: 'Government' },
    { id: 2, name: 'Private' },
    { id: 3, name: 'Person' },
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
      dispatch(signInFailure());
    }
  };

  const navigateToBack = () => {
      navigate('/servicePortal/step3')
  }

  

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const formFields = Object.keys(formValues);
    console.log(`formFields`, formFields);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

    // for (let index = 0; index < formFields.length; index++) {
    //   const currentField = formFields[index];
    //   const currentValue = formValues[currentField].value;

    //   if (currentValue === '') {
    //     console.log('kl');
    //     newFormValues = {
    //       ...newFormValues,
    //       [currentField]: {
    //         ...newFormValues[currentField],
    //         error: true,
    //       },
    //     };
    //     hasValidationErrors = true;
    //   }
    // }

    // if (!hasValidationErrors) {
    
    //   saveOrupdateVehicleInfo();
    // }

    saveOrupdateVehicleInfo();

    setFormValues(newFormValues);
  };



  const saveOrupdateVehicleInfo = async () => {
    console.log('save ok');
    setAuthToken(token);
    setLoading(true);
    const payload = {
      mobile_number: customer_info.mobile_number,
      vehicle_number: vehicle_info.vehicle_number,
      vehicle_brand: vehicle_info.vehicle_brand,
      vehicle_model: vehicle_info.vehicle_model,
      vehicle_millage: vehicle_info.vehicle_millage,
      year_of_made: vehicle_info.year_of_made,
      engine_capacity: vehicle_info.engine_capacity,
      fuel_type: vehicle_info.fuel_type,
      remark: vehicle_info.remark,
      interior_image_1: formValues.interior_image_1.value,
      interior_image_2: formValues.interior_image_2.value,
      exterior_image_1: formValues.exterior_image_1.value,
      exterior_image_2: formValues.exterior_image_2.value,
      exterior_image_3: formValues.exterior_image_3.value,
      exterior_image_4: formValues.exterior_image_4.value,
      carpet_image: formValues.carpet_image.value,
      engine_image: formValues.engine_image.value,
      trunk_image: formValues.trunk_image.value,
      millage: vehicle_info.millage,
    };

    const response = await axiosInstance.post(
      '/api/servicePortal/saveOrupdateVehicleInfo',
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log(`response`, response);

    if (response.data.status === true) {
      setLoading(false);
      navigate('/servicePortal/jobSelection');
    } else {
      setErrMsg(response.data.message);
      setLoading(false);
      setResponseErr(true);
    }

    console.log(response);
  };

  const handleOpenCaptureModal = (imageName) => {
    setimageName(imageName);
    setCaptureModalOpen(true);
    setFormValues({
      ...formValues,
      [imageName]: {
        ...formValues[imageName],
        error: false,
        errorMessage: '',
      },
    });
  };

  const handleCloseCaptureModal = () => {
    setCaptureModalOpen(false);
  };

  const handleSaveImage = (imageSrc, imgType) => {
    fetch(imageSrc)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        switch (imgType) {
          case 'interior_image_1':
            setFormValues((prevFormValues) => ({
              ...prevFormValues,
              interior_image_1: {
                ...prevFormValues.interior_image_1,
                value: blob,
                imgUrl: URL.createObjectURL(blob),
              },
            }));
            break;
          case 'interior_image_2':
            setFormValues((prevFormValues) => ({
              ...prevFormValues,
              interior_image_2: { ...prevFormValues.interior_image_2, value: blob, imgUrl: URL.createObjectURL(blob)},
            }));
            break;
          case 'exterior_image_1':
            setFormValues((prevFormValues) => ({
              ...prevFormValues,
              exterior_image_1: { ...prevFormValues.exterior_image_1, value: blob , imgUrl: URL.createObjectURL(blob) },
            }));
            break;
          case 'exterior_image_2':
              setFormValues((prevFormValues) => ({
                ...prevFormValues,
                exterior_image_2: { ...prevFormValues.exterior_image_2, value: blob, imgUrl: URL.createObjectURL(blob) },
              }));
              break;
          case 'exterior_image_3':
            setFormValues((prevFormValues) => ({
              ...prevFormValues,
              exterior_image_3: { ...prevFormValues.exterior_image_3, value: blob, imgUrl: URL.createObjectURL(blob) },
            }));
            break;
          case 'exterior_image_4':
            setFormValues((prevFormValues) => ({
              ...prevFormValues,
              exterior_image_4: { ...prevFormValues.exterior_image_4, value: blob, imgUrl: URL.createObjectURL(blob) },
            }));
            break;
          case 'carpet_image':
              setFormValues((prevFormValues) => ({
                  ...prevFormValues,
                  carpet_image: { ...prevFormValues.carpet_image, value: blob, imgUrl: URL.createObjectURL(blob)},
                }));
            break;

          case 'engine_image':
              setFormValues((prevFormValues) => ({
                  ...prevFormValues,
                  engine_image: { ...prevFormValues.engine_image, value: blob, imgUrl: URL.createObjectURL(blob)},
                }));
            break;

          case 'trunk_image':
              setFormValues((prevFormValues) => ({
                  ...prevFormValues,
                  trunk_image: { ...prevFormValues.trunk_image, value: blob, imgUrl: URL.createObjectURL(blob)},
                }));
            break;
          default:
        }
      });

    setCaptureModalOpen(false);
  };

  useEffect(() => {
    if (token) {
      checkTokenExpire();
    }
  }, []);

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
    <Container maxWidth="md">
      <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center',minHeight: '100vh', }}>
        <Card sx={{ p: 5, margin: 'auto', width: '100%' }}>
          <Typography variant="h5" style={{ textAlign: 'center', marginBottom:'20px' }}>
            Vehicle Images Capturing
          </Typography>

          <Stack spacing={2} direction="column" alignItems="center">
           
              <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Interior Image 1</Typography>
                              <Button onClick={() => handleOpenCaptureModal('interior_image_1')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.interior_image_1.value && 
                                  <img src={formValues.interior_image_1.imgUrl} alt="Interior Image 1" style={{ width: '100%', marginTop:'10px' }} />}
                              
                              <FormHelperText style={{textAlign:'center'}} error={formValues.interior_image_1.error}>{formValues.interior_image_1.error && formValues.interior_image_1.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Interior Image 2</Typography>
                              <Button onClick={() => handleOpenCaptureModal('interior_image_2')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.interior_image_2.value && 
                                  <img src={formValues.interior_image_2.imgUrl} alt="Interior Image 1" style={{ width: '100%', marginTop:'10px' }} />}
                              <FormHelperText style={{textAlign:'center'}} error={formValues.interior_image_2.error}>{formValues.interior_image_2.error && formValues.interior_image_2.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
              </Grid>

              <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Exterior Image 1</Typography>
                              <Button onClick={() => handleOpenCaptureModal('exterior_image_1')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.exterior_image_1.value && 
                                  <img src={formValues.exterior_image_1.imgUrl} alt="Interior Image 1" style={{ width: '100%', marginTop:'10px' }} />}
                              <FormHelperText style={{textAlign:'center'}} error={formValues.exterior_image_1.error}>{formValues.exterior_image_1.error && formValues.exterior_image_1.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Exterior Image 2</Typography>
                              <Button onClick={() => handleOpenCaptureModal('exterior_image_2')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.exterior_image_2.value && 
                                  <img src={formValues.exterior_image_2.imgUrl} alt="Interior Image 1" style={{ width: '100%', marginTop:'10px' }} />}
                              <FormHelperText style={{textAlign:'center'}} error={formValues.exterior_image_2.error}>{formValues.exterior_image_2.error && formValues.exterior_image_2.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
              </Grid>

              <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Exterior Image 3</Typography>
                              <Button onClick={()=>handleOpenCaptureModal('exterior_image_3')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.exterior_image_3.value && 
                                  <img src={formValues.exterior_image_3.imgUrl} alt="Interior Image 1" style={{ width: '100%', marginTop:'10px' }} />}
                              <FormHelperText style={{textAlign:'center'}} error={formValues.exterior_image_3.error}>{formValues.exterior_image_3.error && formValues.exterior_image_3.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Exterior Image 4</Typography>
                              <Button onClick= {() => handleOpenCaptureModal('exterior_image_4')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.exterior_image_4.value && 
                                  <img src={formValues.exterior_image_4.imgUrl} alt="Interior Image 1" style={{ width: '100%', marginTop:'10px' }} />}
                              <FormHelperText style={{textAlign:'center'}} error={formValues.exterior_image_4.error}>{formValues.exterior_image_4.error && formValues.exterior_image_4.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
              </Grid>

              <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Carpets Image </Typography>
                              <Button onClick={() => handleOpenCaptureModal('carpet_image')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.carpet_image.value && 
                                  <img src={formValues.carpet_image.imgUrl} alt="carpet Image 1" style={{ width: '100%', marginTop:'10px' }} />}
                              <FormHelperText style={{textAlign:'center'}} error={formValues.carpet_image.error}>{formValues.carpet_image.error && formValues.carpet_image.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Engine Bay </Typography>
                              <Button onClick={() => handleOpenCaptureModal('engine_image')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.engine_image.value && 
                                  <img src={formValues.engine_image.imgUrl} alt="Engine Bay Image" style={{ width: '100%', marginTop:'10px' }} />}
                              <FormHelperText style={{textAlign:'center'}} error={formValues.engine_image.error}>{formValues.engine_image.error && formValues.engine_image.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
              </Grid>

              <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6}>
                      <Card style={{backgroundColor:'#f1f2f6'}}>
                          <CardContent>
                              <Typography variant="h6" style={{ textAlign: 'center'}}>Trunk Image </Typography>
                              <Button onClick={() => handleOpenCaptureModal('trunk_image')} variant='outlined' color='success' style={{width:'100%'}}>Capture</Button>
                              {formValues.trunk_image.value && 
                                  <img src={formValues.trunk_image.imgUrl} alt="Trunk Image 1" style={{ width: '100%', marginTop:'10px' }} />}
                              <FormHelperText style={{textAlign:'center'}} error={formValues.trunk_image.error}>{formValues.trunk_image.error && formValues.trunk_image.errorMessage}</FormHelperText>
                          </CardContent>
                      </Card>
                  </Grid>
               
              </Grid>
         

          </Stack>

          <Stack spacing={2} direction="row" alignItems="flex-end" justifyContent="flex-end" mt={2}>
            <Button variant="outlined" color="error" onClick={navigateToBack} startIcon={<Iconify icon="bx:arrow-back" />}>
              Back
            </Button>

            <LoadingButton
              loading={loading}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Next
            </LoadingButton>
          </Stack>
        </Card>

        <ImageCaptureModal isOpen={captureModalOpen} imgType={imageName} onClose={handleCloseCaptureModal} onSave={handleSaveImage}/>
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
