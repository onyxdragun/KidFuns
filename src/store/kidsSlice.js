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
    try {
      const response = await axios.get(`/api/kids/transactions/${kidId}`);
      if (response.data.success) {
        return {
          kidId,
          transactions: response.data.transactions
        }
      } else {
        return {
          kidId,
          transactions: []
        };
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addTransaction = createAsyncThunk(
  'kids/addTransaction',
  async ({ userId, kidId, amount, description }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/kids/transactions', {
        userId,
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

export const addKid = createAsyncThunk(
  'kids/addKid',
  async ({ kidName, allowanceRate, startingBalance, family_id, user_id }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/kids/addKid', {
        kidname: kidName,
        familyId: parseInt(family_id),
        allowanceRate: parseFloat(allowanceRate),
        currentBalance: parseFloat(startingBalance),
        userId: user_id
      });

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'kids/updateTransaction',
  async ({ transaction_id, kid_id, amount, description, user_id }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/kids/transactions/update/${transaction_id}`, {
        kid_id,
        amount,
        description,
        user_id
      });
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response.message);
    }
  }
);

export const updateData = createAsyncThunk(
  'kids/updateData',
  async ({ kid_id, currentBalance, allowanceRate, family_id, user_id }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/kids/data/update`, {
        kid_id,
        currentBalance,
        allowanceRate,
        family_id,
        user_id
      });
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(data.response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response.message);
    }
  }
)

export const updateAndFetchTransactions = (updatedData) => async (dispatch) => {
  try {
    const response = await dispatch(updateTransaction(updatedData));

    if (response.payload.success) {
      await dispatch(fetchTransactions(updatedData.kid_id));
    }
  } catch (error) {
    console.log('Error updated and fetching transactions: ', error);
  }
};

const initialState = {
  kids: [],
  loading: false,
  error: null,
  message: null,
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
        state.message = null;
      })
      .addCase(fetchKidsData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.message = null;
          state.kids = action.payload.kids.map((kid) => ({
            ...kid,
            currentBalance: parseFloat(kid.currentBalance),
            allowanceRate: parseFloat(kid.allowanceRate),
            transactions: [],
          }));
        } else {
          state.kids = [];
          state.message = action.payload.message;
        }
      })
      .addCase(fetchKidsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      // Handle fetchTransactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        const { kidId, transactions, message } = action.payload;
        state.loading = false;
        state.message = message;
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
        state.message = null;
        console.log("addTransaction pending..");
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        const { kidId, currentBalance, transaction, message } = action.payload;
        state.loading = false;
        state.message = message;

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
        state.error = action.payload.message;
      })
      // Handle addKid
      .addCase(addKid.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(addKid.fulfilled, (state, action) => {
        console.log('addKid Payload: ', action.payload);
        state.loading = false;
      })
      .addCase(addKid.rejected, (state, action) => {
        state.loading = false,
          state.error = action.payload;
      })
      // Handle updateTransaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = action.payload.message;

        const kid = state.kids.find((kid) => kid.kid_id === action.payload.kid_id);
        if (kid) {
          kid.currentBalance = parseFloat(action.payload.currentBalance);
          kid.transactions = action.payload.transactions;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })
      // Handle updateData
      .addCase(updateData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = action.payload.message;
        const kid = state.kids.find((kid) => kid.kid_id === action.payload.kid_id);
        if (kid) {
          kid.currentBalance = action.payload.currentBalance;
          kid.allowanceRate = action.payload.allowanceRate;
        }
      })
      .addCase(updateData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      });
  },
});

export default kidsSlice.reducer;
