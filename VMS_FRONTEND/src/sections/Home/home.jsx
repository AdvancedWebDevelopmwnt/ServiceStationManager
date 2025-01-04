import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css'; // Import your CSS file

const App = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <img src="src/components/images/logo.jpg" alt="Logo" /> {}
        </div>
        <ul className="nav-links">
          <li>Services</li>
          <li>Insurance Claims</li>
          <li>Blogs</li>
          <li>Gallery</li>
          <li>Free Estimate</li>
        </ul>
        <button className="login-button" onClick={handleLoginClick}>
          Login
        </button>
        <button className="registration-button" onClick={handleLoginClick}>
          Register
        </button>
      </nav>
      <div className="hero">
        <div className="hero-text">
          <h1>
            The Best Solution for all<br />
            your Vehicle needs!
          </h1>
        </div>
        <div className="hero-actions">
          <div className="select-vehicle">
            <i className="fas fa-car"></i>
            <select>
              <option>Select Vehicle</option>
              <option>Car</option>
              <option>Bike</option>
              <option>Truck</option>
            </select>
          </div>
          <div className="phone-input">
            <i className="fas fa-phone"></i>
            <input type="text" placeholder="Enter Phone Number" />
          </div>
          <button className="pricing-button">Check Pricing</button>
        </div>
      </div>
    </div>
  );
};

export default App;
