import { Alert, Button, Card,Chip,Container, Snackbar, Stack, Typography} from '@mui/material'
import React, { useEffect, useState } from 'react'
import Iconify from 'src/components/iconify';
import TableComponent from 'src/layouts/dashboard/common/Table/TableComponent';
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';
import dateFormat from 'src/helpers/dateFormat';
import DeleteConfirmationDialog from 'src/components/deleteModal/DeleteConfirmationDialog';
import { hasPermission } from 'src/helpers/permissionUtils';


export default function RoleList() {

  const [responseErr,setResponseErr] = useState(false)
  const [table_rows,setTableRows] = useState([])
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token; 
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const hasEditPermission = hasPermission(currentUser, 'super-permission|role-edit');
  const hasDeletePermission = hasPermission(currentUser, 'super-permission|role-delete');
  const hasCreatePermission = hasPermission(currentUser, 'super-permission|role-create');

  const columns = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { 
        id: 'permissions', 
        label:'Permissions', 
        minWidth: 170, 
        format: (value, row) => (
            <div>
            {row.permissions.map((permission, index) => (
              <Chip key={index} label={permission} color="info" variant="outlined" style={{margin:'5px'}} />
            ))}
          </div>
        )
      },

      {
        id: 'disabled', 
        label:'Status', 
        minWidth: 100, 
        format: (value, row) => (
          <div>
            {row.disabled === 0 ? (
              <Chip label="Active" color="success" variant="contained"  />
            ) : (
              <Chip label="Deactive" color="error" variant="contained"  />
            )}
          </div>
        ),
      },

    {
      id: 'actions',
      label: 'Action',
      minWidth: 170,
      align: 'center',
      format: (value, row) => {
        if (row.name === 'Super Admin'){
            return <Iconify icon="ic:baseline-lock" />;
        }
    
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" disabled={!hasEditPermission} style={{ marginRight: '10px' }} onClick={() => handleEdit(row.id)}>
              Edit
            </Button>
            <Button variant="outlined" disabled={!hasDeletePermission} color="error" onClick={() => openDeleteModal(row.id)}>
              Delete
            </Button>
          </div>
        );
      },
    }
  ];


  //------------------------------------------------------------------------------
  
  const permissionListSplit = (permissionArr) => {
    let permissionList = [];
  
    permissionArr.split('|').forEach((perm) => {
      permissionList.push(perm);
    });
  
    return permissionList;
  };

  

   //get role list
  const  getRoleList = async () => {

    try{
      setLoading(true)
      setAuthToken(token)

      const response = await axiosInstance.get('/api/role')
     
      if(response.data.status === false) {
        setResponseErr(true)
        notifyError(response.data.message)
        setLoading(false)
      }else{
        const formattedRows = response.data.role.map((row) => ({
          ...row,
          permissions : permissionListSplit(row.permissions),
          createdDate: dateFormat(row.created_at), 
        }));
        setTableRows(formattedRows)

        setLoading(false)
      }
      
    }catch(err){
      console.log(err);
    }

  }

  const handleEdit = (RoleId) => {
   navigate('/role/edit/' + RoleId)
   
  };

  const openDeleteModal = (id) => {
    setDeleteDialogOpen(true);
    setRecordId(id)
  }

  const closeDeleteModal = () => {
    setDeleteDialogOpen(false);
  }

  const handleDeleteConfirmed = () => {
    setDeleteDialogOpen(false);
    handleDelete(recordId)
   
  };

  const handleDelete = async (RoleId) => {
    try {
      setAuthToken(token);
  
      const response = await axiosInstance.delete(`/api/role/${RoleId}`);
  
      if (response.data.status === true) {
        setShowSuccess(true)
        const updatedRows = table_rows.filter((row) => row.id !== RoleId);
        setTableRows(updatedRows);
      } else {
        notifyError(response.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const notifyError = (err) =>{
    toast.error(err, {
      theme: "light",
      position: toast.POSITION.TOP_RIGHT
    });
  }


  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowSuccess(false);
  };

  useEffect(()=>{
    getRoleList()
  },[])


  return (
    <div>
      <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
              <Typography variant="h4">Role List</Typography>

              <Button disabled={!hasCreatePermission} component={Link} to="/role/create" variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />} >
                  New Role
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
              {responseErr && <ToastContainer /> }

              <DeleteConfirmationDialog open={isDeleteDialogOpen} onClose={closeDeleteModal} onDelete={handleDeleteConfirmed}/>
          </Card>

          <Snackbar 
              open={showSuccess} 
              autoHideDuration={3000} 
              onClose={handleCloseSuccess}  
              anchorOrigin={{vertical:'top',horizontal:'right'}}>
            <Alert onClose={handleCloseSuccess} severity="success" variant='filled' sx={{ width: '100%' }}>
             Role has been deleted successfully
            </Alert>
          </Snackbar>
    </Container>

   </div>
  );
}
