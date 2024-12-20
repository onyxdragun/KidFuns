import { faCancel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addKid, fetchKidsData } from '../store/kidsSlice.js';

const AddKid = ({ handleCancelAddChild }) => {
  const [kidName, setKidName] = useState('');
  const [allowanceRate, setAllowanceRate] = useState('');
  const [startingBalance, setStartingBalance] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { family_id, family_name, loading, error } = useSelector((state) => state.family);
  const { user } = useSelector((state) => state.auth);
  const kids = useSelector((state) => state.kids);
  const dispatch = useDispatch();

  const handleAddKid = async () => {
    setErrorMessage(null);
    try {
      if (family_id && kidName && startingBalance && allowanceRate) {
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
          dispatch(fetchKidsData(family_id));
          setKidName('');
          setAllowanceRate('');
          setStartingBalance('');
        } else {
          console.log(response.payload.message);
        }
      } else {
        setErrorMessage('All fields are required');
      }
    } catch (error) {
      console.log("Something went wrong");
    }
  }

  return (
    <div className="addkid__container">
      <h3>Add a Child</h3>
      <div className="addkid__form">
        {errorMessage && (
          <div className="addkid__error">
            {errorMessage}
          </div>
        )}
        <div className="addkid__form__element">
          <label>Child's Name</label>
          <input
            type="text"
            placeholder="Enter child's name"
            value={kidName}
            onChange={(e) => setKidName(e.target.value)}
            required
          />
        </div>
        <div className="addkid__form__element">
          <label>Weekly Allowance Rate</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={allowanceRate}
            onChange={(e) => setAllowanceRate(e.target.value)}
            required
          />
        </div>
        <div className="addkid__form__element">
          <label>Starting Balance</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={startingBalance}
            onChange={(e) => setStartingBalance(e.target.value)}
            required
          />
        </div>
        <div className="addkid__form__element">
          <button className="button button-teal" onClick={handleAddKid}>Add Child</button>
          {handleCancelAddChild && (
            <button
              className="button button-teal"
              onClick={handleCancelAddChild}
            >
              <FontAwesomeIcon icon={faCancel} />
            </button>
          )}
        </div>
      </div >

    </div >
  );
};

export default AddKid;