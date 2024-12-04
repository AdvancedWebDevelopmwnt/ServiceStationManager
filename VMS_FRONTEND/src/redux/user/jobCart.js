import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    jobs_info:{
        job_cart:[],
        isErrorInCart:false,
    }
 
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {

    addJobs: (state, action) => {
        const { id, name, type } = action.payload;

        const existingJob = state.jobs_info.job_cart.find(job => job.id === id);

        if (existingJob) {
            state.jobs_info.isErrorInCart = true
            return
        }

        state.jobs_info.job_cart.push({ id, name, type, });
    },

    assginedJobs: (state, action) => {
        state.jobs_info.job_cart.push(action.payload)
    },

    ResetcartError: (state, action) => {
        state.jobs_info.isErrorInCart = false
    },

    deleteJob: (state, action) => {
        const jobIdToDelete = action.payload;
        state.jobs_info.job_cart = state.jobs_info.job_cart.filter(job => job.id !== jobIdToDelete);
    },

    clearAllJobs: (state, action) => {
        state.jobs_info.job_cart = []
    }

   
  }
});

export const { addJobs,ResetcartError,deleteJob,clearAllJobs,assginedJobs} = jobSlice.actions;

export default jobSlice.reducer;
