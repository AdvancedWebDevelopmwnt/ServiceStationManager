import { Alert, Button, Card, Container, Snackbar, Stack, Typography } from '@mui/material';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { Link, useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';

export default function CustomerList() {

  const [table_rows, setTableRows] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { id: 'first_name', label: 'First Name', minWidth: 100 },
    { id: 'last_name', label: 'Last Name', minWidth: 100 },
    { id: 'mobile_number', label: 'Mobile No', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'nic', label: 'NIC', minWidth: 100 },
    { id: 'address', label: 'Address', minWidth: 100 },
    // { id: 'type', label: 'Type', minWidth: 100 },
    // { id:'government_order_form' , label:'Order Form', minWidth:100,  format: (value,row) => {
    //   if(row.type  == 'Government'){
    //     return value == 1 ? 'Yes' : 'No';
    //   }
    // }},
    {
      id: 'action',
      label: 'Action',
      minWidth: 170,
      align: 'center',
      format: (value, row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" style={{ marginRight: '10px' }} onClick={() => handleEdit(row.id)}>
            Edit
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => openDeletModel(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

//----------------------------------------------------------------

const openDeletModel = (id) => {
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

const handleEdit = (id) => {
  navigate('/customer/edit/' + id);
};

  // delete customer

  const handleDelete = async (id) => {
    try {
      setAuthToken(token);

      const response = await axiosInstance.delete(`/api/customer/${id}`);

      if (response.data.status === true) {
        setShowSuccess(true);
        const updatedRows = table_rows.filter((row) => row.id !== id);
        setTableRows(updatedRows);
      } else {
        notifyError(response.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

// get customer records
  const getCustomerList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/customer');

      if (response.data.status === false) {
        setResponseErr(true);
        notifyError(response.data.message);
        setLoading(false);
      } else {
        const formattedRows = response.data.customer.map((row) => ({
          ...row,

        }));

        setTableRows(formattedRows);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
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
    getCustomerList();
  }, []);

  //----------------------------------------------------------------

  return (
    <div>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4"> Customer List</Typography>
          <Button
            component={Link}
            to="/customer/create"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Customer
          </Button>
        </Stack>
        <Card>
          <TableComponent
            table_rows={table_rows}
            columns={columns.map((column) => ({
              ...column,
              format: column.format ? (value, row) => column.format(value, row) : (value) => (value ? value : 'N/A'),
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
            Product has been deleted successfully
          </Alert>
        </Snackbar>
      </Container>
    </div>
  )
}

