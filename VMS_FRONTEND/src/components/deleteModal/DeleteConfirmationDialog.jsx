import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { Alert, Container, IconButton, InputAdornment, Snackbar, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Iconify from '../iconify';
import { useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useNavigate, useParams } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onDelete,
}) {
  const [loading, setLoading] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const params = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    password: {
      value: '',
      error: false,
      errorMessage: 'You must enter a password',
    },
  });

  // ----------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    const isValidPassword =
      name === 'password' ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value) : true;
    setFormValues({
      ...formValues,
      [name]: {
        value,
        error: name === 'password' && !isValidPassword,
        errorMessage:
          name === 'password' ? (isValidPassword ? 'You must select a password' : '') : '',
      },
    });
  };

  const updatePassword = async () => {
    try {
      setAuthToken(token);
      setLoading(true);
      const payload = {
        password: formValues.password.value,
      };
      await axiosInstance.post(`/api/user/resetpassword/${params.id}`, payload).then((response) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

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
      updatePassword();
    }
    setFormValues(newFormValues);
  };

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

 

  return (
    <>
      <Dialog open={open} onClose={onClose} TransitionComponent={Transition} >
        <DialogTitle>Delete Confirm!</DialogTitle>
        <DialogContent>
           <DialogContentText>Are you sure you want to delete this item?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
       
            <Button onClick={onDelete} color="error">
              Delete
            </Button>
    
        </DialogActions>
      </Dialog>
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
          Supplier has been Updated Successfully
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
    </>
  );
}
