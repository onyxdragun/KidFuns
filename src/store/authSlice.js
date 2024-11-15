import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { onAuthStateChanged } from "firebase/auth";

const initialState = {
  user: null,
  isAuthenticated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const user = action.payload;
      state.user = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        familyId: user.familyId
      };
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkAuthState.fulfilled, (state) => {

    });
  },
});

export const {setUser, logoutUser} = authSlice.actions;
export default authSlice.reducer;

export const checkAuthState = createAsyncThunk('auth/checkAuthState', async(_, {dispatch}) => {
  const auth = getAuth();
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          dispatch(setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            familyId: user.familyId,
          }));
        } else {
          dispatch(logoutUser());
        }
        resolve();
      },
      (error) => {
        reject(error);
      }
    );
    return() => unsubscribe();
  });
});