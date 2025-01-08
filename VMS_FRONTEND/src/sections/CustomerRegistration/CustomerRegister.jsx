import React, { useState } from "react";
import { Button, Card, CardContent, TextField, Typography, Stack, Snackbar, Alert } from "@mui/material";
import { axiosInstance } from 'src/axiosinstance/axiosinstance';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    email: "",
    username: "",
    password: "",
  });

  const [responseSuccess, setResponseSuccess] = useState(false);
  const [responseErr, setResponseErr] = useState(false);

  const navigate = useNavigate(); // Initialize navigate function

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("http://127.0.0.1:8000/api/customer-register", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setResponseSuccess(true);
      console.log(response.data);
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate("/login"); // Navigate to login page
      }, 3000); // Wait for snackbar to show before redirecting

    } catch (error) {
      setResponseErr(true);
      console.error(error);
    }
  };

  const handleCloseSuccess = () => {
    setResponseSuccess(false);
  };

  const handleCloseError = () => {
    setResponseErr(false);
  };

  return (
    <Card style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <CardContent>
        <Typography variant="h5" style={{ marginBottom: '20px' }}>
          Register
        </Typography>
        <form noValidate onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="First Name"
              name="first_name"
              variant="outlined"
              required
              fullWidth
              value={formData.first_name}
              onChange={handleChange}
            />
            <TextField
              size="small"
              label="Last Name"
              name="last_name"
              variant="outlined"
              required
              fullWidth
              value={formData.last_name}
              onChange={handleChange}
            />
            <TextField
              size="small"
              label="Mobile Number"
              name="mobile_number"
              variant="outlined"
              required
              fullWidth
              value={formData.mobile_number}
              onChange={handleChange}
            />
            <TextField
              size="small"
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              required
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              size="small"
              label="Username"
              name="username"
              variant="outlined"
              required
              fullWidth
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              size="small"
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              required
              fullWidth
              value={formData.password}
              onChange={handleChange}
            />
            <Button 
              variant="contained" 
              color="primary" 
              type="submit" 
              fullWidth
            >
              Register
            </Button>
          </Stack>
        </form>

        {/* Success Snackbar */}
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
            You have registered successfully.
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={responseErr}
          autoHideDuration={3000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Something went wrong!
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default Register;
