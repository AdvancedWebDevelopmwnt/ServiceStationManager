import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    serviceJobs_info:{
        job_cart:[],
        isErrorInCart:false,
    }
 
};

const serviceJobsSlice = createSlice({
  name: "serviceJobs",
  initialState,
  reducers: {

    addServiceJobs: (state, action) => {
        const { id, name, type } = action.payload;

        const existingJob = state.serviceJobs_info.job_cart.find(job => job.id === id);

        if (existingJob) {
            state.serviceJobs_info.isErrorInCart = true
            return
        }

        state.serviceJobs_info.job_cart.push({ id, name, type, });
    },

    assginedServiceJobs: (state, action) => {
        state.serviceJobs_info.job_cart.push(action.payload)
    },

    ResetcartServiceJobsCartError: (state, action) => {
        state.serviceJobs_info.isErrorInCart = false
    },

    deleteServiceJobs: (state, action) => {
        const jobIdToDelete = action.payload;
        state.serviceJobs_info.job_cart = state.serviceJobs_info.job_cart.filter(job => job.id !== jobIdToDelete);
    },

    clearAllServiceJobs: (state, action) => {
        state.serviceJobs_info.job_cart = []
    }

   
  }
});

export const { addServiceJobs,ResetcartServiceJobsCartError,deleteServiceJobs,clearAllServiceJobs,assginedServiceJobs} = serviceJobsSlice.actions;

export default serviceJobsSlice.reducer;
