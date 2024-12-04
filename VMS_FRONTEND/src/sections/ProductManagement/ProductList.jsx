import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container, Snackbar, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify';
import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';
import dateFormat from 'src/helpers/dateFormat';
import { ToastContainer, toast } from 'react-toastify';
import { hasPermission } from 'src/helpers/permissionUtils';

const ProductList = () => {
  const [table_rows, setTableRows] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const [responseErr, setResponseErr] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const hasEditPermission = hasPermission(currentUser, 'super-permission|product-edit');
  const hasDeletePermission = hasPermission(currentUser, 'super-permission|product-delete');
  const hasCreatePermission = hasPermission(currentUser, 'super-permission|product-create');

  const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'item_code', label: 'Item Code', minWidth: 100 },
    { id: 'model', label: 'Model', minWidth: 100 },
    { id: 'selling_price', label: 'Sales Price', minWidth: 100 , format: (value, row) => <div>LKR. {row.selling_price}</div>},
    { id: 'purchasing_price', label: 'Purchasing Price', minWidth: 100,format: (value, row) => <div>LKR. {row.purchasing_price}</div> },
    { id: 'expireDate', label: 'Expire Date', minWidth: 100 },
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

  const handleEdit = (JobId) => {
    navigate('/product/edit/' + JobId);
  };

  //get product list

  const getProductList = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const response = await axiosInstance.get('/api/product');

      if (response.data.status === false) {
        setResponseErr(true);
        notifyError(response.data.message);
        setLoading(false);
      } else {
        const formattedRows = response.data.product.map((row) => ({
          ...row,
          createdDate: dateFormat(row.created_at),
          expireDate: dateFormat(row.expire_date),
        }));

        setTableRows(formattedRows);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // delete product

  const handleDelete = async (id) => {
    try {
      setAuthToken(token);

      const response = await axiosInstance.delete(`/api/product/${id}`);

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
    getProductList();
  }, []);
  //----------------------------------------------------------------
  return (
    <div>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4"> Product List</Typography>
          <Button
            disabled={!hasCreatePermission}
            component={Link}
            to="/Product/create"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Product
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
            Product has been deleted successfully
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default ProductList;
