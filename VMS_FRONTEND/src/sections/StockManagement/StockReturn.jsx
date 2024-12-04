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
import { ro } from 'date-fns/locale';

export default function StockReturn() {
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
    IST_id: { value: '', error: false, errorMessage: '' },
    product_id: { value: '', error: false, errorMessage: '' },
    product_name: { value: '', error: false, errorMessage: '' },
    units: { value: '', error: false, errorMessage: '' },
    resQty: { value: '', error: false, errorMessage: '' },
    usedQty: { value: '', error: false, errorMessage: '' },
    return_qty: { value: '', error: false, errorMessage: '' },
    reason: { value: '', error: false, errorMessage: '' },
    vehicle_id: { value: '', error: false, errorMessage: '' },
    vehicle_number: { value: '', error: false, errorMessage: '' },
    return_by: { value: '', error: false, errorMessage: '' },
  });

  const columns = [
    { id: 'product_name', label: 'Product Name', minWidth: 100 },
    { id: 'resQty', label: 'Total Reserved Qty', minWidth: 100 },
    { id: 'qty', label: 'Return Qty', minWidth: 100 },
    { id: 'vehicle_number', label: 'Vehicle', minWidth: 100 },
    { id: 'return_by', label: 'Return By', minWidth: 100 },
    { id: 'usedQty', label: 'Used Qty', visible: false},
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
            deleteStock(row.IST_id, row.vehicle_id, row.product_id, row.return_by, row.qty)
          }
        >
          Delete
        </Button>
      ),
    },
  ];

  const [totalReturnQty, setTotalResQty] = useState({});

  const [vehicleList, setVehicleList] = useState([
    { id: 1, vehicle_number: 'Vehicle 1' },
    { id: 2, vehicle_number: 'Vehicle 2' },
    { id: 3, vehicle_number: 'Vehicle 3' },
    { id: 4, vehicle_number: 'Vehicle 4' },
  ]);

  const [stockList, setStockList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'return_qty') {
      const { resQty } = formValues;
      if (value > resQty.value) {
        setFormValues({
          ...formValues,
          return_qty: {
            value: value,
            error: true,
            errorMessage: 'Return qty cannot be greater than reserved qty',
          },
        });
        return;
      }

      if (totalReturnQty[formValues.IST_id.value] + parseInt(value) > formValues.resQty.value) {
        setFormValues({
          ...formValues,
          return_qty: {
            value: value,
            error: true,
            errorMessage: 'Not enough stock available to take',
          },
        });
        return;
      }

      setFormValues({
        ...formValues,
        return_qty: { value: value, error: false, errorMessage: '' },
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
      key === 'vehicle_id' || key === 'vehicle_number' || key === 'IST_id' || key === 'return_by'
        ? formValues[key]
        : { value: '', error: false, errorMessage: '' },
    ])
  );

  const [internalStockTaking, setInternalStockTaking] = useState([]);

  const addStockReturn = () => {
    const requiredFields = ['product_id', 'return_qty', 'vehicle_id', 'return_by'];

    if (
      formValues.product_id.value === '' ||
      formValues.return_qty.value === '' ||
      formValues.vehicle_id.value === '' ||
      formValues.return_by.value === ''
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

    if (formValues.return_qty.value === '') {
      setFormValues({
        ...formValues,
        return_qty: { value: '', error: true, errorMessage: 'Taken qty is required' },
      });
    }

    if (formValues.vehicle_id.value === '') {
      setFormValues({
        ...formValues,
        vehicle_id: { value: '', error: true, errorMessage: 'Vehicle is required' },
      });
    }

    if (formValues.return_by.value === '') {
      setFormValues({
        ...formValues,
        return_by: { value: '', error: true, errorMessage: 'Taken by is required' },
      });
    }

    

    const stockReturnData = {
      vehicle_id: formValues.vehicle_id.value,
      vehicle_number: formValues.vehicle_number.value,
      return_by: formValues.return_by.value,
      qty: formValues.return_qty.value,
      product_id: formValues.product_id.value,
      product_name: formValues.product_name.value,
      units: formValues.units.value,
      IST_id: formValues.IST_id.value,
      reason: formValues.reason.value,
      transaction_type: 'internal_stock_taking',
      resQty: formValues.resQty.value,
      usedQty: formValues.resQty.value - formValues.return_qty.value,
    };

    const itemExists = table_rows.find(
      (row) =>
        row.product_id === stockReturnData.product_id &&
        row.vehicle_id === stockReturnData.vehicle_id
    );
    if (itemExists) {
      setResponseErr(true);
      setErrMsg('Item already exists');
      return;
    }

    setTotalResQty({
      ...totalReturnQty,
      [stockReturnData.IST_id]:
        (totalReturnQty[stockReturnData.IST_id] || 0) + parseInt(stockReturnData.qty),
    });

    setTableRows([...table_rows, stockReturnData]);

    setFormValues(initialFormValues);
  };

  const handleStockSelection = (e, value) => {
    if (value) {
      if (totalReturnQty[value.id] >= value.qty - value.resQty) {
        setFormValues({
          ...formValues,
          return_qty: {
            value: formValues.return_qty.value,
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
        IST_id: { value: value.id, error: false, errorMessage: '' },
        product_id: { value: value.product_id, error: false, errorMessage: '' },
        product_name: { value: value.product_name, error: false, errorMessage: '' },
        usedQty: { value:value.resQty - value.qty, error: false, errorMessage: '' },
        units: { value: value.units, error: false, errorMessage: '' },
        resQty: { value: value.qty, error: false, errorMessage: '' },
      });
    }
  };

  const handleVehicleSelection = (e, value) => {
    if (value) {
      setFormValues({
        ...formValues,
        vehicle_id: { value: value.vehicle_id, error: false, errorMessage: '' },
        vehicle_number: { value: value.vehicle_number, error: false, errorMessage: '' },
        IST_id: { value: value.IST_id , error: false, errorMessage: ''},
      });

      const products = internalStockTaking.filter((ist) => ist.vehicle_number === value.vehicle_number);
      setStockList(products);
    }

    if (!value) {
      setFormValues({
        ...formValues,
        vehicle_id: { value: '', error: false, errorMessage: '' },
        vehicle_number: { value: '', error: false, errorMessage: '' },
      });

      setStockList([]);
    }
  };

  const getAllInternalStockTaking = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const response = await axiosInstance.get(
        '/api/stock/internalStock/getAllInternalStockTaking'
      );

      if (response.data.status === false) {
        setResponseErr(true);
        setErrMsg(response.data.message);
        setLoading(false);
      } else {
        response.data.ist.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        console.log(response.data.ist)

        const formattedRows = response.data.ist.map((row) => ({
          ...row,
          id: row.id,
          product_id: row.product_id,
          product_name: row.product_name,
          qty: row.qty,
          units: row.units,
          vehicle_id: row.vehicle_id,
          vehicle_number: row.vehicle_number,
        }));

        setInternalStockTaking(formattedRows);

        const uniqueVehicleRows = [];
        formattedRows.forEach((row) => {
          if (!uniqueVehicleRows.find((r) => r.vehicle_id === row.vehicle_id)) {
            uniqueVehicleRows.push(row);
          }
        });
        setVehicleList(uniqueVehicleRows);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveStockReturn = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        vehicle_id: formValues.vehicle_id.value,
        returned_by: formValues.return_by.value,
        IST_id: formValues.IST_id.value,
        stockReturnData: table_rows.map((row) => ({
          product_id: row.product_id,
          qty: row.qty,
          usedQty: row.usedQty,
          units: row.units,
          reason: row.reason,
        })),
      };

      console.log(`payload`, payload)

      await axiosInstance.post('/api/stock/internalStockReturn', payload).then((response) => {
        if (response.data.status === false) {
          setResponseErr(true);
          setErrMsg(response.data.message);
          setLoading(false);
        } else {
          setShowSuccess(true);
          setResponseErr(false);
          setLoading(false);
          getAllInternalStockTaking();
        }
      });
          
      setTableRows([]);
      setFormValues(initialFormValues);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteStock = (IST_id, vehicle_id, product_id, return_by, qty) => {
    setTotalResQty({
      ...totalReturnQty,
      [IST_id]: totalReturnQty[IST_id] - parseInt(qty),
    });
    const updatedRows = table_rows.filter(
      (row) =>
        row.IST_id !== IST_id ||
        row.vehicle_id !== vehicle_id ||
        row.product_id !== product_id ||
        row.return_by !== return_by
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
    getAllInternalStockTaking();
  }, []);

  return (
    <div>
      <Container>
        <Stack>
          <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '10px' }}>
            Internal Stock Return
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
                <TextField {...params} size="medium" label="Vehicle" variant="outlined" />
              )}
              onChange={handleVehicleSelection}
            />

            {/* return by  */}
            <TextField
              fullWidth
              size="medium"
              label="Return By"
              variant="outlined"
              name="return_by"
              sx={{ width: '50%' }}
              value={formValues.return_by.value}
              onChange={handleChange}
              error={formValues.return_by.error}
              helperText={formValues.return_by.error && formValues.return_by.errorMessage}
            />
          </div>

          <Button variant="contained" disabled={loading} onClick={navigateToBack} >
            <Iconify icon="lets-icons:refund-back" sx={{ width: 0.6, height: 1 }} />
          </Button>
        </Stack>
        <Divider style={{ backgroundColor: '#212121', marginBottom: 20 }} />

        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            {/* reserved qty */}
            <TextField
              fullWidth
              size="medium"
              label="Reserved Qty"
              variant="outlined"
              name="resQty"
              sx={{ width: '50%' }}
              value={formValues.resQty.value}
              onChange={handleChange}
              error={formValues.resQty.error}
              helperText={formValues.resQty.error && formValues.resQty.errorMessage}
              InputProps={{
                readOnly: true,
              }}
            />

            <LoadingButton
              loading={loading}
              variant="contained"
              color="primary"
              sx={{ width: '100px' }}
              onClick={addStockReturn}
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
              label="Return Qty"
              variant="outlined"
              name="return_qty"
              type="number"
              sx={{ width: '50%' }}
              value={formValues.return_qty.value}
              onChange={handleChange}
              error={formValues.return_qty.error}
              helperText={formValues.return_qty.error && formValues.return_qty.errorMessage}
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
              onClick={saveStockReturn}
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
