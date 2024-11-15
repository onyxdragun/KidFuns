import React, { useState } from "react";
import { get, ref, set, update } from 'firebase/database';
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';

import database from '../firebase/firebase.js';
import { setUser } from "../store/authSlice.js";

const CreateFamily = () => {
  const [familyName, setFamilyName] = useState('');
  const user = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  console.log(user);

  const handleCreateFamily = async () => {
    if (!familyName) return;

    try {
      const familyId = uuidv4();
      const familyRef = ref(database, `families/${familyId}`);
      let snapshot = await get(familyRef);

      if (!snapshot.exists()) {
        // Family doesnt exist, add it to the DB
        await set(familyRef, {
          familyName,
          kids: {}
        });
      }

      const userRef = ref(database, `users/${user.user.uid}`);
      snapshot = await get(userRef);
      if (snapshot.exists()) {
        await update(userRef, {
          familyId
        });
      }
    } catch (error) {
      console.log("Error CreateFamily: ", error);
    }
    console.log("Family created successfully");
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
    </div>
  );
};

export default CreateFamily;
