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
import { add, set } from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function PurchasingAdd() {
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

  const columns = [
    { id: 'item_code', label: 'Item code', minWidth: 70 },
    { id: 'product_name', label: 'Product Name', minWidth: 100 },
    { id: 'quantity', label: 'Quantity', minWidth: 100 },
    { id: 'unit_price', label: 'Unit Price', minWidth: 100 },
    { id: 'expire_date', label: 'Expire Date', minWidth: 100 },
    { id: 'item_discount_percentage', label: 'Discount', minWidth: 100 },
    { id: 'item_total_price', label: 'Total Price', minWidth: 100 },
    { id: 'supplier_name', label: 'Supplier', minWidth: 100 },
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
  const [productName, setProductName] = useState('');
  const [billSubTotal, setBillSubTotal] = useState('');
  const [billDiscountPercentage, setBillDiscountPercentage] = useState(0);
  const [billTotalDiscount, setBillTotalDiscount] = useState('');
  const [billTotalAmount, setBillTotalAmount] = useState('');

  const [product_list, setProductList] = useState([]);

  const [perchasing_details, setPerchasingDetails] = useState({
    supplier_id: { value: '', error: false, errorMessage: '' },
    manual_GRN_number: { value: '', error: false, errorMessage: '' },
  });

  const [formValues, setFormValues] = useState({
    item_code: { value: '', error: false, errorMessage: '' },
    expire_date: { value: '', error: false, errorMessage: '' },
    qty: { value: '', error: false, errorMessage: '' },
    units: { value: '', error: false, errorMessage: '' },
    unit_price: { value: '', error: false, errorMessage: '' },
    discount_percentage: { value: '', error: false, errorMessage: '' },
    total_price: { value: '', error: false, errorMessage: '' },
  });

  const [units, setUnits] = useState([
    { value: 'kg', label: 'Kilogram' },
    { value: 'l', label: 'Liter' },
    { value: 'per unit', label: 'Per Unit' },
  ]);

  const addPurchasingList = () => {
    const requiredPurchaningFields = ['supplier_id', 'manual_GRN_number'];

    let hasError = false;
    for (let index = 0; index < requiredPurchaningFields.length; index++) {
      const field = requiredPurchaningFields[index];
      if (perchasing_details[field].value === '') {
        setPerchasingDetails({
          ...perchasing_details,
          [field]: { value: '', error: true, errorMessage: `${field} is required` },
        });
        hasError = true;
      }
    }

    if (!hasError) {
      const requiredFields = [
        'item_code',
        'expire_date',
        'qty',
        'units',
        'unit_price',
        'discount_percentage',
        'total_price',
      ];

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

      if (hasErrorForm) {
        return;
      }

      const data = {
        item_code: formValues.item_code.value,
        expire_date: formValues.expire_date.value,
        qty: formValues.qty.value,
        units: formValues.units.value,
        unit_price: formValues.unit_price.value,
        discount_percentage: formValues.discount_percentage.value,
        total_price: formValues.total_price.value,
      };

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

      setTableRows([
        ...table_rows,
        {
          item_code: data.item_code,
          product_name: product_list.find((product) => product.item_code === data.item_code).name,
          quantity: `${data.qty} ${data.units}`,
          unit_price: data.unit_price,
          expire_date: data.expire_date,
          item_discount_percentage: data.discount_percentage,
          item_total_price: data.total_price,
          supplier_name: supplier.name,
        },
      ]);

      setFormValues({
        item_code: { value: '', error: false, errorMessage: '' },
        expire_date: { value: '', error: false, errorMessage: '' },
        qty: { value: '', error: false, errorMessage: '' },
        units: { value: '', error: false, errorMessage: '' },
        unit_price: { value: '', error: false, errorMessage: '' },
        discount_percentage: { value: '', error: false, errorMessage: '' },
        total_price: { value: '', error: false, errorMessage: '' },
      });
    }
  };

  const handleChange = (e) => {
    console.log(`e`, e);
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

  const handleChangeDate = (date) => {
    //set date like the format of 2023-12-31
    const newDate = dateFormat(date);
    setFormValues({
      ...formValues,
      expire_date: { value: newDate, error: false, errorMessage: '' },
    });
  };

  const handleBillDiscount = (e) => {
    const { value } = e.target;
    if (value > 100 || value < 0) {
      setBillDiscountPercentage(0);
      return;
    }
    setBillDiscountPercentage(value);
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

  const purchaseAllProducts = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      const payload = {
        supplier_id: perchasing_details.supplier_id.value,
        bill_total_amount: billTotalAmount,
        bill_total_discount: billTotalDiscount,
        manual_GRN_number: perchasing_details.manual_GRN_number.value,
        products: table_rows.map((row) => {
          console.log(`row`, row);
          const [qty, units] = row.quantity.split(' '); // split quantity into qty and units
          return {
            id: product_list.find((product) => product.item_code === row.item_code).id,
            qty: qty,
            units: units,
            unit_price: row.unit_price,
            discount_percentage: row.item_discount_percentage,
            total_price: row.item_total_price,
            expire_date: dateFormat(row.expire_date),
          };
        }),
      };
      console.log(`payload`, payload);

      await axiosInstance.post('/api/stock/purchasing', payload).then((response) => {
        if (response.data.status === true) {
          setShowSuccess(true);
          setTableRows([]);
          setLoading(false);
          clearAllFields();
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

  const clearAllFields = () => {
    console.log(`clear all fields`);
    setFormValues({
      item_code: { value: '', error: false, errorMessage: '' },
      expire_date: { value: '', error: false, errorMessage: '' },
      qty: { value: '', error: false, errorMessage: '' },
      units: { value: '', error: false, errorMessage: '' },
      unit_price: { value: '', error: false, errorMessage: '' },
      discount_percentage: { value: '', error: false, errorMessage: '' },
      total_price: { value: '', error: false, errorMessage: '' },
    });

    setPerchasingDetails({
      supplier_id: { value: '', error: false, errorMessage: '' },
      manual_GRN_number: { value: '', error: false, errorMessage: '' },
    });

    setSupplier('');
    setManualGRN('');
    setProductName('');
    setBillSubTotal('');
    setBillDiscountPercentage('');
    setBillTotalDiscount('');
    setBillTotalAmount('');

    setTableRows([]);
  };

  const getProductList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/product');

      if (response.data.status === false) {
        setResponseErr(true);
        setErrMsg(response.data.message);
        setLoading(false);
      } else {
        console.log(`response.data.product`, response.data.product);
        const formattedRows = response.data.product.map((row) => ({
          ...row,
          createdDate: dateFormat(row.created_at),
          expireDate: dateFormat(row.expire_date),
        }));

        setProductList(formattedRows);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getSupplierList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/supplier');

      if (response.data.status === false) {
        setResponseErr(true);
        setErrMsg(response.data.message);
        setLoading(false);
      } else {
        const formattedRows = response.data.supplier.map((row) => ({
          ...row,
        }));

        setSupplierList(formattedRows);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const subTotal = table_rows.reduce((acc, row) => acc + row.item_total_price, 0);
    setBillSubTotal(subTotal);

    const discountAmount = (subTotal * billDiscountPercentage) / 100;
    setBillTotalDiscount(discountAmount);

    const totalAmount = subTotal - discountAmount;
    setBillTotalAmount(totalAmount);

    console.log(`subTotal`, subTotal);
    console.log(`discountAmount`, discountAmount);
    console.log(`totalAmount`, totalAmount);
  }, [table_rows, billDiscountPercentage]);

  useEffect(() => {
    getProductList();
    getSupplierList();
  }, []);

  return (
    <div>
      <Container>
        <Stack>
          <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '10px' }}>
            Purchase Stock
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
            {/* select supplier */}
            <Autocomplete
              fullWidth
              freeSolo
              options={supplier_list}
              getOptionLabel={(option) => option.name || ''}
              // value={supplier}
              onChange={(event, newValue) => {
                console.log(`newValue`, newValue);
                setSupplier(newValue);
                setPerchasingDetails({
                  ...perchasing_details,
                  supplier_id: { value: newValue.id, error: false, errorMessage: '' },
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  fullWidth
                  label="Supplier Name"
                  variant="outlined"
                  name="supplier"
                  error={perchasing_details.supplier_id.error}
                  helperText={
                    perchasing_details.supplier_id.error &&
                    perchasing_details.supplier_id.errorMessage
                  }
                />
              )}
            />

            {/* manual GRN */}
            <TextField
              fullWidth
              size="medium"
              label="Manual GRN"
              variant="outlined"
              name="manual_GRN_number"
              value={manualGRN}
              onChange={(e) => {
                setManualGRN(e.target.value);
                setPerchasingDetails({
                  ...perchasing_details,
                  manual_GRN_number: { value: e.target.value, error: false, errorMessage: '' },
                });
              }}
              error={perchasing_details.manual_GRN_number.error}
              helperText={
                perchasing_details.manual_GRN_number.error &&
                perchasing_details.manual_GRN_number.errorMessage
              }
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
              onClick={(e) => addPurchasingList()}
            >
              Add
            </LoadingButton>
          </Stack>

          <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
            <Autocomplete
              fullWidth
              freeSolo
              options={product_list}
              getOptionLabel={(option) => option.name || ''}
              // value={product_list.find((option) => option.item_code === formValues.item_code.value)}
              value={productName}
              onChange={(event, newValue) => {
                console.log(`newValue product list`, newValue);
                setProductName(newValue);
                setFormValues({
                  ...formValues,
                  item_code: {
                    value: newValue ? newValue.item_code : '',
                    error: false,
                    errorMessage: '',
                  },
                  unit_price: {
                    value: newValue ? newValue.purchasing_price : formValues.unit_price.value,
                    error: false,
                    errorMessage: '',
                  },
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  fullWidth
                  label="Poduct Name"
                  variant="outlined"
                  name="item_code"
                  error={formValues.item_code.error}
                  helperText={formValues.item_code.error && formValues.item_code.errorMessage}
                />
              )}
            />

            {/* expire date */}
            <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ width: '100%' }}>
              <DemoContainer components={['DatePicker']} sx={{ width: '100%' }}>
                <DatePicker
                  label="Expire Date"
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" style={{ width: '50%' }} />
                  )}
                  value={formValues.expire_date.value?.toString() || null}
                  name="expire_date"
                  onChange={handleChangeDate}
                  error={formValues.expire_date.error}
                  helperText={formValues.expire_date.error && formValues.expire_date.errorMessage}
                />
              </DemoContainer>
            </LocalizationProvider>

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
              select
              label="Units"
              name="units"
              sx={{ width: '60%' }}
              required
              value={formValues.units.value}
              onChange={handleChange}
              variant="outlined"
              error={formValues.units.error}
              helperText={formValues.units.error && formValues.units.errorMessage}
            >
              {units.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

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
              onChange={handleChange}
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
                label="Sub Total"
                variant="outlined"
                name="sub_total"
                type="number"
                fullWidth
                value={billSubTotal}
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
                  name="discount_percentage"
                  type="number"
                  fullWidth
                  value={billDiscountPercentage}
                  onChange={handleBillDiscount}
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
                  value={billTotalDiscount}
                  inputProps={{ readOnly: true }}
                />
              </Box>
            </Stack>

            {/* Total Amount */}
            <Box width={{ xs: '100%', sm: '27%' }}>
              <TextField
                size="medium"
                label="Total Amount"
                variant="outlined"
                name="total_amount"
                type="number"
                fullWidth
                value={billTotalAmount}
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
              onClick={(e) => purchaseAllProducts()}
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
