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

export default function ProductSales() {
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

  const columns = [
    { id: 'product_name', label: 'Product Name', minWidth: 100 },
    { id: 'qty', label: 'Quantity', minWidth: 100 },
    { id: 'unit_price', label: 'Unit Price', minWidth: 100 },
    { id: 'item_discount_percentage', label: 'Discount', minWidth: 100 },
    { id: 'item_total_price', label: 'Total Price', minWidth: 100 },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 100,
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

  const [supplier_list, setSupplierList] = useState([]);

  const [supplier, setSupplier] = useState('');
  const [manualGRN, setManualGRN] = useState('');
  const [billSubTotal, setBillSubTotal] = useState('');

  const [product_list, setProductList] = useState([]);
  const [sales, setSales] = useState({
    total_price: { value: '', error: false, errorMessage: '' },
    discount: { value: '', error: false, errorMessage: '' },
    discount_amount: { value: '', error: false, errorMessage: '' },
    net_price: { value: '', error: false, errorMessage: '' },
    vehicle_id: { value: '', error: false, errorMessage: '' },
    vehicle_number: { value: '', error: false, errorMessage: '' },
  });

  const [perchasing_details, setPerchasingDetails] = useState({
    supplier_id: { value: '', error: false, errorMessage: '' },
    manual_GRN_number: { value: '', error: false, errorMessage: '' },
  });

  const [formValues, setFormValues] = useState({
    product_id: { value: '', error: false, errorMessage: '' },
    product_name: { value: '', error: false, errorMessage: '' },
    unit_price: { value: '', error: false, errorMessage: '' },
    units: { value: '', error: false, errorMessage: '' },
    qty: { value: '', error: false, errorMessage: '' },
    discount_percentage: { value: '', error: false, errorMessage: '' },
    total_price: { value: '', error: false, errorMessage: '' },
  });

  const [units, setUnits] = useState([
    { value: 'kg', label: 'Kilogram' },
    { value: 'l', label: 'Liter' },
    { value: 'per unit', label: 'Per Unit' },
  ]);

  const AddToSalesList = () => {
    if (sales.vehicle_id.value === '') {
      setSales({
        ...sales,
        vehicle_id: { value: '', error: true, errorMessage: 'Vehicle Number is required' },
      });
      return;
    }

    const requiredFields = ['qty', 'unit_price', 'discount_percentage', 'total_price'];

    let hasErrorForm = false;
    for (let index = 0; index < requiredFields.length; index++) {
      const field = requiredFields[index];
      if (formValues[field].value === '') {
        setFormValues({
          ...formValues,
          [field]: { value: '', error: true, errorMessage: `${field} is required` },
        });
        hasErrorForm = true;
      }
    }

    if (!hasErrorForm) {
      const data = {
        product_id: formValues.product_id.value,
        product_name: formValues.product_name.value,
        qty: formValues.qty.value,
        unit_price: formValues.unit_price.value,
        discount_percentage: formValues.discount_percentage.value,
        units: formValues.units.value,
        total_price: formValues.total_price.value,
      };

      const itemExists = table_rows.find((row) => row.product_id === data.product_id);
      if (itemExists) {
        setFormValues({
          ...formValues,
          item_code: { value: '', error: true, errorMessage: 'Item already exists' },
        });
        setResponseErr(true);
        setErrMsg('Item already exists');
        return;
      }

      setTableRows([
        ...table_rows,
        {
          product_id: data.product_id,
          product_name: data.product_name,
          qty: `${data.qty} ${data.units}`,
          unit_price: data.unit_price,
          item_discount_percentage: data.discount_percentage,
          item_total_price: data.total_price,
        },
      ]);

      setFormValues({
        product_id: { value: '', error: false, errorMessage: '' },
        product_name: { value: '', error: false, errorMessage: '' },
        qty: { value: '', error: false, errorMessage: '' },
        units: { value: '', error: false, errorMessage: '' },
        unit_price: { value: '', error: false, errorMessage: '' },
        discount_percentage: { value: '', error: false, errorMessage: '' },
        total_price: { value: '', error: false, errorMessage: '' },
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'discount_percentage') {
      if (value > 100 || value < 0) {
        console.log(`value oowow`, value);
        setFormValues({
          ...formValues,
          discount_percentage: {
            value: value,
            error: true,
            errorMessage: 'Discount percentage should be between 0 to 100',
          },
        });
        return;
      }
    }

    if (name === 'qty' || name === 'unit_price' || name === 'discount_percentage') {
      const qty = name === 'qty' ? value : formValues.qty.value;
      const unit_price = name === 'unit_price' ? value : formValues.unit_price.value;
      const discount_percentage =
        name === 'discount_percentage' ? value : formValues.discount_percentage.value;

      if (qty && unit_price && discount_percentage) {
        const total_price = qty * unit_price * (1 - discount_percentage / 100);
        setFormValues({
          ...formValues,
          [name]: { value: value, error: false, errorMessage: '' },
          total_price: { value: total_price, error: false, errorMessage: '' },
        });
        return;
      }
    }

    setFormValues({
      ...formValues,
      [name]: { value: value, error: false, errorMessage: '' },
    });
  };

  const handleSalesChange = (e) => {
    const { name, value } = e.target;
    if (name === 'discount') {
      if (value > 100 || value < 0) {
        setSales({
          ...sales,
          discount: {
            value: 0,
            error: true,
            errorMessage: 'Discount percentage should be between 0 to 100',
          },
        });
        return;
      }

      setSales({
        ...sales,
        [name]: { value: value, error: false, errorMessage: '' },
      });
    }

    if (name === 'vehicle_id') {
      console.log(`value`, value);
    }

    setSales({
      ...sales,
      [name]: { value: value, error: false, errorMessage: '' },
    });
  };

  const deleteStock = (item_code) => {
    const updatedRows = table_rows.filter((row) => row.item_code !== item_code);
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


  const salleAllProducts = async () => {

    if (sales.discount.value === '') {
      setSales({
        ...sales,
        discount: { value: '', error: true, errorMessage: 'Discount is required' },
      });
      return;
    }


    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        vehicle_id: sales.vehicle_id.value,
        total_price: sales.total_price.value,
        discount: sales.discount.value,
        discount_amount: sales.discount_amount.value,
        net_price: sales.net_price.value,
        products: table_rows.map((row) => {
          const [qty, units] = row.qty.split(' '); 
          return {
            product_id: row.product_id,
            qty: qty,
            unit_price: row.unit_price,
            discount: row.item_discount_percentage,
          };
        }),
      };

      console.log(`payload`, payload);

      await axiosInstance.post('/api/sales/add', payload).then((response) => {
      if (response.data.status === true) {
        setShowSuccess(true);
        setTableRows([]);
        setLoading(false);
        setSales({
          total_price: { value: '', error: false, errorMessage: '' },
          discount: { value: '', error: false, errorMessage: '' },
          discount_amount: { value: '', error: false, errorMessage: '' },
          net_price: { value: '', error: false, errorMessage: '' },
          vehicle_id: { value: '', error: false, errorMessage: '' },
          vehicle_number: { value: '', error: false, errorMessage: '' },
        });
        setFormValues({
          product_id: { value: '', error: false, errorMessage: '' },
          product_name: { value: '', error: false, errorMessage: '' },
          unit_price: { value: '', error: false, errorMessage: '' },
          units: { value: '', error: false, errorMessage: '' },
          qty: { value: '', error: false, errorMessage: '' },
          discount_percentage: { value: '', error: false, errorMessage: '' },
          total_price: { value: '', error: false, errorMessage: '' },
        });
        getAllProductList();
        console.log('response.data.message lfkk099');
      } else {
        console.log(`response.data.message 099`);
        setResponseErr(true);
        setErrMsg(response.data.message);
      }
    });
    } catch (err) {
      console.log(err);
    }
  };

  const getProductList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/stock/getAllProducts');

      if (response.data.status === false) {
        setResponseErr(true);
        setErrMsg(response.data.message);
        setLoading(false);
      } else {
        console.log(`response.data.product`, response.data.product);
        const formattedRows = response.data.product.map((row) => ({
          ...row,
          product_name: row.name,
          product_id: row.id,
          unit_price: row.selling_price,
        }));

        setProductList(formattedRows);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleProductChange = (event, newValue) => {
    console.log(`newValue`, newValue);
    setFormValues({
      ...formValues,
      product_id: { value: newValue.product_id, error: false, errorMessage: '' },
      product_name: { value: newValue.product_name, error: false, errorMessage: '' },
      unit_price: { value: newValue.unit_price, error: false, errorMessage: '' },
    });
  };

  const [vehicleList, setVehicleList] = useState([]);

  const getAllVehicleList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/vehicleLog');
      console.log(`vehicle list`, response);

      if (response.data.status === false) {
        setResponseErr(true);
        setErrMsg(response.data.message);
        setLoading(false);
      } else {
        response.data.list.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        console.log(`response.data.vehicle`, response.data.vehicle);
        const formattedRows = response.data.list.map((row) => ({
          ...row,
          vehicle_number: row.vehicle_number,
          vehicle_id: row.id,
        }));

        setVehicleList(formattedRows);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const total = table_rows.reduce((acc, row) => acc + row.item_total_price, 0);
    const discount = sales.discount.value;
    const net_price = total * (1 - discount / 100);
    const discount_amount = total - net_price;
    console.log(`total`, total);
    console.log(`discount`, discount);
    console.log(`discount_amount`, discount_amount);
    console.log(`net_price`, net_price);
    setSales({
      ...sales,
      total_price: { value: total, error: false, errorMessage: '' },
      discount: { value: discount, error: false, errorMessage: '' },
      discount_amount: { value: discount_amount, error: false, errorMessage: '' },
      net_price: { value: net_price, error: false, errorMessage: '' },
    });
    console.log(`table_rows`, table_rows);
  }, [table_rows, sales.discount.value]);

  useEffect(() => {
    getProductList();
    getAllVehicleList();
  },[table_rows, sales.discount.value]);

  return (
    <div>
      <Container>
        <Stack>
          <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '10px' }}>
            Product Sales
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
            {/* Vehicle select */}
            <Autocomplete
              sx={{ width: '100%' }}
              freeSolo
              options={vehicleList}
              getOptionLabel={(option) => option.vehicle_number || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  fullWidth
                  label="Vehicle Number"
                  variant="outlined"
                  name="vehicle_id"
                  error={sales.vehicle_id.error}
                  helperText={sales.vehicle_id.error && sales.vehicle_id.errorMessage}
                />
              )}
              onChange={(event, newValue) => {
                setSales({
                  ...sales,
                  vehicle_id: { value: newValue.vehicle_id, error: false, errorMessage: '' },
                  vehicle_number: {
                    value: newValue.vehicle_number,
                    error: false,
                    errorMessage: '',
                  },
                });
              }}
            />
          </div>

          <Button variant="contained" disabled={loading} onClick={navigateToBack} >
            <Iconify icon="lets-icons:refund-back" sx={{ width: 0.6, height: 1 }} />
          </Button>
        </Stack>
        <Divider style={{ backgroundColor: '#212121', marginBottom: 20 }} />

        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" mb={0.5}>
            <LoadingButton
              loading={loading}
              variant="contained"
              color="primary"
              sx={{ width: '100px' }}
              onClick={(e) => AddToSalesList()}
            >
              Add
            </LoadingButton>
          </Stack>

          <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
            {/* select product */}
            <Autocomplete
              sx={{ width: '100%' }}
              freeSolo
              options={product_list}
              getOptionLabel={(option) => option.product_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  fullWidth
                  label="Product Name"
                  variant="outlined"
                  name="product_id"
                  error={formValues.product_id.error}
                  helperText={formValues.product_id.error && formValues.product_id.errorMessage}
                />
              )}
              onChange={handleProductChange}
            />

            <TextField
              fullWidth
              size="medium"
              label="Quantity"
              variant="outlined"
              type="number"
              name="qty"
              sx={{ width: '60%' }}
              value={formValues.qty.value}
              onChange={handleChange}
              error={formValues.qty.error}
              helperText={formValues.qty.error && formValues.qty.errorMessage}
            />

            {/* unit price, which can not change, its value is selected product  unit price */}
            <TextField
              fullWidth
              size="medium"
              label="Unit Price"
              variant="outlined"
              name="unit_price"
              sx={{ width: '60%' }}
              value={formValues.unit_price.value}
              error={formValues.unit_price.error}
              helperText={formValues.unit_price.error && formValues.unit_price.errorMessage}
              inputProps={{ readOnly: true }}
            />

            <TextField
              fullWidth
              size="medium"
              label="Discount (%)"
              variant="outlined"
              name="discount_percentage"
              type="number"
              sx={{ width: '60%' }}
              value={formValues.discount_percentage.value}
              onChange={handleChange}
              error={formValues.discount_percentage.error}
              helperText={
                formValues.discount_percentage.error && formValues.discount_percentage.errorMessage
              }
            />

            <TextField
              fullWidth
              size="medium"
              label="Total Price"
              variant="outlined"
              name="total_price"
              type="number"
              sx={{ width: '60%' }}
              value={formValues.total_price.value && formValues.total_price.value.toFixed(2)}
              error={formValues.total_price.error}
              helperText={formValues.total_price.error && formValues.total_price.errorMessage}
              inputProps={{ readOnly: true }}
            />
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

          <Stack spacing={2} direction="column" justifyContent="flex-start" m={2}>
            {/* Sub Total field */}
            <Box width={{ xs: '100%', sm: '27%' }}>
              <TextField
                size="medium"
                label="Total Price"
                variant="outlined"
                name="total_price"
                type="number"
                fullWidth
                value={sales.total_price.value}
                inputProps={{ readOnly: true }}
              />
            </Box>

            {/* Discount Percentage and Discount amount at same row */}
            <Stack direction="row" spacing={2}>
              <Box width={{ xs: '100%', sm: '10.5%' }}>
                <TextField
                  size="medium"
                  label="Discount (%)"
                  variant="outlined"
                  name="discount"
                  type="number"
                  fullWidth
                  value={sales.discount.value}
                  error={sales.discount.error}
                  helperText={sales.discount.error && sales.discount.errorMessage}
                  onChange={handleSalesChange}
                />
              </Box>

              <Box width={{ xs: '100%', sm: '15%' }}>
                <TextField
                  size="medium"
                  label="Discount Amount"
                  variant="outlined"
                  name="discount_amount"
                  type="number"
                  fullWidth
                  value={sales.discount_amount.value && sales.discount_amount.value.toFixed(2)}
                  inputProps={{ readOnly: true }}
                />
              </Box>
            </Stack>

            {/* Total Amount */}
            <Box width={{ xs: '100%', sm: '27%' }}>
              <TextField
                size="medium"
                label="Net Price"
                variant="outlined"
                name="net_price"
                type="number"
                fullWidth
                value={sales.net_price.value}
                inputProps={{ readOnly: true }}
              />
            </Box>
          </Stack>

          <Stack spacing={2} direction="row" alignItems="center" justifyContent="flex-end" m={2}>
            <LoadingButton
              loading={loading}
              disabled={loading || table_rows.length === 0}
              variant="contained"
              color="primary"
              sx={{ width: '100px' }}
              onClick={(e) => salleAllProducts()}
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
