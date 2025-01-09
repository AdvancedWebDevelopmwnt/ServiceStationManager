import axios from 'axios';
import { Alert, AlertTitle } from '@mui/material';


const BASE_URL = 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    // Add any request interceptors or modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Handle 401 error, e.g., sign out and clear local storage token
      signOut();
    }

    return Promise.reject(error);
  }
);

const signOut = async () => {
  let storageData = JSON.parse(localStorage.getItem('persist:root'))
  let userData = JSON.parse(storageData.user)

  const response = await fetch('https://vmsbackend.neurascripts.com/api/logout',{
    method:'POST',
    headers:{
      'content-type': 'application/json',
      'Authorization': `Bearer ${userData.currentUser.token}`
    },
    body:JSON.stringify()
  })

  const data = await response.json()
  if(data.status === true) {
       localStorage.removeItem('persist:root')
      window.location.reload();
  }
}

// const signOut = async () => {
//   let storageData = JSON.parse(localStorage.getItem('persist:root'));
//   let userData = JSON.parse(storageData.user);

//   const response = await fetch('http://127.0.0.1:8000/api/logout', {
//     method: 'POST',
//     headers: {
//       'content-type': 'application/json',
//       Authorization: `Bearer ${userData.currentUser.token}`,
//     },
//     body: JSON.stringify(),
//   });

//   const data = await response.json();
//   if (data.status === true) {
//     localStorage.removeItem('persist:root');
//     window.location.reload();
//   }
// };

export { axiosInstance, setAuthToken };
