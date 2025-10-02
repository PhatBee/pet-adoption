import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import productReducer from "./productSlice";
import productDetailReducer from "./productDetailSlice";
import cartReducer from './cartSlice';
import orderReducer from './orderSlice'
import orderDetailReducer from './orderDetailSlice'
import snapshotReducer from './orderSnapshotSlice'
import wishlistReducer from './wishlistSlice'


const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  productDetail: productDetailReducer,
  cart: cartReducer,
  order: orderReducer,
  orderDetail: orderDetailReducer,
  snapshot: snapshotReducer,
  wishlist: wishlistReducer

});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // chỉ persist nhánh auth
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }), // cần tắt check để dùng redux-persist
});

export const persistor = persistStore(store);
