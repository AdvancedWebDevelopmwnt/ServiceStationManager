import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import vehicleReducer from './user/vehicleSlice';
import customerSlice from './user/customerSlice';
import jobCart from './user/jobCart';
import serviceJobsSlice from './user/ServiceJobsSlice';

const rootreducer = combineReducers({
  user: userReducer,
  vehicle: vehicleReducer,
  customer: customerSlice,
  jobs: jobCart,
  serviceJobs: serviceJobsSlice,
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};

const presistedReducer = persistReducer(persistConfig, rootreducer);

export const store = configureStore({
  reducer: presistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistore = persistStore(store);
