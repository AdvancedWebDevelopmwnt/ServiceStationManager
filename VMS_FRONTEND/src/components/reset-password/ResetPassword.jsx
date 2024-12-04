import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { Card, CardContent, IconButton, InputAdornment, TextField } from '@mui/material';
import Iconify from '../iconify';

export default function ResetPassword ({ open, onClose,}) {
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
    const isValidPassword = name === 'password' ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value) : true;
    setFormValues({
      ...formValues,
      [name]: {
        value,
        error: name === 'password' && !isValidPassword,
        errorMessage: name === 'password' ? (isValidPassword ? 'You must select a password' : '') : '',
      },
    });
  }

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={Transition}>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter new password?</DialogContentText>
        <Card>
          <CardContent>
            <TextField
              style={{ width: '100%' }}
              size="small"
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
            />
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        {/* <Button onClick={onDelete} color="error">
         Save
        </Button> */}
      </DialogActions>
    </Dialog>
  );
}


