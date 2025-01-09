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

export default function AppointmentList() {
  const [responseErr, setResponseErr] = useState(false);
  const [tableRows, setTableRows] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const hasEditPermission = hasPermission(currentUser, 'super-permission|appointment-edit');
  const hasDeletePermission = hasPermission(currentUser, 'super-permission|appointment-delete');
  const hasCreatePermission = hasPermission(currentUser, 'super-permission|appointment-create');

  const columns = [
    { id: 'appointmentDate', label: 'Appointment Date', minWidth: 170 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value, row) => (
        <div>
          {row.status === 'active' ? (
            <Chip label="Active" color="success" variant="contained" />
          ) : (
            <Chip label="Completed" color="error" variant="contained" />
          )}
        </div>
      ),
    },
    {
      id: 'createdDate',
      label: 'Created Date',
      minWidth: 170,
      align: 'right',
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 170,
      align: 'center',
      format: (value, row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" disabled={!hasEditPermission} style={{ marginRight: '10px' }} onClick={() => handleEdit(row.id)}>
            Edit
          </Button>
          <Button variant="outlined" disabled={!hasDeletePermission} color="error" onClick={() => openDeleteModal(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const getAppointments = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/appointments');

      if (response.data.status === false) {
        setResponseErr(true);
        notifyError(response.data.message);
        setLoading(false);
      } else {
        const formattedRows = response.data.appointments.map((row) => ({
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

  const handleEdit = (appointmentId) => {
    navigate('/appointments/edit/' + appointmentId);
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

  const handleDelete = async (appointmentId) => {
    try {
      setAuthToken(token);

      const response = await axiosInstance.delete(`/api/appointments/${appointmentId}`);

      if (response.data.status === true) {
        setShowSuccess(true);
        const updatedRows = tableRows.filter((row) => row.id !== appointmentId);
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
    getAppointments();
  }, []);

  return (
    <div>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Appointment List</Typography>

          <Button
            disabled={!hasCreatePermission}
            component={Link}
            to="/appointments/create"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Appointment
          </Button>
        </Stack>

        <Card>
          <TableComponent
            table_rows={tableRows}
            columns={columns.map((column) => ({
              ...column,
              format: column.format ? (value, row) => column.format(value, row) : undefined,
            }))}
            isLoading={loading}
          />
          {responseErr && <ToastContainer />}

          <DeleteConfirmationDialog open={isDeleteDialogOpen} onClose={closeDeleteModal} onDelete={handleDeleteConfirmed} />
        </Card>

        <Snackbar open={showSuccess} autoHideDuration={3000} onClose={handleCloseSuccess} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert onClose={handleCloseSuccess} severity="success" variant="filled" sx={{ width: '100%' }}>
            Appointment has been deleted successfully
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
