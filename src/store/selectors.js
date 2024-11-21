import {createSelector} from '@reduxjs/toolkit';

const selectAllowanceState = (state) => state.allowance;

export const selectFamilyId = createSelector(
  [selectAllowanceState],
  (allowance) => allowance.familyId
);

export const selectFamilyName = createSelector(
  [selectAllowanceState],
  (allowance) => allowance.familyName
);

export const selectSortedTransactions = (state, kidId) => {
  const kid = state.kids.find(kid => kid.kid_id === kidId);
  if (!kid || !kid.transactions) return [];

  return [...kid.transactions].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
};
