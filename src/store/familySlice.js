import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

// Create async thunk to fetch family data
export const fetchFamilyData = createAsyncThunk(
  'family/fetchFamilyData',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/families/${userId}`);
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(error.response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createFamily = createAsyncThunk(
  'family/createFamily',
  async ({ family_name, user_id }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/families/create', {
        family_name,
        user_id,
      });
      if (response.data.success) {
        return response.data
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Unknown error');
    }
  }
);

const initialState = {
  family_id: null,
  family_name: null,
  loading: false,
  error: null,
};

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamilyData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFamilyData.fulfilled, (state, action) => {
        state.family_id = action.payload.family_id;
        state.family_name = action.payload.family_name;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchFamilyData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Handle Creating Family
      .addCase(createFamily.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFamily.fulfilled, (state, action) => {
        state.family_name = action.payload.family_name;
        state.loading = false;
        state.error = null;
      })
      .addCase(createFamily.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setFamily, setLoading, setError } = familySlice.actions;

export const selectFamily = (state) => state.family.family;

export default familySlice.reducer;