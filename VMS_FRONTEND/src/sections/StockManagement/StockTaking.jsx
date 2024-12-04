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
  MenuItem,
  Box,
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
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ro, ta } from 'date-fns/locale';

export default function StockTaking() {
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

  const [purchasing_list, setPurchasingList] = useState([]);

  const [supplier_list, setSupplierList] = useState([]);

  const [supplier, setSupplier] = useState('');
  const [manualGRN, setManualGRN] = useState('');

  const [product_list, setProductList] = useState([]);

  const [formValues, setFormValues] = useState({
    stock_id: { value: '', error: false, errorMessage: '' },
    product_id: { value: '', error: false, errorMessage: '' },
    product_name: { value: '', error: false, errorMessage: '' },
    units: { value: '', error: false, errorMessage: '' },
    available_qty: { value: '', error: false, errorMessage: '' },
    taken_qty: { value: '', error: false, errorMessage: '' },
    reason: { value: '', error: false, errorMessage: '' },
    vehicle_id: { value: '', error: false, errorMessage: '' },
    vehicle_number: { value: '', error: false, errorMessage: '' },
    taken_by: { value: '', error: false, errorMessage: '' },
  });

  const columns = [
    { id: 'product_name', label: 'Product Name', minWidth: 100 },
    { id: 'available_qty', label: 'Available Qty', minWidth: 100 },
    { id: 'qty', label: 'Taken Qty', minWidth: 100 },
    { id: 'vehicle_number', label: 'Vehicle', minWidth: 100 },
    { id: 'taken_by', label: 'Taken By', minWidth: 100 },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 100,
      align: 'center',
      format: (value, row) => (
        <Button
          variant="outlined"
          color="error"
          style={{ marginRight: '10px' }}
          onClick={() =>
            deleteStock(row.stock_id, row.vehicle_id, row.product_id, row.taken_by, row.qty)
          }
        >
          Delete
        </Button>
      ),
    },
  ];

  const [totalResQty, setTotalResQty] = useState({});
  const [vehicleList, setVehicleList] = useState([
    { id: 1, vehicle_number: 'Vehicle 1' },
    { id: 2, vehicle_number: 'Vehicle 2' },
    { id: 3, vehicle_number: 'Vehicle 3' },
    { id: 4, vehicle_number: 'Vehicle 4' },
  ]);

  const [stockList, setStockList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'taken_qty') {
      const { available_qty } = formValues;
      if (value > available_qty.value) {
        setFormValues({
          ...formValues,
          taken_qty: {
            value: value,
            error: true,
            errorMessage: 'Taken qty should be less than available qty',
          },
        });
        return;
      }

      if (
        totalResQty[formValues.stock_id.value] + parseInt(value) >
        formValues.available_qty.value
      ) {
        setTakenBy(formValues.taken_by.value);
        setFormValues({
          ...formValues,
          taken_qty: {
            value: value,
            error: true,
            errorMessage: 'Not enough stock available to take',
          },
        });
        return;
      }

      setFormValues({
        ...formValues,
        taken_qty: { value: value, error: false, errorMessage: '' },
      });
    }

    setFormValues({
      ...formValues,
      [name]: { value: value, error: false, errorMessage: '' },
    });
  };

  const initialFormValues = Object.fromEntries(
    Object.keys(formValues).map((key) => [
      key,
      key === 'taken_by' || key === 'vehicle_id'
        ? { value: formValues[key].value, error: false, errorMessage: '' }
        : { value: '', error: false, errorMessage: '' },
    ])
  );

  const addStockTaking = () => {
    const requiredFields = ['product_id', 'taken_qty', 'vehicle_id', 'taken_by'];

    if (
      formValues.product_id.value === '' ||
      formValues.taken_qty.value === '' ||
      formValues.vehicle_id.value === '' ||
      formValues.taken_by.value === ''
    ) {
      setResponseErr(true);
      setErrMsg('All fields are required');
      return;
    }

    if (formValues.product_id.value === '') {
      setFormValues({
        ...formValues,
        product_id: { value: '', error: true, errorMessage: 'Product is required' },
      });
    }

    if (formValues.taken_qty.value === '') {
      setFormValues({
        ...formValues,
        taken_qty: { value: '', error: true, errorMessage: 'Taken qty is required' },
      });
    }

    if (formValues.vehicle_id.value === '') {
      setFormValues({
        ...formValues,
        vehicle_id: { value: '', error: true, errorMessage: 'Vehicle is required' },
      });
    }

    if (formValues.taken_by.value === '') {
      setFormValues({
        ...formValues,
        taken_by: { value: '', error: true, errorMessage: 'Taken by is required' },
      });
    }

    const stockTakingData = {
      qty: formValues.taken_qty.value,
      product_id: formValues.product_id.value,
      product_name: formValues.product_name.value,
      units: formValues.units.value,
      stock_id: formValues.stock_id.value,
      reason: formValues.reason.value,
      transaction_type: 'internal_stock_taking',
      available_qty: formValues.available_qty.value,
    };

    const takingDetails = {
      vehicle_id: formValues.vehicle_id.value,
      vehicle_number: formValues.vehicle_number.value,
      taken_by: formValues.taken_by.value,
    };

    const itemExists = table_rows.find((row) => row.product_id === stockTakingData.product_id);
    if (itemExists) {
      setResponseErr(true);
      setErrMsg('Item already exists');
      return;
    }

    setTotalResQty({
      ...totalResQty,
      [stockTakingData.stock_id]:
        (totalResQty[stockTakingData.stock_id] || 0) + parseInt(stockTakingData.qty),
    });

    setTableRows([...table_rows, { ...stockTakingData, ...takingDetails }]);
    setFormValues(initialFormValues);
  };

  const handleStockSelection = (e, value) => {
    if (value) {
      if (totalResQty[value.id] >= value.qty - value.resQty) {
        setFormValues({
          ...formValues,
          taken_qty: {
            value: formValues.taken_qty.value,
            error: true,
            errorMessage: 'Not enough stock available to take',
          },
        });
        setResponseErr(true);
        setErrMsg('Not enough stock available to take');
        return;
      }

      setFormValues({
        ...formValues,
        stock_id: { value: value.id, error: false, errorMessage: '' },
        product_id: { value: value.product_id, error: false, errorMessage: '' },
        product_name: { value: value.product_name, error: false, errorMessage: '' },
        available_qty: { value: value.qty - value.resQty, error: false, errorMessage: '' },
        units: { value: value.units, error: false, errorMessage: '' },
      });
    }
  };

  const handleVehicleSelection = (e, value) => {
    if (value) {
      setFormValues({
        ...formValues,
        vehicle_id: { value: value.id, error: false, errorMessage: '' },
        vehicle_number: { value: value.vehicle_number, error: false, errorMessage: '' },
      });
    }
  };

  const getAllVehicles = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const response = await axiosInstance.get('/api/vehicleLog');

      if (response.data.status === false) {
        setResponseErr(true);
        setErrMsg(response.data.message);
        setLoading(false);
      } else {
        response.data.list.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        const formattedRows = response.data.list.map((row) => ({
          ...row,
          id: row.id,
          vehicle_number: row.vehicle_number,
        }));
        setVehicleList(formattedRows);

        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getAllStocks = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const response = await axiosInstance.get('/api/stock/internalStock/getStock');

      if (response.data.status === false) {
        setResponseErr(true);
        setErrMsg(response.data.message);
        setLoading(false);
      } else {
        response.data.stock.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        const formattedRows = response.data.stock.map((row) => ({
          ...row,
          id: row.id,
          product_id: row.product_id,
          product_name: row.product_name,
          qty: row.qty,
          units: row.units,
        }));
        setStockList(formattedRows);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveStockTaking = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        vehicle_id: formValues.vehicle_id.value,
        taken_by: formValues.taken_by.value,
        stockTakingData: table_rows.map((row) => ({
          product_id: row.product_id,
          qty: row.qty,
          units: row.units,
          reason: row.reason,
        })),
      };

      await axiosInstance.post('/api/stock/internalStockTaking', payload).then((response) => {
        if (response.data.status === false) {
          setResponseErr(true);
          setErrMsg(response.data.message);
          setLoading(false);
        } else {
          setShowSuccess(true);
          setLoading(false);
          getAllStocks();
        }
      });

      setTableRows([]);
      setFormValues(initialFormValues);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteStock = (stock_id, vehicle_id, product_id, taken_by, qty) => {
    setTotalResQty({
      ...totalResQty,
      [stock_id]: totalResQty[stock_id] - parseInt(qty),
    });
    const updatedRows = table_rows.filter(
      (row) =>
        row.stock_id !== stock_id ||
        row.vehicle_id !== vehicle_id ||
        row.product_id !== product_id ||
        row.taken_by !== taken_by
    );
    setTableRows(updatedRows);
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
    getAllVehicles();
    getAllStocks();
  }, []);

  return (
    <div>
      <Container>
        <Stack>
          <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '10px' }}>
            Internal Stock Taking
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={'center'}
          justifyContent={'space-between'}
          mb={1}
          spacing={2}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              direction: 'column',
              alignItems: 'center',
              gap: 10,
              width: '50%',
            }}
          >
            {/* autocomple vehicle name */}
            <Autocomplete
              sx={{ width: '50%' }}
              freeSolo
              options={vehicleList}
              getOptionLabel={(option) => option.vehicle_number || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  label="Vehicle Number"
                  variant="outlined"
                  name="vehicle_number"
                  error={formValues.vehicle_number.error}
                  helperText={
                    formValues.vehicle_number.error && formValues.vehicle_number.errorMessage
                  }
                />
              )}
              onChange={handleVehicleSelection}
            />

            {/* taken by  */}
            <TextField
              sx={{ width: '50%' }}
              size="medium"
              label="Taken By"
              variant="outlined"
              name="taken_by"
              value={formValues.taken_by.value}
              onChange={handleChange}
              error={formValues.taken_by.error}
              helperText={formValues.taken_by.error && formValues.taken_by.errorMessage}
            />
          </div>

          <Button variant="contained" disabled={loading} onClick={navigateToBack} >
            <Iconify icon="lets-icons:refund-back" sx={{ width: 0.6, height: 1 }} />
          </Button>
        </Stack>
        <Divider style={{ backgroundColor: '#212121', marginBottom: 20 }} />

        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <TextField
              size="medium"
              label="Available Qty"
              variant="outlined"
              name="available_qty"
              sx={{ width: '15%' }}
              value={`${formValues.available_qty.value} ${formValues.units.value}`}
              error={formValues.available_qty.error}
              helperText={formValues.available_qty.error && formValues.available_qty.errorMessage}
              InputProps={{
                readOnly: true,
              }}
            />

            <LoadingButton
              loading={loading}
              variant="contained"
              color="primary"
              sx={{ width: '100px' }}
              onClick={addStockTaking}
            >
              Add
            </LoadingButton>
          </Stack>

          <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
            {/* autocomple product name from stockList */}
            <Autocomplete
              sx={{ width: '50%' }}
              freeSolo
              options={stockList}
              getOptionLabel={(option) => option.product_name || ''}
              renderInput={(params) => (
                <TextField {...params} size="medium" label="Product Name" variant="outlined" />
              )}
              onChange={handleStockSelection}
            />

            {/* taking qty as input type number */}
            <TextField
              fullWidth
              size="medium"
              label="Taken Qty"
              variant="outlined"
              name="taken_qty"
              type="number"
              sx={{ width: '50%' }}
              value={formValues.taken_qty.value}
              onChange={handleChange}
              error={formValues.taken_qty.error}
              helperText={formValues.taken_qty.error && formValues.taken_qty.errorMessage}
            />

            {/* reason if any */}
            <TextField
              fullWidth
              size="medium"
              label="Reason"
              variant="outlined"
              name="reason"
              sx={{ width: '80%' }}
              value={formValues.reason.value}
              onChange={handleChange}
              error={formValues.reason.error}
              helperText={formValues.reason.error && formValues.reason.errorMessage}
            />
          </Stack>
        </Card>

        <Card sx={{ p: 2, mt: 2 }}>
          <TableComponent
            table_rows={table_rows}
            columns={columns.map((column) => ({
              ...column,
              format: column.format
                ? (value, row) => column.format(value, row)
                : (value) => (value ? value : 'N/A'),
            }))}
            isLoading={loading}
          />

          <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" onClick={navigateToBack}>
              Cancel
            </Button>
            <LoadingButton
              loading={loading}
              disabled={table_rows.length === 0 || loading}
              variant="contained"
              color="primary"
              onClick={saveStockTaking}
              sx={{ width: '100px' }}
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
