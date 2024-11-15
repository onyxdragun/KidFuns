import React from "react";
import { useDispatch } from "react-redux";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { get, ref, set, child } from "firebase/database";

import database from '../firebase/firebase.js';
import { setUser } from "../store/authSlice.js";

const LoginPage = () => {
  const dispatch = useDispatch();
  const auth = getAuth();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      const {uid, displayName, email} = result.user;
      let familyId = null;

      const userRef = ref(database, `users/${uid}`);
      let snapshot = await get(userRef);
      if (!snapshot.exists()) {
        await set(userRef, {
          name: displayName,
          email,
          createdAt: Date.now()
        });
        console.log("New user created with Google Login: ", displayName);
      } else {
        const user = snapshot.val();
        console.log("Welcome back: ", displayName);

        dispatch(setUser({
          uid,
          email,
          displayName,
          familyId: user.familyId
        }));
      }
    } catch (error) {
      console.log("Error during Google login: ", error);
    }
  };
  
  return (
    <div className="login content-container">
      <button className="button" onClick={handleLogin}>Sign in with Google</button>
    </div>
  );

};

export default LoginPage;