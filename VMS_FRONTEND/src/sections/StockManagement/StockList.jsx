import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Container,
  Snackbar,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemIcon,
  IconButton,
  ListItemAvatar,
  Avatar,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { signInFailure, signInSuccess } from 'src/redux/user/userSlice.js';
import { useNavigate, useParams } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { saveCustomerInfo, setCustomerUnlock } from 'src/redux/user/customerSlice.js';
import InputAdornment from '@mui/material/InputAdornment';
import Label from 'src/components/label';
import { clearVehicleInfo } from 'src/redux/user/vehicleSlice';
import { tr } from 'date-fns/locale';
import { get, set } from 'lodash';
import dateFormat from 'src/helpers/dateFormat';
import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';

const jobStatus = [
  { id: 1, name: 'Confirmed' },
  { id: 2, name: 'Reject' },
  { id: 3, name: 'Completed' },
];

const vehicleStatus = [
  { id: 1, name: 'Pending' },
  { id: 2, name: 'Completed' },
  { id: 3, name: 'Ongoing' },
];

const pageVariants = {
  initial: { opacity: 0, x: '-100%' },
  animate: { opacity: 1, x: '0%', transition: { ease: 'easeInOut', duration: 0.5 } },
  exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut', duration: 0.5 } },
};

export default function VehicleInfoPage() {
  const { currentUser } = useSelector((state) => state.user);
  const { customer_info } = useSelector((state) => state.customer);
  const { vehicle_info } = useSelector((state) => state.vehicle);
  const { jobs_info } = useSelector((state) => state.jobs);

  const token = currentUser.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const [responseErr, setResponseErr] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [erroMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [jobStatuses, setJobStatuses] = useState([]);

  //ongoing services vehicle list
  const [vehicleList, setVehicleList] = useState([]);

  const [formValues, setFormValues] = useState({
    first_name: {
      value: customer_info.first_name ? customer_info.first_name : '',
      error: false,
      errorMessage: 'You must enter First Name',
    },

    last_name: {
      value: customer_info.last_name ? customer_info.last_name : '',
      error: false,
      errorMessage: 'You must enter Last Name',
    },

    mobile_number: {
      value: customer_info.mobile_number ? customer_info.mobile_number : '',
      error: false,
      errorMessage: 'You must enter the Mobile Number',
    },

    address: {
      value: customer_info.address ? customer_info.address : '',
      error: false,
      errorMessage: '',
    },

    nic: {
      value: customer_info.nic ? customer_info.nic : '',
      error: false,
      errorMessage: '',
    },

    customer_type: {
      value: customer_info.customer_type ? customer_info.customer_type : '',
      error: false,
      errorMessage: 'You must slect the Customer Type',
    },
  });

  const colums = [
    { id: 'item_code', label: 'Item Code', minWidth: 100 },
    { id: 'product_name', label: 'Product Name', minWidth: 100 },
    { id: 'qty', label: 'Quantity', minWidth: 100 },
    { id: 'units', label: 'Units', minWidth: 100 },
    { id: 'selling_price', label: 'Selling Price', minWidth: 100 },
    { id: 'purchase_price', label: 'Purchase Price', minWidth: 100 },
  ];

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

  const checkTokenExpire = async () => {
    try {
      setAuthToken(token);
      const response = await axiosInstance.get('/api/checkuser');
      if (response.data == null) {
        dispatch(signInFailure());
        navigate('/');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const navigateToBack = () => {
    dispatch(clearVehicleInfo());
    dispatch(setCustomerUnlock());
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: {
        ...formValues[name],
        value,
        error: false,
        errorMessage: '',
      },
    });
  };

  const handleUnlock = () => {
    dispatch(setCustomerUnlock());
  };

  const handleSubmit = (e) => {
    if (loading) return;
    e.preventDefault();

    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };
    let hasValidationErrors = false;

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField].value;

      if (currentField !== 'nic' && currentField !== 'address') {
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
    }

    if (!hasValidationErrors) {
      const data = {
        first_name: formValues.first_name.value,
        last_name: formValues.last_name.value,
        mobile_number: formValues.mobile_number.value,
        nic: formValues.nic.value,
        customer_type: formValues.customer_type.value,
        address: formValues.address.value,
      };
      dispatch(saveCustomerInfo(data));
      saveOrUpdateCustomerInfo();
    }

    setFormValues(newFormValues);
  };

  const saveOrUpdateCustomerInfo = async () => {
    try {
      if (loading) return;
      setAuthToken(token);
      setLoading(true);

      const payload = {
        first_name: formValues.first_name.value,
        last_name: formValues.last_name.value,
        mobile_number: formValues.mobile_number.value,
        nic: formValues.nic.value,
        customer_type: formValues.customer_type.value,
        address: formValues.address.value,
      };

      await axiosInstance
        .post('/api/servicePortal/saveOrUpdateCustomerInfo', payload)
        .then((response) => {
          if (response.data.status === true) {
            // setLoading(false);
            navigate('/servicePortal/step4');
          } else {
            setErrMsg(response.data.message);
            // setLoading(false);
            setResponseErr(true);
          }
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const getVehicleList = async () => {
    try {
      if (loading) return;
      setAuthToken(token);
      setLoading(true);
      await axiosInstance.get(`/api/servicePortal/getOngoingVehicleService`).then((response) => {
        if (response.data.status === true) {
          console.log(`response.data`, response.data);
          const formattedRows = response.data.ongoing_service_list.map((row) => ({
            ...row,
            id: row.id,
            vehicle_number: row.vehicle_number,
            vehicle_brand: row.vehicle_brand,
            vehicle_model: row.vehicle_model,
            customer_name: row.customer_name,
            mobile_number: row.mobile_number,
            created_at: dateFormat(row.created_at, 'dd/MM/yyyy'),
            status: row.status,
          }));
          setVehicleList(formattedRows);
          setLoading(false);
        } else {
          console.log(`response.data.message`, response.data.message);
          setErrMsg(response.data.message);
          setLoading(true);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const getAllStocks = async () => {
    try {
      if (loading) return;
      setAuthToken(token);
      setLoading(true);

      await axiosInstance.get(`/api/stock/getAllStocks`).then((response) => {
        if (response.data.status === true) {
          const formattedRows = response.data.stock_list.map((row) => ({
            ...row,
            id: row.id,
            item_code: row.item_code,
            product_name: row.product_name,
            qty: row.qty ? row.qty : 0,
            units: row.units,
            selling_price: row.selling_price,
            purchase_price: row.purchase_price,
          }));
          setVehicleList(formattedRows);
          setLoading(false);
        } else {
          console.log(`response.data.message`, response.data.message);
          setErrMsg(response.data.message);
          setLoading(true);
          setResponseErr(true);
        }
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleJobStatusChange = (jobId, newStatus) => {
    setJobStatuses(
      jobStatuses.map((job) => (job.jobId === jobId ? { ...job, status: newStatus } : job))
    );
  };

  useEffect(() => {
    if (token) {
      checkTokenExpire();
      //   getVehicleList();
      getAllStocks();
    }
  }, []);

  return (
    <div>
      <Container maxWidth={false}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}
        >
          <Card sx={{ margin: 'auto', width: '100%', height: '100%' }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <List dense={true}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    m={1}
                  >
                    <Typography variant="h6" color="inherit">
                      Stock List
                    </Typography>
                    <Button variant="contained" disabled={loading} onClick={navigateToBack}>
                      <Iconify icon="lets-icons:refund-back" sx={{ width: 0.6, height: 1 }} />
                    </Button>
                  </Stack>
                  <Divider style={{ backgroundColor: '#212121', marginBottom: 10 }} />
                  {!loading ? (
                    <TableComponent
                      table_rows={vehicleList}
                      columns={colums.map((column) => ({
                        ...column,
                        format: column.format
                          ? (value, row) => column.format(value, row)
                          : (value) => (value || value === 0 ? value : 'N/A'),
                      }))}
                      isLoading={loading}
                    />
                  ) : (
                    <Typography>Loading...</Typography>
                  )}
                </List>
              </Grid>
            </Grid>

            <Stack spacing={2}></Stack>
          </Card>
        </div>
      </Container>

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
