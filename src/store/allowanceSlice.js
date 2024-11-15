import { createSlice } from "@reduxjs/toolkit";
import { fetchKidsData, fetchFamilyData } from "../firebase/firebase";

const initialState = {
  familyId: null,
  familyName: null,
  kids: {},
  loading: false,
  error: null,
  selectedKidId: null,
};

const allowanceSlice = createSlice({
  name: 'allowance',
  initialState,
  reducers: {
    setFamilyData: (state, action) => {
      state.familyId = action.payload.familyId;
      state.familyName = action.payload.familyName;
    },
    addWeeklyAllowance(state) {
      state.kids.forEach(kid => {
        kid.balance += kid.allowance;
      });
    },
    addTransaction(state, action) {
      const {kidId, amount, description, firebaseKey } = action.payload;
      if (state.kids[kidId]) {
        const kid = state.kids[kidId];
        state.kids[kidId] = {
          ...kid,
          currentBalance: kid.currentBalance + amount,
          transactions: {
            ...kid.transactions,
            [firebaseKey]: {
              amount,
              description,
              createdAt: Date.now()
            },
          }
        };
      }
    },
    saveTransaction: (state, action) => {
      const {kidId, key, amount, description} = action.payload;
      const kid = state.kids[kidId];

      if (kid) {
        if (amount === 0) {
          // Remove transaction
          delete kid.transactions[key];
        } else {
          const transaction = kid.transactions[key];
          if (transaction) {
            const delta = amount - transaction.amount;

            transaction.amount = amount;
            transaction.description = description;

            kid.currentBalance += delta;
          }
        }
      }
    },
    setKidsData: (state, action) => {
      state.kids = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  }
});

export const { addWeeklyAllowance,
               addTransaction,
               saveTransaction,
               setKidsData,
               setLoading,
               setFamilyData,
               setError } = allowanceSlice.actions;


// Thunk action to fetch kids and update store
export const fetchKids = (familyId) => async (dispatch) => {
  dispatch(setLoading(true));

  try {
    const kidsData = await fetchKidsData(familyId);
    if (kidsData) {
      dispatch(setKidsData(kidsData));
    } else {
      dispatch(setError('No data found for this family'));
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchFamily = (familyId) => async (dispatch) => {
  try {
    const familyData = await fetchFamilyData(familyId);
    if (familyData) {
      dispatch(setFamilyData(familyData));
    }
  } catch(error) {
    console.log("Family data not found: ", error);
  }
}

export default allowanceSlice.reducer;
