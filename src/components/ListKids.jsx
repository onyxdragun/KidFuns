import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetchKidsData, fetchTransactions } from '../store/kidsSlice.js';

const ListKids = () => {

  const { kids, isLoading, message, error } = useSelector((state) => state.kids);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { family_id } = useSelector((state) => state.family);
  const dispatch = useDispatch();

  console.log(message);

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
      </div>
    ) : (
      <>
      <h2>Children</h2>
      <div className="listkids__header">
        <div><h3>Name</h3></div>
        <div><h3>Allowance Rate</h3></div>
        <div><h3>Actions</h3></div>
      </div>
      <div className="listkids__data">
        {Object.entries(kids).map(([key, kid]) => (
          <div key={key} className="listkids__kid">
            <div>{kid.name}</div>
            <div>{kid.allowanceRate}</div>
            <div>
              <button className="button button-small">Edit</button>
            </div>
          </div>

        ))}
      </div>
      </>
    )}
    </div>
  );
};

export default ListKids;