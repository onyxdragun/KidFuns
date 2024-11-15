import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CreateFamily from "./CreateFamily";
import ListKids from "./ListKids";
import AddKid from "./AddKid";
import { fetchFamily } from "../store/allowanceSlice";
import { selectFamilyId, selectFamilyName } from "../store/selectors";

const FamilyDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const familyId = useSelector(selectFamilyId);
  const familyName = useSelector(selectFamilyName);

  const dispatch = useDispatch();

  useEffect(() => {
    if (user && isAuthenticated && user.familyId) {
      dispatch(fetchFamily(user.familyId));
    }
  }, [dispatch, user, isAuthenticated]);

  return (
    <div className="content-container">
      {user && user.familyId ? (
        <div className="family__name">
          <ListKids />
        </div>
      ) : (
        <CreateFamily />
      )}
      {user && user.familyId ? (
        <AddKid familyId={familyId} />
      ) : (
        <div className="family__notice">Need to Create a Family before adding children</div>
      )}
    </div>
  )
};

export default FamilyDashboard;