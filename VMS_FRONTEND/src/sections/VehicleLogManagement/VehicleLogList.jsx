import { Alert, Button, Card, Chip, Container, Snackbar, Stack, Typography } from '@mui/material';
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

export default function VehicleList() {
  const [responseErr, setResponseErr] = useState(false);
  const [table_rows, setTableRows] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const columns = [
    { id: 'vehicle_number', label: 'Vehicle Number', minWidth: 100 },
    {
      id: 'brand_name',
      label: 'Brand',
      minWidth: 100,
      format: (value, row) =>
        value ? <Chip label={row.brand_name} color="warning" variant="outlined" /> : 'N/A',
    },
    { id: 'model_name', label: 'Model', minWidth: 100 },
    {
      id: 'customer_name',
      label: 'Customer Name',
      minWidth: 100,
      format: (value, row) => {
        if (row.customer_first_name || row.customer_last_name) {
          return `${row.customer_first_name || 'N/A'} ${row.customer_last_name || 'N/A'}`;
        }
        return 'N/A';
      },
    },
    { id: 'customer_phone', label: 'Customer Phone', minWidth: 100 },
    {
      id: 'check_in',
      label: 'Check In',
      minWidth: 100,
      align: 'right',
      format: (value) => dateFormat(value),
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 100,
      align: 'center',
      format: (value, row) => (
        <Button
          variant="outlined"
          style={{ marginRight: '10px' }}
          onClick={() => handleView(row.id)}
          startIcon={<Iconify icon="mdi:eye-outline" />}
        >
          View
        </Button>
      ),
    },
  ];

  //------------------------------------------------------------------------------

  //get category list
  //get vehicle list
  const getAllVehicleList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/vehicleLog');

      if (response.data.status === false) {
        setResponseErr(true);
        notifyError(response.data.message);
        setLoading(false);
      } else {
        response.data.list.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        console.log(`response.data.list`, response.data.list);
        const formattedRows = response.data.list.map((row) => ({
          ...row,
          id: row.id,
          vehicle_number: row.vehicle_number,
          brand_name: row.brand_name,
          model_name: row.vehicle_model,
          customer_name: `${row.customer_first_name} ${row.customer_last_name}`,
          customer_phone: row.customer_mobile,
          check_in: row.created_at,
        }));
        setTableRows(formattedRows);
        

        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleView = (Id) => {
    navigate('/VehicleLog/view/' + Id);
  };

  const openDeleteModal = (userId) => {
    setDeleteDialogOpen(true);
    setRecordId(userId);
  };

  const closeDeleteModal = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirmed = () => {
    setDeleteDialogOpen(false);
    handleDelete(recordId);
  };

  const handleDelete = async (userId) => {
    try {
      setAuthToken(token);

      const response = await axiosInstance.delete(`/api/User?Id=${userId}`);

      if (response.data.isSuccess === true) {
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
    getAllVehicleList();
  }, []);

  return (
    <div>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Vehicle Log List</Typography>
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
            Sub Category has been deleted successfully
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
