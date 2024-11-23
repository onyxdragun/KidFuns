import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { format, parseISO } from "date-fns";

import { fetchTransactions, updateAndFetchTransactions } from "../store/kidsSlice.js";

const KidDetails = () => {
  const { kids, loading, error, message } = useSelector((state) => state.kids);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { family_id } = useSelector((state) => state.family);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [kidId, setKidId] = useState(null);
  const [kid, setKid] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({
    amount: 0,
    description: '',
    transaction_id: '',
    kidId: ''
  });

  useEffect(() => {
    if (user && isAuthenticated && kidId) {
      dispatch(fetchTransactions(kidId));
    }
  }, [dispatch, user, isAuthenticated, kidId]);

  useEffect(() => {
    const foundChild = Object.entries(kids).find(([key, kid]) => kid.kid_id === parseInt(id))?.[1];
    if (foundChild) {
      setKidId(foundChild.kid_id);
      setKid(foundChild);
    }
  }, [id, kids]);

  if (!kid) {
    return <p>Kid not found!</p>
  }

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setEditedTransaction({
      amount: transaction.amount,
      description: transaction.description,
      transaction_id: transaction.transaction_id,
      kidId: kid.kid_id
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
      try {
        const updatedData = {
          transaction_id: editedTransaction.transaction_id,
          kid_id: kid.kid_id,
          amount: editedTransaction.amount,
          description: editedTransaction.description,
        };

        await dispatch(updateAndFetchTransactions(updatedData));

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
        {kid.transactions && (Object.entries(kid.transactions).length > 0) ? (
          Object.entries(kid.transactions).map(([transactionKey, transaction]) => {
            return (
              <div key={transactionKey} className="kid-details__transactions">
                {editingTransaction && editingTransaction.transaction_id === transaction.transaction_id ? (
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
                      <span>{format(parseISO(transaction.transaction_date), 'MMMM d, yyyy')}</span>
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