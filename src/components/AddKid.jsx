import React, { useState } from 'react';
import { ref, push, set } from 'firebase/database';

import database from '../firebase/firebase.js';
import { useSelector } from 'react-redux';

const AddKid = ({ familyId }) => {
  const [kidName, setKidName] = useState('');
  const [allowanceRate, setAllowanceRate] = useState(0);
  const [startingBalance, setStartingBalance] = useState(0);
  const { family_id, family_name, loading, error } = useSelector((state) => state.family);

  const handleAddKid = async () => {
    console.log({kidName, allowanceRate, startingBalance, family_id});
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