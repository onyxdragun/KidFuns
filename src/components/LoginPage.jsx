import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import axios from 'axios';

import { loginUser } from "../store/authSlice.js";

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formEmail, setEmail] = useState('');
  const [formPassword, setPassword] = useState('');
  const [formConfirmPassword, setConfirmPassword] = useState('');
  const [formName, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(null);
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
        case 'email_required':
          setErrorMessage(error.message);
          break;
        default:
          setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  const handleForgotPassword = async () => {
    let error;
    setErrorMessage('');

    try {
      if (!formEmail) {
        error = new Error('Email required in order to request password reset');
        error.code = 'email_required';
        throw error;
      }

      await sendPasswordResetEmail(auth, formEmail);
      setMessage('Password reset email sent! Check your inbox!');
      setEmail('');
    } catch (error) {
      handleError(error, "Google login failed");
    }
  }

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, displayName, email } = result.user;

      await sendUserToAPI({ uid, email, name: displayName });
    } catch (error) {
      handleError(error, "Password reset failed");
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
      <div className="login__tabs">
        <button
          className={`login__tabs__btn ${activeTab === "login" ? "login__tabs__btn--active" : ""}`}
          onClick={() => {
            setErrorMessage('');
            setActiveTab("login");
          }}
        >
          Login
        </button>
        <button
          className={`login__tabs__btn ${activeTab === "register" ? "login__tabs__btn--active" : ""}`}
          onClick={() => {
            setErrorMessage('');
            setActiveTab("register");
          }}
        >
          Register
        </button>
      </div>
      {errorMessage && (
        <div className="login__error__message">
          {errorMessage}
        </div>
      )}
      {activeTab === "login" && (
        <div className="login__tab__content">
          <div className="login__google">
            <button className="button login__btn" onClick={handleGoogleLogin}>Sign in with Google</button>
          </div>
          <div className="login__or"><span>- or -</span></div>
          <div className="login__email">
            <form className="login__form" onSubmit={handleLogin}>
              <h2>Login with Email</h2>
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
              <div className="login__form__forgot">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleForgotPassword();
                  }}
                >
                  Forgot Password?
                </a>
              </div>
              <div className="login__form__element">
                <button className="button" type="submit">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeTab === "register" && (
        <div className="login__tab__content">
          <form className="login__form" onSubmit={handleSignUp}>
            <h2>Register with Email</h2>
            <div className="login__form__element">
              <input
                type="text"
                placeholder="Full Name"
                value={formName}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
            <div className="login__form__element">
              <input
                type="password"
                placeholder="Confirm Password"
                value={formConfirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="login__form__element">
              <button className="button" type="submit">Register</button>
            </div>
          </form>
        </div>
      )
      }
    </div >
  );

};

export default LoginPage;