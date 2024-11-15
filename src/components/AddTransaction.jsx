import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { get, push, ref, update, child } from "firebase/database";

import { fetchKids } from "../store/allowanceSlice";
import database from '../firebase/firebase.js';

const AddTransaction = ({ familyId }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKidId, setSelectedKidId] = useState('');
  const dispatch = useDispatch();
  const kids = useSelector((state) => state.allowance.kids);

  const handleAmountChange = (e) => setAmount(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount && description) {
      const transactionData = {
        amount: parseFloat(amount),
        description,
        createdAt: Date.now()
      };

      try {
        // get currentBalance
        const kidRef = ref(database, `families/${familyId}/kids/${selectedKidId}`);
        const transactionRef = child(kidRef, 'transactions');

        // Write new transaction
        const newTransactionRef = await push(transactionRef, transactionData);
        console.log("New transaction key: ", newTransactionRef.key);

        const currentBalanceSnapshot = await get(child(kidRef, 'currentBalance'));
        const currentBalance = currentBalanceSnapshot.exists() ? currentBalanceSnapshot.val() : 0;
        const newBalance = currentBalance + transactionData.amount;
        await update(kidRef, {
          currentBalance: newBalance
        });

        // dispatch(addTransaction({
        //   kidId: selectedKidId,
        //   ...transactionData,
        //   firebaseKey: newTransactionRef.key,
        // }));

        dispatch(fetchKids(familyId));

        console.log("Transaction successfully written!");
      } catch (error) {
        console.log("Error writing transaction to Firebase: ", error);
      }
    }

    setAmount('');
    setDescription('');
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
            <option key={key} value={key}>{kid.name}</option>
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