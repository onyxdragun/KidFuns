import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addKid, fetchKidsData } from '../store/kidsSlice.js';

const AddKid = ({ familyId }) => {
  const [kidName, setKidName] = useState('');
  const [allowanceRate, setAllowanceRate] = useState('');
  const [startingBalance, setStartingBalance] = useState('');
  const { family_id, family_name, loading, error } = useSelector((state) => state.family);
  const { user } = useSelector((state) => state.auth);
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
            user_id: user.user_id
          })
        );
        if (response.payload.success) {
          console.log(response.payload.message);
          dispatch(fetchKidsData(family_id));
          setKidName('');
          setAllowanceRate('');
          setStartingBalance('');
        } else {
          console.log(response.payload.message);
        }
      } else {
        console.log("Family ID invalid");
      }

    } catch (error) {
      console.log("Something went wrong");
    }
  }

  return (
    <div className="addkid__container">
      <h2>Add a Child</h2>
      <div className="addkid__form">
        <div className="addkid__form__element">
          <label>Child's Name</label>
          <input
            type="text"
            placeholder="Enter child's name"
            value={kidName}
            onChange={(e) => setKidName(e.target.value)}
          />
        </div>
        <div className="addkid__form__element">
          <label>Weekly Allowance Rate</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={allowanceRate}
            onChange={(e) => setAllowanceRate(e.target.value)}
          />
        </div>
        <div className="addkid__form__element">
          <label>Starting Balance</label>
          <input
            type="number"
            placeholder="Enter amount"
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