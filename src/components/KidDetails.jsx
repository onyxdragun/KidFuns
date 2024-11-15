import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { get, update, ref, remove } from "firebase/database";

import { saveTransaction } from '../store/allowanceSlice.js';
import database from '../firebase/firebase.js';


const KidDetails = () => {
  const { kids, loading, error } = useSelector((state) => state.allowance);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({
    amount: 0,
    description: '',
    key: '',
    kidId: ''
  });

  const kid = Object.entries(kids).find(([key, kid]) => kid.key === id)?.[1];

  if (!kid) {
    return <p>Kid not found!</p>
  }

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setEditedTransaction({
      amount: transaction.amount,
      description: transaction.description,
      key: transaction.key,
      kidId: kid.key
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "amount" ?
      (value === "" ? "" : parseFloat(value)) : value;
    if (name === "amount" && isNaN(newValue)) {
      return;
    }
    setEditedTransaction({
      ...editedTransaction,
      [name]: newValue
    });
  };

  const handleSave = async () => {
    if (editingTransaction) {
      dispatch(saveTransaction({
        ...editedTransaction
      }));

      try {
        // UPDATE FIREBASE value
        const transactionRef = editedTransaction.key ?
          ref(database, `families/${kid.familyId}/kids/${editedTransaction.kidId}/transactions/${editedTransaction.key}`)
          : null;

        console.log("editedTransactionKey: ", editedTransaction.key);

        if (editedTransaction.amount === 0) {
          await remove(transactionRef);
          console.log("Transaction deleted from database");
        } else {
          await update(transactionRef, {
            amount: editedTransaction.amount,
            description: editedTransaction.description,
          });
          console.log("Transaction updated in database");
        }

        const balanceRef = ref(database, `families/${kid.familyId}/kids/${editedTransaction.kidId}/currentBalance`);

        // Get the current balance
        const balanceSnapshot = await get(balanceRef);
        const currentBalance = balanceSnapshot.exists() ? balanceSnapshot.val() : 0;

        // Calculate the delta (if any) from the original transaction's amount
        const originalAmount = editingTransaction.amount;
        const delta = editedTransaction.amount - originalAmount;  // Difference between the new and old amounts

        const newBalanceRef = ref(database, `families/${kid.familyId}/kids/${editedTransaction.kidId}`);

        await update(newBalanceRef, {
          currentBalance: currentBalance + delta
        });

        setEditingTransaction(null);
      } catch (error) {
        console.log('Error saving transaction: ', error);
      }
    }
  }

  return (
    <div className="content-container">
      <div className="kid-details__header">
        <h1>{kid.name}</h1>
        <span>Balance: ${kid.currentBalance.toFixed(2)}</span>
      </div>
      <div className="kid-details__data">
        <h3>Transaction History</h3>
        {kid.transactions && Object.entries(kid.transactions).length > 0 ? (
          Object.entries(kid.transactions).map(([transactionKey, transaction]) => {
            return (
              <div key={transactionKey} className="kid-details__transactions">
                {editingTransaction && editingTransaction.key === transactionKey ? (
                  <div className="kid-details--edit">
                    <div>
                      <input
                        className="kid-details--edit__input"
                        type="text"
                        name="description"
                        value={editedTransaction.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <input
                        className="kid-details--edit__input"
                        type="number"
                        name="amount"
                        value={editedTransaction.amount}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="kid-details--edit__button">
                      <button
                        className="button button-small"
                        onClick={handleSave}>Save</button>
                      <button 
                        className="button button-small"
                        onClick={() => setEditingTransaction(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="kid-details__transaction">
                      {transaction.description}
                      <span>{format(new Date(transaction.createdAt), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="kid-details__amount">
                      ${transaction.amount.toFixed(2)}
                      <button 
                        className="button button-small"
                        onClick={() => handleEditClick(transaction)}>Edit</button>
                    </div>
                  </>
                )}

              </div>
            )
          })
        ) : (
          <p>No transactions available</p>
        )}
      </div>
    </div>
  );
};

export default KidDetails;