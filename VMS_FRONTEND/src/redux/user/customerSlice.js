import { createSlice } from "@reduxjs/toolkit";

const initialState = {

  customer_info:{
    first_name: null,
    first_name: null,
    mobile_number: null,
    mobile_number:null,
    customer_type: null,
    address: null,
    isLocked:false,
    nic:null,
    government_order_form:null,
  }
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {

    saveCustomerInfo: (state, action) => {
      state.customer_info.first_name = action.payload.first_name
      state.customer_info.last_name = action.payload.last_name
      state.customer_info.mobile_number = action.payload.mobile_number
      state.customer_info.nic = action.payload.nic
      state.customer_info.customer_type = action.payload.customer_type
      state.customer_info.address = action.payload.address
      state.customer_info.government_order_form = action.payload.government_order_form
    },

    setCustomerUnlock: (state, action) => {
      state.customer_info.isLocked = false
    },

    setCustomerlock: (state, action) => {
      state.customer_info.isLocked = true
    },

    clearCustomerInfo: (state, action) => {
      state.customer_info.first_name = null
      state.customer_info.last_name = null
      state.customer_info.address = null
      state.customer_info.customer_type = null
      state.customer_info.mobile_number = null
      state.customer_info.nic = null
      state.customer_info.government_order_form = null
    },

    saveCustomerType: (state,action) => {
      state.customer_info.customer_type = action.payload.customer_type
    }
  },


});

export const { saveCustomerInfo,setCustomerUnlock,setCustomerlock,clearCustomerInfo,saveCustomerType } = customerSlice.actions;

export default customerSlice.reducer;
