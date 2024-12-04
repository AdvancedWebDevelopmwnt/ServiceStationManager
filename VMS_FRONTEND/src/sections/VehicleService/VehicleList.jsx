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

export default function VehicleList() {

  const [responseErr,setResponseErr] = useState(false)
  const [table_rows,setTableRows] = useState([])
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token; 
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordId, setRecordId] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const columns = [
    { id: 'vehicle_number', label: 'Vehicle Number', minWidth: 100 },
    { 
      id: 'vehicle_brand', 
      label:'Vehicle Brand', 
      minWidth: 170, 
      format: (value, row) => (
      
        <Chip label={row.vehicle_brand || "N/A"} color="warning" variant="outlined" />
      )
    },
  
    { id: 'vehicle_model', label: 'Vehicle Model', minWidth: 100 },
    { id: 'fuel_type', label: 'Fuel Type', minWidth: 100 },
    { 
        id: 'status', 
        label:'Status', 
        minWidth: 170, 
        format: (value, row) => {
            let chipColor;
      
            if (row.status === 'Pending') {
              chipColor = 'secondary';
            } else if (row.status === 'Ongoing') {
              chipColor = 'warning'; // Change to the appropriate color for 'Ongoing'
            } else if (row.status === 'Completed') {
              chipColor = 'success';
            } else {
              chipColor = 'default'; // Change to the default color if none of the conditions match
            }
      
            return <Chip label={row.status} color={chipColor} variant="outlined" />;
          }
      },
    {
      id: 'createdDate',
      label: 'Created Date', 
      minWidth: 170,
      align: 'right',
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 170,
      align: 'center',
      format: (value, row) => (
        <Button variant="outlined"  style={{ marginRight: '10px' }} onClick={() => handleView(row.id)} startIcon={<Iconify icon="mdi:eye-outline"/>}>
             View
        </Button>
      ),
    },
  ];


  //------------------------------------------------------------------------------
  
   //get category list
  const getAllVehicleList = async () => {

    try{
      setLoading(true)
      setAuthToken(token)

      const response = await axiosInstance.get('/api/vehicleService')
      
      if(response.data.status === false) {
        setResponseErr(true)
        notifyError(response.data.message)
        setLoading(false)
      }else{
        const formattedRows = response.data.list.map((row) => ({
          ...row,
          id: row.id,
          vehicle_model: row.vehicle_model ? row.vehicle_model : 'N/A',
          fuel_type: row.fuel_type ? row.fuel_type : 'N/A',
          createdDate: dateFormat(row.created_at), 
        }));
        setTableRows(formattedRows)

        setLoading(false)
      }
      
    }catch(err){
      console.log(err);
    }

  }

  const handleView = (Id) => {
   navigate('/vehicleService/view/' + Id)
   
  };

  const openDeleteModal = (userId) => {
    setDeleteDialogOpen(true);
    setRecordId(userId)
  }

  const closeDeleteModal = () => {
    setDeleteDialogOpen(false);
  }

  const handleDeleteConfirmed = () => {
    setDeleteDialogOpen(false);
    handleDelete(recordId)
   
  };

  const handleDelete = async (userId) => {
    try {
      setAuthToken(token);
  
      const response = await axiosInstance.delete(`/api/User?Id=${userId}`);
  
      if (response.data.isSuccess === true) {
        setShowSuccess(true)
        const updatedRows = table_rows.filter((row) => row.id !== userId);
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
    getAllVehicleList()
  },[])



  return (
    <div>
        <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Today's Service List</Typography>
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
                 Sub Category has been deleted successfully
              </Alert>
            </Snackbar>
      </Container>

    </div>
       
  )
}
