import { useTheme } from '@emotion/react';
import { LoadingButton } from '@mui/lab'
import { Box, Card, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { axiosInstance } from 'src/axiosinstance/axiosinstance';
import Iconify from 'src/components/iconify'
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice';


export default function Login() {

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


      const handleClickOpen = () => {
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
        dispatch(signOutSuccess())
      };

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
                dispatch(signInFailure(err.message))
            }
           
          }


  return (
      
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
   
  )
}
