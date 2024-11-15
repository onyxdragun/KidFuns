import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetchKids } from "../store/allowanceSlice";

const ListKids = () => {

  const { kids, loading, error } = useSelector((state) => state.allowance);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && user.familyId && isAuthenticated) {
      dispatch(fetchKids(user.familyId));
    }
  }, [dispatch, user.familyId, isAuthenticated]);

  return (
    <div className="listkids__container">
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
    </div>
  )

};

export default ListKids;