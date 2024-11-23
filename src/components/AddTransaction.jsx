import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addTransaction } from "../store/kidsSlice.js";

const AddTransaction = ({ family_id }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKidId, setSelectedKidId] = useState('');
  const { kids, loading, error } = useSelector((state) => state.kids);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleAmountChange = (e) => setAmount(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (amount && description && selectedKidId) {
      try {
        await dispatch(addTransaction({ userId: user.user_id, kidId: parseInt(selectedKidId), amount: parseFloat(amount), description }));

        setAmount('');
        setDescription('');
      } catch (error) {
        console.log("Error adding transaction: ", error);
      }
    }
  };

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
    >
      <h3>Add Transaction</h3>
      <div className="form-input">
        <label>Kid:</label>
        <select
          onChange={(e) => setSelectedKidId(e.target.value)}
          name="kid">
          <option></option>
          {Object.entries(kids).map(([key, kid]) => (
            <option key={kid.kid_id} value={kid.kid_id}>{kid.name}</option>
          ))}
        </select>
      </div>
      <div className="form-input">
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Enter amount"
        />
      </div>
      <div className="form-input">
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Enter description"
        />
      </div>
      <div className="form-input">
        <button className="button" type="submit">Add Transaction</button>
      </div>
    </form>

  );
};

export default AddTransaction;