import { useTheme } from '@emotion/react';
import { LoadingButton } from '@mui/lab';
import { Box, Card, CardContent, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { axiosInstance } from 'src/axiosinstance/axiosinstance';
import Iconify from 'src/components/iconify';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice';

export default function Login() {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [responseErr, setResponseErr] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentUser } = useSelector((state) => state.user);

    const [formValues, setFormValues] = useState({
        email: {
            value: '',
            error: false,
            errorMessage: 'You must enter valid email address',
        },
        password: {
            value: '',
            error: false,
            errorMessage: 'You must enter a valid password',
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: {
                ...formValues[name],
                value,
                error: false,
            },
        });
    };

    // Notify error msg
    const notifyError = (err) => {
        toast.error(err, {
            theme: 'colored',
            position: toast.POSITION.TOP_RIGHT,
        });
    };

    const handleClick = () => {
        const formFields = Object.keys(formValues);
        let hasValidationErrors = false;
        let newFormValues = { ...formValues };

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

        setFormValues(newFormValues);
    };

    const signIn = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.post('/api/login', {
                ...formValues,
                username: formValues.email.value,
                password: formValues.password.value,
            });

            if (response.data.status === true) {
                setLoading(false);
                dispatch(signInSuccess(response.data));

                const hasSpecificPermission = response.data.permissions.some((permission) =>
                    permission.permission_list.includes('vehicle-registration', 'vehicle-supervise')
                );

                if (hasSpecificPermission) {
                    navigate('/servicePortal/welcome');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setLoading(false);
                setResponseErr(true);
                notifyError(response.data.message);
            }
        } catch (err) {
            console.log(err);
            dispatch(signInFailure(err.message));
        }
    };

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(to right, #4e54c8, #8f94fb)',
                padding: '20px',
            }}
        >
            <Card style={{ maxWidth: '900px', width: '100%', display: 'flex', padding: '30px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                <Grid container spacing={2}>
                    {/* Left Side */}
                    <Grid
                        item
                        xs={12}
                        md={6}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#4e54c8',
                            color: 'white',
                            padding: '10px',
                            borderTopLeftRadius: '8px',
                            borderBottomLeftRadius: '8px',
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <Typography variant="h4" style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                                Welcome to Service Station Manager
                            </Typography>
                            <Typography variant="body1">
                                Sign in now to manage your vehicle services, track progress, and stay updated with the latest offers and features.
                            </Typography>
                        </div>
                    </Grid>

                    {/* Right Side - Login Form */}
                    <Grid item xs={12} md={6}>
                        <CardContent>
                            <Typography variant="h5" style={{ marginBottom: '20px' }}>
                                Sign In
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    size="small"
                                    label="Email"
                                    name="email"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    value={formValues.email.value}
                                    onChange={handleChange}
                                    error={formValues.email.error}
                                    helperText={formValues.email.error && formValues.email.errorMessage}
                                />
                                <TextField
                                    size="small"
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    value={formValues.password.value}
                                    onChange={handleChange}
                                    error={formValues.password.error}
                                    helperText={formValues.password.error && formValues.password.errorMessage}
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
                                <LoadingButton
                                    variant="contained"
                                    color="primary"
                                    onClick={handleClick}
                                    fullWidth
                                    loading={loading}
                                >
                                    Login
                                </LoadingButton>
                                {responseErr && <ToastContainer />}
                            </Stack>
                        </CardContent>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
}
