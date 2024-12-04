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
  Menu,
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
import { add, get, set } from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';

export default function StockCreate() {
  const [responseErr, setResponseErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
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

  const [productList, setProductList] = useState([{}]);

  const columns = [
    { id: 'item_code', label: 'Item code', minWidth: 50 },
    { id: 'product_name', label: 'Product Name', minWidth: 100 },
    { id: 'quantity', label: 'Quantity', minWidth: 100 },
    { id: 'units', label: 'Units', minWidth: 100 },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 170,
      align: 'center',
      format: (value, row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => deleteStock(row.item_code)}
            size="small"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const getAllProducts = async () => {
    try {
      setLoading(true);

      setAuthToken(token);

      await axiosInstance.get('/api/product').then((response) => {
        if (response.status === 200) {
          setProductList(response.data.product);
          setLoading(false);
          console.log(`response.data`, response.data.product);
        } else {
          setResponseErr(true);
          setErrMsg('Something went wrong. Please try again');
          setLoading(false);
        }
      });
    } catch (error) {
      setResponseErr(true);
      setErrMsg('Something went wrong. Please try again');
      setLoading(false);
    }
  };

  const [units, setUnits] = useState([
    { value: 'kg', label: 'Kilogram' },
    { value: 'l', label: 'Liter' },
    { value: 'per unit', label: 'Per Unit' },
  ]);

  const [formValues, setFormValues] = useState({
    item_code: { value: '', error: false, errorMessage: '' },
    product_name: { value: '', error: false, errorMessage: '' },
    quantity: { value: '', error: false, errorMessage: '' },
    units: { value: '', error: false, errorMessage: '' },
  });

  const addStock = () => {
    if (formValues.item_code.value.trim() === '') {
      setFormValues({
        ...formValues,
        item_code: { value: '', error: true, errorMessage: 'Item code is required' },
      });
      return;
    }

    if (formValues.item_code.value) {
      let product_name = productList.find(
        (product) => product.item_code === formValues.item_code.value
      );
      console.log(`product_name`, product_name);
      const data = {
        item_code: formValues.item_code.value,
        product_name: product_name?.name,
        quantity: formValues.quantity.value,
        units: formValues.units.value,
      };

      if (data.quantity === '' && data.units === '') {
        setFormValues({
          ...formValues,
          quantity: { value: '', error: true, errorMessage: 'Quantity is required' },
          units: { value: '', error: true, errorMessage: 'Units is required' },
        });
        return;
      }

      //check item code exists
      const itemExists = table_rows.find((row) => row.item_code === data.item_code);
      if (itemExists) {
        setFormValues({
          ...formValues,
          item_code: { value: '', error: true, errorMessage: 'Item already exists' },
        });
        setResponseErr(true);
        setErrMsg('Item already exists');
        return;
      }

      setTableRows([...table_rows, data]);
      setFormValues({
        item_code: { value: '', error: false, errorMessage: '' },
        product_name: { value: '', error: false, errorMessage: '' },
        quantity: { value: '', error: false, errorMessage: '' },
        units: { value: '', error: false, errorMessage: '' },
      });
      console.log(`formValues`, formValues);
      console.log(table_rows);
    }
  };

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      item_code: { ...formValues.item_code, error: false, errorMessage: '' },
      quantity: { ...formValues.quantity, error: false, errorMessage: '' },
      units: { ...formValues.units, error: false, errorMessage: '' },
    });
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: { value: value, error: false, errorMessage: '' },
    });
  };

  //delete from stock
  const deleteStock = (item_code) => {
    const updatedRows = table_rows.filter((row) => row.item_code !== item_code);
    setTableRows(updatedRows);
  };

  const updateStock = async () => {
    console.log(`table_rows`, table_rows);

    if (table_rows.length === 0) {
      setResponseErr(true);
      setErrMsg('Please add stock');
      return;
    }

    setAuthToken(token);
    setLoading(true);
    console.log(`table_rows`, table_rows);
    await Promise.all(
      table_rows.map((row) => {
        const payload = {
          product_id: productList.find((product) => product.item_code === row.item_code).id,
          qty: row.quantity,
          units: row.units,
        };

        console.log(`payload`, payload);

        return axiosInstance.post('/api/stock', payload).then((response) => {
          if (response.status === 200) {
            setLoading(false);
            setShowSuccess(true);
            setTableRows([]);
            getAllProducts();
          } else {
            setResponseErr(true);
            setErrMsg('Something went wrong. Please try again');
            setLoading(false);
          }
        });
      })
    );
  };

  const openDeletModel = (id) => {
    setDeleteDialogOpen(true);
    setRecordId(id);
  };

  const closeDeleteModal = () => {
    setDeleteDialogOpen(false);
  };

  const handleEdit = (userId) => {
    navigate('/user/edit/' + userId);
  };

  const openDeleteModal = (userId) => {
    setDeleteDialogOpen(true);
    setRecordId(userId);
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
    setResponseErr(false);
  };

  const navigateToBack = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    console.log(`current user`, currentUser);
    getAllProducts();
    // getAllUserList();
  }, []);

  useEffect(() => {
    console.log(formValues);
  }, [formValues]);

  return (
    <div>
      <Container>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={'center'}
          justifyContent={'space-between'}
          mb={1}
        >
          <Typography variant="h6" color="inherit">
            Create Stock
          </Typography>
          <Button variant="contained" disabled={loading} onClick={navigateToBack} >
            <Iconify icon="lets-icons:refund-back" sx={{ width: 0.6, height: 1 }} />
          </Button>
        </Stack>
        <Divider style={{ backgroundColor: '#212121', marginBottom: 20 }} />

        <Card sx={{ p: 2 }}>
          <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
            <Autocomplete
              sx={{ width: '100%' }}
              freeSolo
              options={productList}
              getOptionLabel={(option) => `${option.item_code} - ${option.name}` || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Item code/Product Name"
                  variant="outlined"
                  name="item_code"
                  error={formValues.item_code.error}
                  helperText={formValues.item_code.error && formValues.item_code.errorMessage}
                />
              )}
              onChange={(event, newValue) => {
                console.log(`newValue`, newValue?.item_code);
                let item_code = newValue?.item_code || '';
                setFormValues((prevValues) => ({
                  ...prevValues,
                  item_code: {
                    ...prevValues.item_code,
                    value: item_code,
                    error: false,
                    errorMessage: '',
                  },
                }));
              }}
            />
            {/* <Autocomplete
              fullWidth
              freeSolo
              options={productList}
              getOptionLabel={(option) => option.item_code || option.name || ''}
              value={formValues.item_code.value}
              onChange={(event, newValue) => {
                console.log(`newValue`, newValue?.item_code);
                let item_code = newValue?.item_code || '';
                setFormValues((prevValues) => ({
                  ...prevValues,
                  item_code: {
                    ...prevValues.item_code,
                    value: item_code,
                    error: false,
                    errorMessage: '',
                  },
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Item code/Product Name"
                  variant="outlined"
                  name="item_code"
                  error={formValues.item_code.error}
                  helperText={formValues.item_code.error && formValues.item_code.errorMessage}
                />
              )}
            /> */}
            <TextField
              fullWidth
              label="Quantity"
              variant="outlined"
              name="quantity"
              type="number"
              value={formValues.quantity.value}
              onChange={handleChange}
              error={formValues.quantity.error}
              helperText={formValues.quantity.error && formValues.quantity.errorMessage}
            />
            <TextField
              fullWidth
              select
              label="Units"
              variant="outlined"
              name="units"
              value={formValues.units.value}
              onChange={handleChange}
              error={formValues.units.error}
              helperText={formValues.units.error && formValues.units.errorMessage}
            >
              {units.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
            <LoadingButton
              loading={loading}
              variant="contained"
              color="primary"
              onClick={(e) => addStock()}
            >
              Add
            </LoadingButton>
          </Stack>
        </Card>

        <Card sx={{ mt: 2 }}>
          <TableComponent
            table_rows={table_rows}
            columns={columns.map((column) => ({
              ...column,
              format: column.format ? (value, row) => column.format(value, row) : undefined,
            }))}
            isLoading={loading}
          />
          {responseErr && <ToastContainer />}

          {/* <DeleteConfirmationDialog open={isDeleteDialogOpen} onClose={closeDeleteModal} /> */}

          <Stack spacing={2} direction="row" alignItems="center" justifyContent="flex-end" m={2}>
            <LoadingButton
              loading={loading}
              variant="contained"
              color="primary"
              onClick={(e) => updateStock()}
            >
              Save
            </LoadingButton>
          </Stack>
        </Card>

        <Snackbar
          open={responseErr}
          autoHideDuration={3000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSuccess}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {errMsg}
          </Alert>
        </Snackbar>

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
            Stock updated successfully
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
