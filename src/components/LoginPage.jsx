import React from "react";
import { useDispatch } from "react-redux";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from 'axios';

import { loginUser } from "../store/authSlice.js";

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
      const { uid, displayName, email } = result.user;

      const response = await axios.post('/api/users/login', {
        uid: uid,
        email: email,
        name: displayName,
      });

      const userData = response.data;
      dispatch(loginUser(userData));
    } catch (error) {
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        console.error('Error Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error Request:', error.request);
      } else {
        console.log("Error during Google login: ", error);
      }
    }
  };

  return (
    <div className="login">
      <button className="button" onClick={handleLogin}>Sign in with Google</button>
    </div>
  );

};

export default LoginPage;