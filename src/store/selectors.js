import {createSelector} from '@reduxjs/toolkit';

export const selectSortedTransactions = (state, kidId) => {
  const kid = state.kids.find(kid => kid.kid_id === kidId);
  if (!kid || !kid.transactions) return [];

  return [...kid.transactions].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
};
