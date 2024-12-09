import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import axios from 'axios';

import { loginUser } from "../store/authSlice.js";

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formEmail, setEmail] = useState('');
  const [formPassword, setPassword] = useState('');
  const [formConfirmPassword, setConfirmPassword] = useState('');
  const [formName, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const auth = getAuth();

  const sendUserToAPI = async (userData) => {
    try {
      const response = await axios.post('/api/users/login', userData);
      dispatch(loginUser(response.data));
    } catch (error) {
      handleError(error, "Error during API request");
    }
  };

  const handleError = (error, context = "Error") => {
    if (error.response) {
      console.error(`${context}: `, error.response.data);
      setErrorMessage(error.response.data.message);
    } else if (error.request) {
      console.error(`${context}: No response from server`);
      setErrorMessage("No response from server");
    } else {
      console.error(`${context}: `, error.message);
      switch (error.code) {
        case 'auth/user-not-found':
          setErrorMessage('No user found with that email');
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setErrorMessage('Incorrect user/password');
          break;
        case 'auth/email-already-in-use':
          setErrorMessage('Email address already in use');
          break;
        case 'password_missmatch':
          setErrorMessage(error.message);
          break;
        case 'password_too_short':
          setErrorMessage(error.message);
          break;
        default:
          setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, displayName, email } = result.user;

      await sendUserToAPI({ uid, email, name: displayName });
    } catch (error) {
      handleError(error, "Google login failed");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    let error;

    setErrorMessage('');

    try {
      if (formPassword !== formConfirmPassword) {
        error = new Error('Passwords do not match');
        error.code = 'password_missmatch';
        throw error;
      } else if (formPassword.length < 8) {
        error = new Error('Password needs to be at least 8 characters in length');
        error.code = 'password_too_short';
        throw error;
      }
      const result = await createUserWithEmailAndPassword(auth, formEmail, formPassword);
      const user = result.user;
      const auth2 = getAuth();
      await updateProfile(auth2.currentUser, {
        displayName: formName
      });
      const userData = { uid: user.uid, email: user.email, name: formName };
      await sendUserToAPI(userData);

      // Reset Form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.log(error.code);
      handleError(error, "Sign-up failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const result = await signInWithEmailAndPassword(auth, formEmail, formPassword);
      const { uid, displayName, email } = result.user;

      await sendUserToAPI({ uid, email, name: displayName });

      // Reset Form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      handleError(error, "Login failed");
    }
  };

  return (
    <div className="login__container">
      <div className="login">
        <h2>Login</h2>
        {errorMessage && <div className="login__error">{errorMessage}</div>}

        <div className="login__google">
          <button className="button login__btn" onClick={handleGoogleLogin}>Sign in with Google</button>
        </div>

        <div className="login__buttons">
          {!isSignUp ? (
            <button className="button login__btn" onClick={() => setIsSignUp(true)}>Sign up with Email</button>
          ) : (
            <button className="button login__btn" onClick={() => setIsSignUp(false)}>Log in with Email</button>
          )}
        </div>

        <form className="login__form" onSubmit={isSignUp ? handleSignUp : handleLogin}>
          <h2>{isSignUp ? 'Sign Up' : 'Log in'} with Email</h2>
          {isSignUp && (
            <div className="login__form__element">
              <input
                type="text"
                placeholder="Full Name"
                value={formName}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="login__form__element">
            <input
              type="email"
              placeholder="Email"
              value={formEmail}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login__form__element">
            <input
              type="password"
              placeholder="Password"
              value={formPassword}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isSignUp && (
            <div className="login__form__element">
              <input
                type="password"
                placeholder="Confirm Password"
                value={formConfirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div className="login__form__element">
            <button className="button" type="submit">{isSignUp ? 'Sign Up' : 'Log In'}</button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default LoginPage;