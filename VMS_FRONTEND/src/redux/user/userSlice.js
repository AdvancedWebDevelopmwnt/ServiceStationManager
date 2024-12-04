import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser:null,
}

const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{

        signInSuccess:(state,action) =>{
            state.currentUser = action.payload
        },

        signInFailure:(state)=>{
            state.currentUser = null
        },

      
        signOutSuccess:(state)=>{
            state.currentUser = null
        },

        signOutFailure:(state)=>{
            state.currentUser = null
        }

       
    }
});


export const {
    signInStart, 
    signInSuccess, 
    signInFailure, 
    updateStart,
    signOutStart,
    signOutFailure,
    signOutSuccess

} = userSlice.actions

export default userSlice.reducer;