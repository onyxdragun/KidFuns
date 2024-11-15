import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { addWeeklyAllowance, fetchKids } from "../store/allowanceSlice";
import AddTransaction from "./AddTransaction";

const Dashboard = ({ familyId }) => {
  const { kids, loading, error } = useSelector((state) => state.allowance);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && isAuthenticated && user.familyId) {
      dispatch(fetchKids(user.familyId));
    }
  }, [dispatch, user, isAuthenticated]);

  const handleAddAllowance = () => {
    dispatch(addWeeklyAllowance());
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="content-container">
      {user.familyId ? (
        <>
          <div className="allowances__header">
            <div>Kid</div>
            <div>Balance</div>
          </div>
          {loading ? (
            <div className="allowances--loading">
              Fetching Data...
            </div>
          ) : (
            <div>
              {Object.entries(kids).map(([key, kid]) => (
                <Link
                  to={`/kid/${key}`}
                  key={key}
                  className="allowances__container"
                >
                  <h2 className="allowances__kidname">{kid.name}</h2>
                  <div>
                    <span className="allowances__data">${kid.currentBalance.toFixed(2)}</span>
                  </div>

                </Link>
              ))}
            </div>
          )}
          <AddTransaction familyId={familyId} />
        </>
      ) : (
        <div className="content-container allowances__noFam">
          <h2>Please create a Family</h2>
        </div>
      )}
    </div>
  );
};

export default Dashboard;