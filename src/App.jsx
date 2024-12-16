import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Header from './components/Header.jsx';
import KidDetails from './components/KidDetails.jsx';
import FamilyDashboard from './components/FamilyDashboard.jsx';
import Footer from './components/Footer.jsx';
import Faq from './components/Faq.jsx';

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Header />
      <div className="content-container">
        <Routes>
          <Route path="/" element={isAuthenticated && user ?
            <Dashboard /> :
            <LoginPage />} />
          <Route path="/kid/:id" element={<KidDetails />} />
          <Route path="/familydashboard" element={<FamilyDashboard />} />
          <Route path="/faq" element={<Faq />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  )
}

export default App
