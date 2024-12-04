import { Alert, Button, Card, Container, Snackbar, Stack, Typography } from '@mui/material';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { Link, useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';
import { hasPermission } from 'src/helpers/permissionUtils';

const SupplierList = () => {
  const [table_rows, setTableRows] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const hasEditPermission = hasPermission(currentUser, 'super-permission|supplier-edit');
  const hasDeletePermission = hasPermission(currentUser, 'super-permission|supplier-delete');
  const hasCreatePermission = hasPermission(currentUser, 'super-permission|supllier-create');

  const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'brand_name', label: 'Brand Name', minWidth: 100 },
    { id: 'contact_no', label: 'Contact Number', minWidth: 100 },
    { id: 'address', label: 'Address', minWidth: 100 },
    { id: 'email', label: 'Email', minWidth: 100 },
    { id: 'bank_name', label: 'Bank Name', minWidth: 100 },
    { id: 'branch_name', label: 'Branch Name', minWidth: 100 },
    { id: 'account_number', label: 'Account Number', minWidth: 100 },


    {
      id: 'action',
      label: 'Action',
      minWidth: 170,
      align: 'center',
      format: (value, row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" disabled={!hasEditPermission} style={{ marginRight: '10px' }} onClick={() => handleEdit(row.id)}>
            Edit
          </Button>
          <Button variant="outlined" disabled={!hasDeletePermission} color="secondary" onClick={() => openDeletModel(row.id)}>
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
  navigate('/supplier/edit/' + id);
};

  // delete supplier

  const handleDelete = async (id) => {
    try {
      setAuthToken(token);

      const response = await axiosInstance.delete(`/api/supplier/${id}`);

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

// get supplier records
  const getSupplierList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/supplier');

      if (response.data.status === false) {
        setResponseErr(true);
        notifyError(response.data.message);
        setLoading(false);
      } else {
        const formattedRows = response.data.supplier.map((row) => ({
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
    getSupplierList();
  }, []);

  //----------------------------------------------------------------

  return (
    <div>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4"> Supplier List</Typography>
          <Button
            disabled={!hasCreatePermission}
            component={Link}
            to="/supplier/create"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Supplier
          </Button>
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
            Supplier has been deleted successfully
          </Alert>
        </Snackbar>
      </Container>
    </div>
  )
}

export default SupplierList