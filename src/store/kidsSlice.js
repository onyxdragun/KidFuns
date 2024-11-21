import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

// Create async thunk to fetch family data
export const fetchKidsData = createAsyncThunk(
  'kids/fetchKidsData',
  async (familyId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/kids/${familyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'kids/fetchTransactions',
  async (kidId, { rejectWithValue }) => {
    console.log('Called fetchTransactions');
    try {
      const response = await axios.get(`/api/kids/transactions/${kidId}`);
      return { kidId, transactions: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addTransaction = createAsyncThunk(
  'kids/addTransaction',
  async ({ kidId, amount, description }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/kids/transactions', {
        kidId,
        amount,
        description,
      });
      return response.data;

    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  kids: [],
  loading: false,
  error: null,
};

const kidsSlice = createSlice({
  name: 'kids',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchKidsData
      .addCase(fetchKidsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKidsData.fulfilled, (state, action) => {
        state.loading = false;
        state.kids = action.payload.map((kid) => ({
          ...kid,
          currentBalance: parseFloat(kid.currentBalance),
          allowanceRate: parseFloat(kid.allowanceRate),
          transactions: [],
        }));
      })
      .addCase(fetchKidsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchTransactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        const { kidId, transactions } = action.payload;
        console.log(transactions);
        state.loading = false;

        const parsedTransactions = Object.entries(transactions).reduce((acc, [key, transaction]) => {
          acc[key] = {
            ...transaction,
            amount: parseFloat(transaction.amount)
          };
          return acc;
        }, {});

        const kid = state.kids.find((kid) => kid.kid_id === kidId);
        if (kid) {
          kid.transactions = parsedTransactions;
        }
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle addTransaction
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("addTransaction pending..");
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        const { kidId, currentBalance, transaction, message } = action.payload;
        state.loading = false;

        const kid = state.kids.find((kid) => kid.kid_id === kidId);
        if (kid) {
          kid.currentBalance = parseFloat(currentBalance);
          if (!state.transaction) {
            state.transactions = {};
          }

          if (state.transactions[kidId]) {
            state.transactions[kidId].push(transaction);
          } else {
            state.transactions[kidId] = [transaction];
          }
        }
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default kidsSlice.reducer;
