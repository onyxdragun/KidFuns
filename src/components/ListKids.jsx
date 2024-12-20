import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { faBan, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import AddKid from "./AddKid.jsx";
import { fetchKidsData, updateData } from '../store/kidsSlice.js';
import { formatCurrency } from "../utils.js";
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";

const ListKids = () => {
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [editingChildData, setEditingChildData] = useState(null);
  const [editedChildData, setEditedChildData] = useState({
    kid_id: 0,
    family_id: 0,
    name: '',
    currentBalance: 0,
    allowanceRate: 0
  });

  const { kids, isLoading, message, error } = useSelector((state) => state.kids);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { family_id } = useSelector((state) => state.family);
  const dispatch = useDispatch();

  const handleToggleAddChild = () => {
    setIsAddingChild((prev) => !prev);
  }

  const handleCancelAddChild = () => {
    setIsAddingChild(false);
  };

  const handleEditChildData = (child) => {
    setEditingChildData(child);
    setEditedChildData({
      kid_id: child.kid_id,
      family_id: child.family_id,
      name: child.name,
      currentBalance: child.currentBalance,
      allowanceRate: child.allowanceRate
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = (name === "allowanceRate" || name === "currentBalance") ?
      (value === "" ? "" : parseFloat(value)) : value;

    // Prevent NaN values for "allowanceRate" or "currentBalance"
    if ((name === "allowanceRate" || name === "currentBalance") && isNaN(newValue)) {
      return;
    }

    setEditedChildData({
      ...editedChildData,
      [name]: newValue
    });
  };

  const handleSave = async () => {
    if (editingChildData) {
      try {
        const updatedData = {
          kid_id: editedChildData.kid_id,
          allowanceRate: editedChildData.allowanceRate,
          currentBalance: editedChildData.currentBalance,
          family_id: editedChildData.family_id,
          user_id: user.user_id
        };

        await dispatch(updateData(updatedData));

        setEditingChildData(null);
        dispatch(fetchKidsData(family_id));
      } catch (error) {
        console.log('Error saving transaction: ', error);
      }
    }
  }

  useEffect(() => {
    if (user && isAuthenticated && family_id) {
      dispatch(fetchKidsData(family_id));
    }
  }, [dispatch, user, isAuthenticated, family_id]);

  return (
    <div className="listkids__container">
      {message ? (
        <div className="listkids__none">
          {message}
          <AddKid />
        </div>
      ) : (
        <>
          <div className="listkids__header">
            <h2>Children</h2>
            <button
              onClick={handleToggleAddChild}
              className="button button-small button-lightteal"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="listkids__subheader">
            <div><h3>Name</h3></div>
            <div><h3>Allowance Rate</h3></div>
            <div><h3>Current Balance</h3></div>
            <div><h3>Actions</h3></div>
          </div>
          <div className="listkids__data">
            {Object.entries(kids).map(([key, kid]) => (
              <div key={key} className="listkids__kid">
                <div>{kid.name}</div>
                <div>
                  {editingChildData && editingChildData.kid_id === kid.kid_id ? (
                    <input
                      type="number"
                      className="listkids__kid__input"
                      name="allowanceRate"
                      value={editedChildData.allowanceRate}
                      onChange={handleChange}
                    />
                  ) : (
                    formatCurrency(kid.allowanceRate)
                  )}
                </div>
                <div>
                  {editingChildData && editingChildData.kid_id === kid.kid_id ? (
                    <input
                      type="number"
                      className="listkids__kid__input"
                      name="currentBalance"
                      value={editedChildData.currentBalance}
                      onChange={handleChange}
                    />
                  ) : (
                    formatCurrency(kid.currentBalance)
                  )}
                </div>
                <div>
                  {editingChildData && editingChildData.kid_id === kid.kid_id ? (
                    <>
                      <button
                        className="button button-small button-teal"
                        onClick={handleSave}
                      >
                        <FontAwesomeIcon icon={faFloppyDisk} />
                      </button>
                      <button
                        className="button button-small button-teal"
                        onClick={() => setEditingChildData(null)}
                      >
                        <FontAwesomeIcon icon={faBan} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="button button-small button-teal"
                      onClick={() => handleEditChildData(kid)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
          {isAddingChild && (
            <AddKid handleCancelAddChild={handleCancelAddChild} />
          )}
        </>
      )}
    </div>
  );
};

export default ListKids;