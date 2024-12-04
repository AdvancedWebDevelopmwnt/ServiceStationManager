import { forwardRef, useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure, signOutSuccess, signOutFailure } from '../../redux/user/userSlice'

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { axiosInstance } from 'src/axiosinstance/axiosinstance';



// ----------------------------------------------------------------------

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function LoginView() {
  const theme = useTheme();

  const [showPassword, setShowPassword] = useState(false);

  const [responseErr, setResponseErr] = useState(false)
  const [responseSuccess, setResponseSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate()
  
  const { currentUser } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [passwordLoading, setpasswordLoading] = useState(false)
  const [showcurrentPassword, setshowcurrentPassword] = useState(false)
  const [shownewPassword, setshownewPassword] = useState(false)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    dispatch(signOutSuccess())
  };

  const [formValues, setFormValues] = useState({
    email:{
      value:'',
      error:false,
      errorMessage:'You must enter valid email address'
    },
    password:{
      value:'',
      error:false,
      errorMessage:'You must enter a valid password'
    }
   
  })


  const [updatePassword, setUpdatePassword] = useState({
    currentPassword:{
      value:'',
      error:false,
      errorMessage:'You must enter your current password'
    },
    newpassword:{
      value:'',
      error:false,
      errorMessage:'You must enter a valid new password'
    }
  })

  
  const handlechangePassword = (e) => {
    const {name, value} = e.target;
    setUpdatePassword({
      ...updatePassword,
      [name]:{
        ...updatePassword[name],
        value,
        error: false, 
      }
    })
  }

  const submitPassowrdChangeForm = () => {
    const formFields = Object.keys(updatePassword);
    let hasValidationErrors = false;
    let newFormValues = {...updatePassword}

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = updatePassword[currentField].value;

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
      updateUserPassword();
    }
  }

  const updateUserPassword = async () => {
    try{

      setpasswordLoading(true)

      const requestBody = {
        currentPassword: updatePassword.currentPassword.value, 
        password: updatePassword.newpassword.value,
        confirmPassword : updatePassword.newpassword.value,
      }
       
      const response = await fetch('/api/User/changepassword',{
        method:'PUT',
        headers:{
          'content-type': 'application/json',
          'Authorization': `Bearer ${currentUser.data.token}`
        },
        body:JSON.stringify(requestBody)
      })
  
      const data = await response.json()
      if(data.isSuccess === true) {
          setOpen(false)
          setpasswordLoading(false)
          navigate('/dashboard') 
            
      }else{
        setOpen(false)
        setpasswordLoading(false)
        setResponseErr(true)
        notifyError(data.message)
        //navigate to home page
      }
    }
    catch(err){
        console.log(err)
    }
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormValues({
      ...formValues,
      [name]:{
        ...formValues[name],
        value,
        error: false, 
      }
    })
  }

    //notify error msg
    const notifyError = (err) =>{
      toast.error(err, {
        theme: "colored",
        position: toast.POSITION.TOP_RIGHT
      });
    }

  const handleClick = () => {
    const formFields = Object.keys(formValues);
    let hasValidationErrors = false;
    let newFormValues = {...formValues}

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
      signIn();
    }

    setFormValues(newFormValues)

    
  };

  const signIn = async () => {

    try{

      setLoading(true)
      
      const response = await axiosInstance.post('/api/login',
              {...formValues, 
                username: formValues.email.value,
                 password: formValues.password.value
              })
  
      
      if(response.data.status === true) {
        if(response.data.user.reset_psw == 1){
          setLoading(false)
          setOpen(true)
          dispatch(signInSuccess(response.data))
        } else{
          setLoading(false)
          dispatch(signInSuccess(response.data)) 
          
          const hasSpecificPermission = response.data.permissions.some(
            (permission) => permission.permission_list.includes('vehicle-registration','vehicle-supervise')
          );

          if (hasSpecificPermission) {
            navigate('/servicePortal/welcome');
          } else {
            navigate('/dashboard');
          }
         
        }         
      }else{

        setLoading(false)
        setResponseErr(true)
        notifyError(response.data.message)
        //navigate to home page
      }
    }
    catch(err){
      console.log(err)
        dispatch(signOutFailure(err.message))
    }
   
  }



  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.8),
          imgUrl: '/assets/background/overlay_3.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
      <Card
            sx={{
              p: 5,
              width: 1,
              maxWidth: 420,
              textAlign: 'center' // Center align the card content
            }}
          >
            <Typography variant="h4" style={{ marginBottom: '14px' }}>Sign in to VMS</Typography>

            <Stack spacing={3} sx={{ width: '100%' }}> {/* Added width to Stack */}
              <TextField 
                name="email" 
                label="Username" 
                value={formValues.email.value}
                onChange={handleChange}
                error={formValues.email.error}
                helperText={formValues.email.error && formValues.email.errorMessage}
                fullWidth  // Make the text field full width
              />

              <TextField
                name="password"
                label="Password"
                value={formValues.password.value}
                onChange={handleChange}
                error={formValues.password.error}
                helperText={formValues.password.error && formValues.password.errorMessage}
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Stack>

            {/* Add spacing below the form */}
            <Stack spacing={2} sx={{ marginTop: '1rem' }}>
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleClick}
                loading={loading}
              >
                Login
              </LoadingButton>
              {responseErr && <ToastContainer/>}
            </Stack>

            {/* Optional: Add a "Forgot Password?" link */}
            {/* <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
              <Link variant="subtitle2" underline="hover">
                Forgot password?
              </Link>
            </Stack> */}
          </Card>
      </Stack>

      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Update Your Passsword!</DialogTitle>
       
        <DialogContent style={{padding:'10px'}}>
           <Stack spacing={2}>
              <TextField
              name="currentPassword"
              label="Current Password"
              value={updatePassword.currentPassword.value}
              onChange={handlechangePassword}
              error={updatePassword.currentPassword.error}
              helperText={updatePassword.currentPassword.error && updatePassword.currentPassword.errorMessage}
              type={showcurrentPassword? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setshowcurrentPassword(!showcurrentPassword)} edge="end">
                      <Iconify icon={showcurrentPassword? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              />

              <TextField
              name="newpassword"
              label="New Password"
              value={updatePassword.newpassword.value}
              onChange={handlechangePassword}
              error={updatePassword.newpassword.error}
              helperText={updatePassword.newpassword.error && updatePassword.newpassword.errorMessage}
              type={shownewPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setshownewPassword(!shownewPassword)} edge="end">
                      <Iconify icon={shownewPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              />
          </Stack>
         

        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='error' onClick={handleClose}>Cancel</Button>
          <Button variant='contained' color='success' onClick={submitPassowrdChangeForm}>Update</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
