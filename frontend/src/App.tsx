import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HotelsList from './components/HotelsList';
import ProfileList from './components/ProfileList';
import UserList from './components/UserList';
import SearchHotelsManager from './components/SearchHotelsManager';
import MyReservations from './components/MyReservations';
// import ClientSupportPage from './pages/support/ClientSupportPage';
// import ManagerSupportPage from './pages/support/ManagerSupportPage';
// import ChatWindow from './components/support/ChatWindow';

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
              <Route path="/MyReservations" element={<MyReservations />} />          
              <Route path="/Bookings" element={<SearchHotelsManager />} />
              {/* <Route path="/chat" element={<ClientSupportPage />} />
              <Route path="/requests" element={<ManagerSupportPage/>} />
              <Route path="/chat/:id" element={<ChatWindow/>} /> */}
            </Routes>
        </Router>
    );
};

export default App;