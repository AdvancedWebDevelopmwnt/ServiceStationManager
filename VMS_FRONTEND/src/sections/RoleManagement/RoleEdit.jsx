import {
    Alert,
    AlertTitle,
    Button,
    Card,
    CardContent,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography,
  } from '@mui/material';
  import React, { useEffect, useState } from 'react';
  import { useSelector } from 'react-redux';
  import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
  import { LoadingButton } from '@mui/lab';
import { useNavigate, useParams } from 'react-router-dom';
  
  export default function RoleEdit() {
  
    const [responseErr, setResponseErr] = useState(false);
    const [responseSuccess, setResponseSuccess] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const token = currentUser.token; 
    const [routes, setRoutes] = useState([]);
    const [consignee, setConsignee] = useState([])

    const [groupwisePermissions, setGroupwisePermissions] = useState([])
    const [roleGroups, setRoleGroups] = useState([]);
    const [checkBoxBindings, setCheckBoxBindings] = useState([])
    const [permissionList, setPermissionList] = useState([])
    const [selectedPermissions, setSelectedPermissions] = useState([])
    const navigate = useNavigate()
    const params = useParams()

    
    const [formValues, setFormValues] = useState({
      name: {
        value: '',
        error: false,
        errorMessage: 'You must enter a name',
      },
     selectedPermissions:{
        value: '',
        error: false,
        errorMessage: 'You must select at least one permission',
     },
     disabled:{
        value: '0',
        error: false,
        errorMessage: 'You must select Status',
     }
    
    });
  
    const handleCloseSuccess = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      navigate('/role/list')
      setResponseSuccess(false);
    };
  
    const handleCloseError = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setResponseErr(false);
    };
  
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
  
    console.log(value)
      if(name == 'name'){

        const isValid = /^[a-zA-Z0-9 ]+$/.test(value);
        setFormValues({
            ...formValues,
            [name]: {
              ...formValues[name],
              value,
              error: !isValid,
              errorMessage: isValid ? '' : 'Special characters are not allowed',
            },
          });
      }

      if (type === 'checkbox' && name === 'selectedPermissions') {
        if (checked) {
          setFormValues({
            ...formValues,
            [name]: {
              ...formValues[name],
              error: false,
              errorMessage: '',
            },
          });
        }
      }

        if (type === 'radio' && name === 'disabled') {
            setFormValues({
              ...formValues,
              [name]: {
                ...formValues[name],
                value,
                error: false,
                errorMessage: '',
              },
            });
          }
        
      
      
    };


  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      const formFields = Object.keys(formValues);
      let newFormValues = { ...formValues };
      let hasValidationErrors = false;

      const atLeastOnePermissionSelected = Object.values(checkBoxBindings).some((value) => value);

        if (!atLeastOnePermissionSelected) {
        newFormValues = {
            ...newFormValues,
            selectedPermissions: {
            ...newFormValues.selectedPermissions,
            error: true,
            errorMessage: 'You must select at least one permission',
            },
        };
        hasValidationErrors = true;
        }
  
      for (let index = 0; index < formFields.length; index++) {
        const currentField = formFields[index];
        const currentValue = formValues[currentField].value;
  
        if (currentValue === '' && currentField == 'name') {
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
  
      if (!hasValidationErrors) {
        createRole()
      }
  
      setFormValues(newFormValues);
    };

    const updateFormValues = (data) => {
        const newFormValues = { ...formValues };
    
        Object.keys(newFormValues).forEach((key) => {

          newFormValues[key] = {
            ...newFormValues[key],
            value: data[key] || '',
            error: false,
            errorMessage: '',
          };
        });
    
        setFormValues(newFormValues);
      };
    

    const getRole = async () => {
        setAuthToken(token);

        const response = await axiosInstance.get(`/api/role/show/${params.id}`);
        if (response.data.status === true) {
      
            let bindings = {};
            let assignedPermissions = response.data.role.permissions.split('|');
        
            assignedPermissions.forEach(permission => {
              // Check if permission is not an empty string
              if (permission.trim() !== '') {
                bindings[permission] = true;
              }
            });

            const roleData = response.data.role;
            roleData.disabled = roleData.disabled.toString();

        
            setCheckBoxBindings(bindings);
            updateFormValues(roleData);
        }else{
            setResponseErr(true);
        }
    }
  
  
    const getAllPermissionsList = async () =>{
        setAuthToken(token);
    
        const response = await axiosInstance.get('/api/user/getAllPermissions');
        if (response.data.status === true) {
    
          setPermissionList(response.data.permissions)
    
          let tmpRoleGroups = []
          let bindings = {}
          let permissionKeys = {}
    
          response.data.permissions.forEach(element => {
            tmpRoleGroups.push(element.group_name)
            permissionKeys[element.group_name] = []
           
            element.permissions.split('|').forEach(permission => {
              bindings[permission] = false;
              permissionKeys[element.group_name].push(permission);
            });
          });
          
          
        setCheckBoxBindings(bindings)
        setGroupwisePermissions(permissionKeys)
        setRoleGroups(tmpRoleGroups)
    
        } else {
          setResponseErr(true);
          notifyError(response.data.message);
        }
      }
  
  

    const createRole = async () => {
      try {
        setAuthToken(token);
        setLoading(true);

        const selectedPermissions = Object.keys(checkBoxBindings).filter(
            (permission) => checkBoxBindings[permission]
          );
          
          const formData  = {
            name: formValues.name.value,
            permissions: selectedPermissions.join("|"),
            status: formValues.disabled.value == '0' ? false : true
          }
        await axiosInstance
          .post(`/api/role/${params.id}`,formData)
          .then((response) => {
            if (response.data.status === true) {
              setResponseSuccess(true);
              setLoading(false);
            } else {
              setLoading(false);
              setResponseErr(true);
            }
          });
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    const handleCheckboxChange = (group, permission) => {
        setCheckBoxBindings((prevBindings) => ({
          ...prevBindings,
          [permission]: !prevBindings[permission],
        }));
        setSelectedPermissions(permission);

    };
  
    useEffect(() => {
      getAllPermissionsList()
      getRole()
    }, []);
  
    return (
      <div>
        <Card>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" style={{ marginBottom: '20px' }}>
                Create Role
              </Typography>
              <Button onClick={() => window.history.back()} color="primary">
                Back
              </Button>
            </div>
            <form noValidate onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  size="small"
                  style={{ width: '50%' }}
                  placeholder="Enter outlet name"
                  label="Name"
                  name="name"
                  variant="outlined"
                  required
                  value={formValues.name.value}
                  onChange={handleChange}
                  error={formValues.name.error}
                  helperText={formValues.name.error && formValues.name.errorMessage}
                />

                <Grid container spacing={2}>
                {roleGroups.map((group, index) => (
                  <Grid item xs={3} key={index}>
                    <FormGroup>
                      <Typography variant='lead' color="grey">{group}</Typography>
                      {groupwisePermissions[group].map((permission) => (
                        <FormControlLabel
                          key={permission}
                          control={
                            <Checkbox
                              size='small'
                              name="selectedPermissions"
                              checked={checkBoxBindings[permission] || false} 
                              onChange={(e) => {handleCheckboxChange(group, permission); handleChange(e)}}
                            />
                          }
                          label={permission}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                ))}
                 <FormHelperText error={formValues.selectedPermissions.error}>{formValues.selectedPermissions.error && formValues.selectedPermissions.errorMessage}</FormHelperText>
              </Grid>

              <RadioGroup
                    name='disabled'
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    defaultValue=""
                    value={formValues.disabled.value}
                    onChange={handleChange}
                    >
                    <FormControlLabel
                        value="0" 
                        control={<Radio />}
                        label="Active"
                    />
                    <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label="De-Active"
                    />
                </RadioGroup>
                <FormHelperText error={formValues.disabled.error}>
                {formValues.disabled.error && formValues.disabled.errorMessage}
                </FormHelperText>
  

                <LoadingButton
                  loading={loading}
                  style={{ width: '50%' }}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Update
                </LoadingButton>
              </Stack>
            </form>
          </CardContent>
        </Card>
  
        <Snackbar
          open={responseSuccess}
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
            Role has been updated successfully
          </Alert>
        </Snackbar>
  
        <Snackbar
          open={responseErr}
          autoHideDuration={3000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
            Something went wrong!
          </Alert>
        </Snackbar>
      </div>
    );
  }
  