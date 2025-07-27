import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HotelsList from './components/HotelsList';
import Search from './components/SearchHotelsManager';
import ProfileList from './components/ProfileList';
import UserList from './components/UserList';
import SearchHotelsManager from './components/SearchHotelsManager';


const App = () => {
    return (
        <Router>
            <Navbar />
            {/* <Search /> */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/AllHotels" element={<HotelsList/>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/Profile" element={<ProfileList />} />
              <Route path="/Users" element={<UserList />} />            
              <Route path="/Bookings" element={<SearchHotelsManager />} />
              
            </Routes>
        </Router>
    );
};

export default App;