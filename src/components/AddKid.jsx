import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addKid, fetchKidsData } from '../store/kidsSlice.js';

const AddKid = ({ familyId }) => {
  const [kidName, setKidName] = useState('');
  const [allowanceRate, setAllowanceRate] = useState(0);
  const [startingBalance, setStartingBalance] = useState(0);
  const { family_id, family_name, loading, error } = useSelector((state) => state.family);
  const kids = useSelector((state) => state.kids);
  const dispatch = useDispatch();

  const handleAddKid = async () => {
    try {
      if (family_id) {
        const response = await dispatch(
          addKid({
            kidName,
            allowanceRate,
            startingBalance,
            family_id,
          })
        );
        console.log(response);
        if (response.payload.success) {
          console.log(response.payload.message);
          dispatch(fetchKidsData(family_id));
        } else {
          console.log(response.payload.message);
        }
      } else {
        console.log("family id is required");
      }

    } catch (error) {
      console.log("Something went wrong");
    }
  }

  return (
    <div className="content-container addkid__container">
      <h2>Add a Child</h2>
      <div className="addkid__form">
        <div className="addkid__form__element">
          <label>Child's Name</label>
          <input
            type="text"
            placeholder="Enter kid's name"
            value={kidName}
            onChange={(e) => setKidName(e.target.value)}
          />
        </div>
        <div className="addkid__form__element">
          <label>Weekly Allowance Rate</label>
          <input
            type="number"
            placeholder="0"
            value={allowanceRate}
            onChange={(e) => setAllowanceRate(e.target.value)}
          />
        </div>
        <div className="addkid__form__element">
          <label>Starting Balance</label>
          <input
            type="number"
            placeholder="0"
            value={startingBalance}
            onChange={(e) => setStartingBalance(e.target.value)}
          />
        </div>
        <div className="addkid__form__element">
          <button className="button" onClick={handleAddKid}>Add Child</button>
        </div>
      </div >

    </div >
  );
};

export default AddKid;