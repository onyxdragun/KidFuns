import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import AddKid from "./AddKid.jsx";
import { fetchKidsData, fetchTransactions } from '../store/kidsSlice.js';
import { formatCurrency } from "../utils.js";

const ListKids = () => {
  const [isAddingChild, setIsAddingChild] = useState(false);
  const { kids, isLoading, message, error } = useSelector((state) => state.kids);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { family_id } = useSelector((state) => state.family);
  const dispatch = useDispatch();

  const handleToggleAddChild = () => {
    setIsAddingChild((prev) => !prev);
  }

  const handleCancelAddChild = () => {
    console.log('handleCancelAddChild clicked');
    setIsAddingChild(false);
  };

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
                <div>{formatCurrency(kid.allowanceRate)}</div>
                <div>{formatCurrency(kid.currentBalance)}</div>
                <div>
                  <button className="button button-small button-teal"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
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