import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  vehicle_info: {
    vehicle_number: null,
    vehicle_brand: null,
    vehicle_model: null,
    year_of_made: null,
    engine_capacity: null,
    fuel_type: null,
    remark: null,
    isLocked:false,
    millage: null,
  },

};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    saveVehicleNumber: (state, action) => {
      state.vehicle_info.vehicle_number = action.payload;
    },

    saveVehicleInfo: (state, action) => {
      console.log(`action.payload`, action.payload)
       state.vehicle_info.vehicle_number = action.payload.vehicle_number
       state.vehicle_info.vehicle_brand = action.payload.vehicle_brand
       state.vehicle_info.vehicle_model = action.payload.vehicle_model
       state.vehicle_info.year_of_made = action.payload.year_of_made
       state.vehicle_info.engine_capacity = action.payload.engine_capacity
       state.vehicle_info.fuel_type = action.payload.fuel_type
       state.vehicle_info.remark = action.payload.remark
       state.vehicle_info.millage = action.payload.millage
    },

    setVehicleUnlock: (state,action) => {
      state.vehicle_info.isLocked = false
    },

    setVehicleLock: (state,action) => {
      state.vehicle_info.isLocked = true
    },

    clearVehicleInfo: (state,action) => {
      state.vehicle_info.vehicle_number = null
      state.vehicle_info.vehicle_brand = null
      state.vehicle_info.vehicle_model = null 
      state.vehicle_info.year_of_made = null
      state.vehicle_info.engine_capacity = null
      state.vehicle_info.fuel_type = null
      state.vehicle_info.remark = null
      state.vehicle_info.isLocked = false
      state.vehicle_info.millage = null
    }
  },
});

export const { saveVehicleNumber,saveVehicleInfo,setVehicleUnlock,setVehicleLock,clearVehicleInfo} = vehicleSlice.actions;

export default vehicleSlice.reducer;
