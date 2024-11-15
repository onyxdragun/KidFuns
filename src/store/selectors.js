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
