import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Tooltip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Grid,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { LoadingButton } from '@mui/lab';
import { useNavigate, useParams } from 'react-router-dom';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';

export default function UserEdit() {
  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState('');
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const token = currentUser.token;
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams();

  const [groupwisePermissions, setGroupwisePermissions] = useState([]);
  const [roleGroups, setRoleGroups] = useState([]);
  const [checkBoxBindings, setCheckBoxBindings] = useState([]);
  const [permissionList, setPermissionList] = useState([]);

  const [formValues, setFormValues] = useState({
    firstName: {
      value: '',
      error: false,
      errorMessage: 'You must enter a first name',
    },
    lastName: {
      value: '',
      error: false,
      errorMessage: 'You must enter a last name',
    },
    email: {
      value: '',
      error: false,
      errorMessage: 'You must enter a Email',
    },
    userRoleId: {
      value: '',
      error: false,
      errorMessage: 'You must select a user role',
    },
    password: {
      value: '',
      error: false,
      errorMessage: 'You must enter a password',
    },
    selectedPermissions: {
      value: '',
      error: false,
      errorMessage: 'You must select permissions',
    },
    username: {
      value: '',
      error: false,
      errorMessage: 'You must enter a username',
    },
  });

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

    // Special handling for 'roleId' field
    if (name === 'userRoleId') {
      setFormValues({
        ...formValues,
        [name]: {
          value,
          error: value === '', // Set error to true if the value is empty
          errorMessage: value === '' ? 'You must select a user role' : '',
        },
      });
    } else if (name === 'email') {
      if (value) {
        // Special handling for 'email' field
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

        setFormValues({
          ...formValues,
          [name]: {
            ...formValues[name],
            value,
            error: !isValid,
            errorMessage: isValid ? 'Enter a valid email address' : '',
          },
        });
      }
    } else if (name === 'password') {
      // Special handling for 'password' field
      const isValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value);
      setFormValues({
        ...formValues,
        [name]: {
          value,
          error: !isValidPassword,
          errorMessage: isValidPassword ? 'You must select a password' : '',
        },
      });
    } else {
      // General handling for other fields
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
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField].value;

      if (
        currentValue === '' &&
        currentField !== 'email' &&
        currentField !== 'selectedPermissions'
      ) {
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
      createUser();
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

  const getUserData = async () => {
    setAuthToken(token);

    const response = await axiosInstance.get(`/api/user/${params.id}`);
    if (response.data.status === true) {
      const userData = {
        email: response.data.user.email,
        firstName: response.data.user.first_name,
        lastName: response.data.user.last_name,
        username: response.data.user.username,
        password: response.data.user.password,
        userRoleId: response.data.user.role,
        selectedPermissions: response.data.user.permissions,
      };
      updateFormValues(userData);
    } else {
      setResponseErr(true);
    }
  };

  const createUser = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        email: formValues.email.value,
        first_name: formValues.firstName.value,
        last_name: formValues.lastName.value,
        username: formValues.username.value,
        password: formValues.password.value,
        role: formValues.userRoleId.value,
        branch: 1,
      };

      await axiosInstance.post('/api/user', payload).then((response) => {
        if (response.data.status === true) {
          setResponseSuccess(true);
          resetFormValues();
          setLoading(false);
        } else {
          setErrMsg(response.data.message);
          setLoading(false);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const updateUserData = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        email: formValues.email.value,
        first_name: formValues.firstName.value,
        last_name: formValues.lastName.value,
        username: formValues.username.value,
        password: formValues.password.value,
        role: formValues.userRoleId.value,
        // branch: 1,
      };

      await axiosInstance.put(`/api/user/${params.id}`, payload).then((response) => {
        if (response.data.status === true) {
          setResponseSuccess(true);
          resetFormValues();
          getUserData();
          setLoading(false);
        } else {
          setErrMsg(response.data.message);
          setLoading(false);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const specialChars = '@#%$';
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';

    const allChars = lowercaseLetters + specialChars + uppercaseLetters + numbers;

    let generatedPassword = '';

    // Ensure at least one small-case letter
    generatedPassword += getRandomChar(lowercaseLetters);

    // Ensure at least one uppercase letter
    generatedPassword += getRandomChar(uppercaseLetters);

    // Ensure at least one number
    generatedPassword += getRandomChar(numbers);

    // Ensure at least one special character
    generatedPassword += getRandomChar(specialChars);

    // Fill the rest of the password with random characters
    while (generatedPassword.length < 12) {
      generatedPassword += getRandomChar(allChars);
    }

    // Shuffle the characters in the password
    generatedPassword = generatedPassword
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    setFormValues({
      ...formValues,
      password: { value: generatedPassword, error: false, errorMessage: '' },
    });
  };

  const getRandomChar = (characters) => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  };

  const copyToClipboard = () => {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = formValues.password.value;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const getuserRoles = async () => {
    setAuthToken(token);

    const response = await axiosInstance.get('/api/role');
    if (response.data.status === true) {
      let roles = [];
      response.data.role.forEach((data) => {
        if (data.name != 'Super Admin') {
          roles.push(data);
        }
      });
      setRoles(roles);
    } else {
      setResponseErr(true);
      notifyError(response.data.message);
    }
  };

  const getAllPermissionsList = async () => {
    setAuthToken(token);

    const response = await axiosInstance.get('/api/user/getAllPermissions');
    if (response.data.status === true) {
      setPermissionList(response.data.permissions);

      let tmpRoleGroups = [];
      let bindings = {};
      let permissionKeys = {};

      response.data.permissions.forEach((element) => {
        tmpRoleGroups.push(element.group_name);
        permissionKeys[element.group_name] = [];

        element.permissions.split('|').forEach((permission) => {
          bindings[permission] = false;
          permissionKeys[element.group_name].push(permission);
        });
      });

      setCheckBoxBindings(bindings);
      setGroupwisePermissions(permissionKeys);
      setRoleGroups(tmpRoleGroups);
    } else {
      setResponseErr(true);
      notifyError(response.data.message);
    }
  };

  const autoSelectPermissions = (selectedRole) => {
    const newCheckBoxBindings = { ...checkBoxBindings }; // Create a copy of checkBoxBindings
    const selectedPermissions = [];

    roleGroups.forEach((element) => {
      groupwisePermissions[element].forEach((permission) => {
        newCheckBoxBindings[permission] = false;
      });
    });

    roles.forEach((role) => {
      if (role.id === selectedRole) {
        role.permissions.split('|').forEach((perm) => {
          newCheckBoxBindings[perm] = true;
          selectedPermissions.push(perm);
        });
      }
    });

    setCheckBoxBindings(newCheckBoxBindings);

    setFormValues({
      ...formValues,
      selectedPermissions: {
        value: selectedPermissions,
        error: false,
        errorMessage: '',
      },
    });
  };

  useEffect(() => {
    getuserRoles();
    getAllPermissionsList();
    getUserData();
  }, []);
  return (
    <div>
      <Card>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" style={{ marginBottom: '20px' }}>
              Edit User
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
                placeholder="Enter your first name"
                label="First Name"
                name="firstName"
                variant="outlined"
                required
                value={formValues.firstName.value}
                onChange={handleChange}
                error={formValues.firstName.error}
                helperText={formValues.firstName.error && formValues.firstName.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="last name"
                label="Last Name"
                name="lastName"
                variant="outlined"
                required
                value={formValues.lastName.value}
                onChange={handleChange}
                error={formValues.lastName.error}
                helperText={formValues.lastName.error && formValues.lastName.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Username"
                label="Username"
                name="username"
                variant="outlined"
                required
                value={formValues.username.value}
                onChange={handleChange}
                error={formValues.username.error}
                helperText={formValues.username.error && formValues.username.errorMessage}
              />

              <TextField
                size="small"
                style={{ width: '50%' }}
                placeholder="Enter Email"
                label="Email"
                name="email"
                variant="outlined"
                value={formValues.email.value}
                onChange={handleChange}
                error={formValues.email.error}
                helperText={formValues.email.error && formValues.email.errorMessage}
              />

              <FormControl sx={{ width: '50%' }} error={formValues.userRoleId.error}>
                <InputLabel size="small" id="demo-simple-select-error-label">
                  Select a Role
                </InputLabel>
                <Select
                  name="userRoleId"
                  size="small"
                  labelId="demo-simple-select-error-label"
                  id="demo-simple-select-error"
                  label="Select a Role"
                  onChange={(e) => {
                    autoSelectPermissions(e.target.value);
                    handleChange(e);
                  }}
                  defaultValue=""
                >
                  {roles &&
                    roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {formValues.userRoleId.error && formValues.userRoleId.errorMessage}
                </FormHelperText>
              </FormControl>

              <Grid container spacing={2}>
                {roleGroups.map((group, index) => (
                  <Grid item xs={3} key={index}>
                    <FormGroup>
                      <Typography variant="lead" color="grey">
                        {group}
                      </Typography>
                      {groupwisePermissions[group].map((permission) => (
                        <FormControlLabel
                          key={permission}
                          control={<Checkbox size="small" checked={checkBoxBindings[permission]} />}
                          label={permission}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                ))}
              </Grid>

              {/* <TextField
                style={{ width: '50%' }}
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

              <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
                <div style={{ width: '200px' }}>
                  <Button
                    onClick={() => generatePassword()}
                    variant="outlined"
                    color="secondary"
                    startIcon={<Iconify icon="fluent:password-16-filled" />}
                  >
                    Generate Password
                  </Button>
                </div>
                <div style={{ width: '200px' }}>
                  <Tooltip title="Copy to clipboard" placement="right">
                    <IconButton color="secondary" onClick={() => copyToClipboard()}>
                      <Iconify icon="solar:clipboard-bold" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div> */}

              <LoadingButton
                loading={loading}
                style={{ width: '50%' }}
                type="submit"
                variant="contained"
                color="primary"
                onClick={updateUserData}
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
          User has been created successfully
        </Alert>
      </Snackbar>

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
    </div>
  );
}
