import {
  Alert,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
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
import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';
import { LoadingButton } from '@mui/lab';
import { hasPermission } from 'src/helpers/permissionUtils';

export default function VehicleRegistrationList() {
  const [responseErr, setResponseErr] = useState(false);
  const [table_rows, setTableRows] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});

  const hasEditPermission = hasPermission(
    currentUser,
    'super-permission|vehicle-registration-edit'
  );
  const hasViewPermission = hasPermission(
    currentUser,
    'super-permission|vehicle-registration-view'
  );
  const hasCreatePermission = hasPermission(
    currentUser,
    'super-permission|vehicle-registration-create'
  );

  const columns = [
    { id: 'vehicle_number', label: 'Vehicle Number', minWidth: 170 },
    { id: 'vehicle_model', label: 'Vehicle Model', minWidth: 170 },
    {
      id: 'brand_name',
      label: 'Vehicle Brand',
      minWidth: 100,
      format: (value, row) =>
        value ? <Chip label={row.brand_name} color="warning" variant="outlined" /> : 'N/A',
    },
    { id: 'engine_capacity', label: 'Engine Capacity', minWidth: 100 },
    { id: 'year_of_made', label: 'Year', minWidth: 100 },

    {
      id: 'createdDate',
      label: 'Created Date',
      minWidth: 100,
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
            disabled={!hasViewPermission}
            style={{ marginRight: '10px' }}
            onClick={() => opentViewModal(row.id)}
            startIcon={<Iconify icon="mdi:eye-outline" />}
          >
            View
          </Button>
          <Button
            variant="outlined"
            disabled={!hasEditPermission}
            style={{ marginRight: '10px' }}
            onClick={() => handleEdit(row.id)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  //------------------------------------------------------------------------------

  //get category list
  const getModelsList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/register/vehicleList');

      if (response.data.status === false) {
        setResponseErr(true);
        notifyError(response.data.message);
        setLoading(false);
      } else {
        response.data.vehicleData.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        const formattedRows = response.data.vehicleData.map((row) => ({
          ...row,
          createdDate: dateFormat(row.created_at),
        }));
        setTableRows(formattedRows);

        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (vehicleId) => {
    navigate('/vehicleRegistration/edit/' + vehicleId);
  };

  const openDeleteModal = (id) => {
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

  const handleDelete = async (ModelId) => {
    try {
      setAuthToken(token);

      const response = await axiosInstance.delete(`/api/models/${ModelId}`);

      if (response.data.status === true) {
        setShowSuccess(true);
        const updatedRows = table_rows.filter((row) => row.id !== ModelId);
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
    getModelsList();
  }, []);

  const opentViewModal = (id) => {
    setShowViewModal(true);
    const FilteredRecord = table_rows.find((row) => row.id === id);
    setSelectedRecord(FilteredRecord);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedRecord({});
  };

  return (
    <div>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Vehicle List</Typography>

          <Button
            disabled={!hasCreatePermission}
            component={Link}
            to="/vehicleRegistration/create"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            Vehicle Registration
          </Button>
        </Stack>

        <Card>
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
          {responseErr && <ToastContainer />}

          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onClose={closeDeleteModal}
            onDelete={handleDeleteConfirmed}
          />
        </Card>

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
            Vehicle Model has been deleted successfully
          </Alert>
        </Snackbar>
      </Container>

      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={showViewModal}
        onClose={closeViewModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">View Vehicle Informations</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vehicle Number"
                variant="outlined"
                disabled
                value={selectedRecord.vehicle_number}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fuel Type"
                variant="outlined"
                disabled
                value={selectedRecord.fuel_type}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Engine Capacity"
                variant="outlined"
                disabled
                value={selectedRecord.engine_capacity}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year of Make"
                variant="outlined"
                disabled
                value={selectedRecord.year_of_made}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                variant="outlined"
                disabled
                value={selectedRecord.brand_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                variant="outlined"
                disabled
                value={selectedRecord.vehicle_model}
              />
            </Grid>
          </Grid>

          <Divider style={{ marginTop: '20px' }} />
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                disabled
                value={selectedRecord.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                disabled
                value={selectedRecord.last_name}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                variant="outlined"
                disabled
                value={selectedRecord.mobile_number}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} style={{ marginTop: '10px' }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NIC"
                variant="outlined"
                disabled
                value={selectedRecord.nic}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                variant="outlined"
                disabled
                value={selectedRecord.address}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeViewModal} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
