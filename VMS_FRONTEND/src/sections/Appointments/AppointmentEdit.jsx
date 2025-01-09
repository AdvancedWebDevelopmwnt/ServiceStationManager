import { Button, Card, Container, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AppointmentEdit() {
  const [appointment, setAppointment] = useState({
    date: '',
    status: '',
    description: '',
  });
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser.token;
  const [loading, setLoading] = useState(false);
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getAppointmentDetails();
  }, []);

  const getAppointmentDetails = async () => {
    setLoading(true);
    setAuthToken(token);

    try {
      const response = await axiosInstance.get(`/api/appointments/${appointmentId}`);
      if (response.data.status === true) {
        setAppointment(response.data.appointment);
        setLoading(false);
      } else {
        toast.error(response.data.message, { theme: 'light' });
        setLoading(false);
      }
    } catch (err) {
      toast.error('Error fetching appointment details', { theme: 'light' });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setAppointment({ ...appointment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthToken(token);

    try {
      const response = await axiosInstance.put(`/api/appointments/${appointmentId}`, appointment);
      if (response.data.status === true) {
        toast.success('Appointment updated successfully', { theme: 'light' });
        navigate('/appointments');
      } else {
        toast.error(response.data.message, { theme: 'light' });
        setLoading(false);
      }
    } catch (err) {
      toast.error('Error updating appointment', { theme: 'light' });
      setLoading(false);
    }
  };

  return (
    <div>
      <Container>
        <Typography variant="h4" mb={5}>
          Edit Appointment
        </Typography>

        <Card>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ p: 3 }}>
              <TextField
                name="date"
                label="Appointment Date"
                type="date"
                value={appointment.date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                name="status"
                label="Status"
                select
                value={appointment.status}
                onChange={handleChange}
                fullWidth
                required
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </TextField>
              <TextField
                name="description"
                label="Description"
                value={appointment.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button variant="outlined" color="inherit" onClick={() => navigate('/appointments')}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Card>
      </Container>

      <ToastContainer />
    </div>
  );
}
