import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { createFamily, fetchFamilyData } from "../store/familySlice";
import FamilyJoin from './FamilyJoin';

const CreateFamily = () => {
  const [familyName, setFamilyName] = useState('');
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleCreateFamily = async () => {
    if (!familyName && !user.user_id) return;
      
    try {
      const response = await dispatch(createFamily({
        family_name: familyName,
        user_id: parseInt(user.user_id)
      }));
      if (response.payload.success) {
        dispatch(fetchFamilyData(response.payload.family_id));
      } else {
        console.log("Family not created: ", response.payload.message);
      }
    } catch (error) {
      console.log("Error CreateFamily: ", error);
    }
  }

  return (
    <div className="createfamily__container">
      <h2>Create Family</h2>
      <div className="createfamily__elements">
        <input
          type="text"
          placeholder="Enter family name"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
        />
        <button className="button" onClick={handleCreateFamily}>Create Family</button>
      </div>
      <FamilyJoin />
    </div>
  );
};

export default CreateFamily;
