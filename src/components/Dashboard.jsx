import { format } from "date-fns";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchFamilyData } from "../store/familySlice";

import { fetchKidsData } from "../store/kidsSlice";
import AddTransaction from "./AddTransaction";

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { family_id, loading: familyLoading, error: famiyError } = useSelector((state) => state.family);
  const { kids, loading: kidsLoading, error: kidsError } = useSelector((state) => state.kids);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && isAuthenticated && family_id) {
      dispatch(fetchKidsData(family_id));
    }
  }, [dispatch, user, isAuthenticated, family_id]);

  useEffect(() => {
    console.log("Fetching family data");
    if (user && isAuthenticated) {
      dispatch(fetchFamilyData(user.user_id));
    }
  }, [dispatch, user, isAuthenticated]);

  return (
    <div className="content-container">
      {family_id ? (
        <>
          <div className="allowances__header">
            <div>Kid</div>
            <div>Balance</div>
          </div>
          {familyLoading || kidsLoading ? (
            <div className="allowances--loading">
              Fetching Data...
            </div>
          ) : (
            <div>
              {Object.entries(kids).map(([key, kid]) => {
                return (
                  <Link
                    to={`/kid/${kid.kid_id}`}
                    key={key}
                    className="allowances__container"
                  >
                    <h2 className="allowances__kidname">{kid.name}</h2>
                    <div>
                      <span className="allowances__data">${kid.currentBalance.toFixed(2)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <AddTransaction family_id={family_id} />
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