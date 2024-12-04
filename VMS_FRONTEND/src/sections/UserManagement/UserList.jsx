import {
  Alert,
  Button,
  Card,
  Chip,
  Container,
  Snackbar,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  List,
  Divider,
  Grid,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify';
import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';
import dateFormat from 'src/helpers/dateFormat';
import { hasPermission } from 'src/helpers/permissionUtils';
import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import { LoadingButton } from '@mui/lab';

export default function UserList() {
  const [responseErr, setResponseErr] = useState(false);
  const [table_rows, setTableRows] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [userId, setUserId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const hasEditPermission = hasPermission(currentUser, 'super-permission|user-edit');
  const hasDeletePermission = hasPermission(currentUser, 'super-permission|password-reset');
  const hasCreatePermission = hasPermission(currentUser, 'super-permission|user-create');

  const [showTextField, setShowTextField] = useState(false);

  const columns = [
    { id: 'first_name', label: 'First Name', minWidth: 100 },
    { id: 'last_name', label: 'Last Name', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'username', label: 'Username', minWidth: 100 },
    {
      id: 'userRole',
      label: 'Role',
      minWidth: 50,
      format: (value, row) => <Chip label={row.userRole} color="secondary" variant="outlined" />,
    },
    {
      id: 'createdDate',
      label: 'Created Date',
      minWidth: 110,
      align: 'right',
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 170,
      align: 'center',
      format: (value, row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            style={{ marginRight: '10px' }}
            onClick={() => handleEdit(row.id)}
            disabled={!hasEditPermission}
            size="small"
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => openDeletModel(row.id)}
            disabled={!hasDeletePermission}
            size="small"
          >
            Delete
          </Button>
          {/* create password reset button */}
          <Button
            variant="outlined"
            style={{ marginLeft: '10px' }}
            onClick={handleOpenPasswordModal(row.id)}
            disabled={!hasDeletePermission}
            size="small"
          >
            Reset Password
          </Button>
        </div>
      ),
    },
  ];

  const [formValues, setFormValues] = useState({
    password: {
      value: '',
      error: false,
      errorMessage: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isValidPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/.test(value);
    if (name === 'password') {
      setFormValues({
        ...formValues,
        password: {
          value: value,
          error: !isValidPassword,
          errorMessage: !isValidPassword ? 'You must select a password' : '',
        },
      });
    }
  };

  const getRandomChar = (characters) => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
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

  const copyToClipboard = () => {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = formValues.password.value;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  };

  const handleOpenPasswordModal = (id) => () => {
    setPasswordModalOpen(true);
    setUserId(id);
  };

  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
    setUserId('');
  };

  const resetUserPassword = async () => {
    try {
      formValues.password.error = false;
      setLoading(true);
      setAuthToken(token);

      const payload = {
        password: formValues.password.value,
      };

      const response = await axiosInstance.post(`/api/user/resetpassword/${userId}`, payload);

      if (response.data.status === true) {
        setPasswordModalOpen(false);
        setLoading(false);
        setUserId('');
        notifyError('Password has been reset successfully');
      } else {
        notifyError(response.data.message);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  //------------------------------------------------------------------------------

  const openDeletModel = (id) => {
    setDeleteDialogOpen(true);
    setRecordId(id);
  };

  const closeDeleteModal = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirmed = () => {
    setDeleteDialogOpen(false);
    handleDelete(recordId);
  };

  //get category list
  const getAllUserList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/user');

      if (response.data.status === false) {
        setResponseErr(true);
        notifyError(response.data.message);
        setLoading(false);
      } else {
        const formattedRows = response.data.user.map((row) => ({
          ...row,
          id: row.id,
          createdDate: dateFormat(row.created_at),
        }));
        setTableRows(formattedRows);

        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (userId) => {
    navigate('/user/edit/' + userId);
  };

  const openDeleteModal = (userId) => {
    setDeleteDialogOpen(true);
    setRecordId(userId);
  };
  const handleDelete = async (userId) => {
    try {
      setAuthToken(token);

      const response = await axiosInstance.delete(`/api/user/${userId}`);

      if (response.data.status === true) {
        setShowSuccess(true);
        const updatedRows = table_rows.filter((row) => row.id !== userId);
        setTableRows(updatedRows);
      } else {
        notifyError(response.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const notifyError = (err) => {
    toast.error(err, {
      theme: 'light',
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowSuccess(false);
  };

  useEffect(() => {
    getAllUserList();
  }, []);

  return (
    <div>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">User List</Typography>

          <Button
            disabled={!hasCreatePermission}
            component={Link}
            to="/user/create"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New User
          </Button>
        </Stack>

        <Card>
          <TableComponent
            table_rows={table_rows}
            columns={columns.map((column) => ({
              ...column,
              format: column.format ? (value, row) => column.format(value, row) : undefined,
            }))}
            isLoading={loading}
          />
          {responseErr && <ToastContainer />}

          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onClose={closeDeleteModal}
            onDelete={handleDeleteConfirmed}
          />
        </Card>

        <Dialog
          open={isPasswordModalOpen && userId !== ''}
          onClose={handleClosePasswordModal}
          aria-label="Reset Password"
          aria-describedby="Reset Password"
          fullWidth={true}
          maxWidth="xs"
        >
          <DialogContent>
            <List dense={true}>
              <Typography variant="h6" color="inherit" align="center">
                Reset Password
              </Typography>
              <Divider style={{ backgroundColor: '#212121', marginBottom: 20, marginTop: 10 }} />

              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}
                  >
                    <div>
                      <Button
                        onClick={() => generatePassword()}
                        variant="outlined"
                        color="secondary"
                        startIcon={<Iconify icon="fluent:password-16-filled" />}
                      >
                        Generate Password
                      </Button>
                    </div>
                    <div>
                      <Tooltip title="Copy to clipboard" placement="right">
                        <IconButton color="secondary" onClick={() => copyToClipboard()}>
                          <Iconify icon="solar:clipboard-bold" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </List>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LoadingButton
                loading={loading}
                disabled={formValues.password.value.trim() === ''}
                style={{ width: '100%' }}
                type="submit"
                variant="contained"
                color="primary"
                onClick={resetUserPassword}
              >
                Update
              </LoadingButton>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordModal}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showSuccess}
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
            User Account has been deleted successfully
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
