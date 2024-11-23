import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CreateFamily from "./CreateFamily";
import ListKids from "./ListKids";
import AddKid from "./AddKid";
import { fetchFamilyData, setFamily, setLoading, setError, selectFamily } from '../store/familySlice.js';
import { fetchKidsData } from "../store/kidsSlice";

const FamilyDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { family_id, family_name } = useSelector((state) => state.family);

  const dispatch = useDispatch();

  useEffect(() => {
    if (user && isAuthenticated && family_id) {
      console.log('Fetching Kids Data');
      dispatch(fetchKidsData(family_id));
    }
  }, [dispatch, user, isAuthenticated, family_id]);

  useEffect(() => {
    if (user) {
      dispatch(fetchFamilyData(user.user_id));
    }
  }, [dispatch, user, family_id]);


  return (
    <div className="content-container">
      {user && family_id ? (
        <div className="family__name">
          <ListKids />
        </div>
      ) : (
        <CreateFamily />
      )}
      {user && family_id ? (
        <AddKid />
      ) : (
        <div className="family__notice">Need to Create a Family before adding children</div>
      )}
    </div>
  )
};

export default FamilyDashboard;