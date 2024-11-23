import { combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";

import authReducer from "./authSlice.js";
import familyReducer from "./familySlice.js";
import kidsReducer from './kidsSlice.js';

const appReducer = combineReducers({
  auth: authReducer,
  family: familyReducer,
  kids: kidsReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logoutUser') {
    storage.removeItem('persist:root');
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;