import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Header from './components/Header.jsx';
import KidDetails from './components/KidDetails.jsx';
import FamilyDashboard from './components/FamilyDashboard.jsx';

import { fetchKids, fetchFamily } from './store/allowanceSlice.js';

import './firebase/firebase.js';

function App() {
  const {user, isAuthenticated} = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (user && isAuthenticated) {
  //     dispatch(fetchFamily(user.familyId));

  //     dispatch(fetchKids(user.familyId));
  //   }
  // }, [dispatch, user, isAuthenticated]);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={isAuthenticated && user ? 
                    <Dashboard /> :
                    <LoginPage /> } />
        <Route path="/kid/:id" element={<KidDetails />} />
        <Route path="/familydashboard" element={<FamilyDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
