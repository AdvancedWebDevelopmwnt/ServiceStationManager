
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
import { hasPermission } from 'src/helpers/permissionUtils';

export default function UserList() {
  const [responseErr, setResponseErr] = useState(false);
  const [table_rows, setTableRows] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const hasEditPermission = hasPermission(currentUser, 'user-edit');
  const hasDeletePermission = hasPermission(currentUser, 'user-delete');

  const columns = [
    { id: 'vehicle_number', label: 'Vehicle Number', minWidth: 130 },
    { id: 'vehicle_model', label: 'Vehicle Model', minWidth: 130 },
    { id: 'customer_id', label: 'Customer ID', minWidth: 130 },
    { id: 'year_of_made' , label: 'Year of Made', minWidth: 130 },
    { id: 'engine_capacity', label: 'Engine Capacity', minWidth: 130 },
    { id: 'fuel_type', label: 'Fuel Type', minWidth: 130 },
    { id: 'created_at', label: 'Created At', minWidth: 130 },
    { id: 'updated_at', label: 'Updated At', minWidth: 130 },
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
            disabled={hasEditPermission}
          >
            History
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => openDeleteModal(row.id)}
            disabled={hasDeletePermission}
          >
            Current Job
          </Button>
        </div>
      ),
    },
  ];

  //------------------------------------------------------------------------------

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

  const getAllVehicles = async () => {
    try {
      setAuthToken(token);
      setLoading(true);
      const response = await axiosInstance.get(
        'http://127.0.0.1:8000/api/vehicleLogManagement/list'
      );
      console.log('Vehicle Log Management');

      if (response.data.status === false) {
        setResponseErr(true);
        notifyError(response.data.message);
        setLoading(false);
      } else {
        const formattedData = response.data.vehicle.map((row) => ({
          ...row,
          id: row.id,
          created_at: new Date(row.created_at).toLocaleString(),
          updated_at: new Date(row.updated_at).toLocaleString(),
        }));
        setLoading(false);
        setTableRows(formattedData);
      }
    } catch (err) {
      console.log(err);
      setResponseErr(true);
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
    getAllVehicles();
  }, []);

  return (
    <div>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Vehicle Log Management</Typography>
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
