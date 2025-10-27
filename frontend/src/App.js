import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';

import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import SubscriptionList from './components/Subscriptions/SubscriptionList';
import AddSubscription from './components/Subscriptions/AddSubscription';
import EditSubscription from './components/Subscriptions/EditSubscription';
import PaymentCalendar from './components/Calendar/PaymentCalendar';
import Settings from './components/Settings/Settings';
import Navbar from './components/Navbar/Navbar';
import GlobalBackground from './components/Background/GlobalBackground';

function App() {
    // Check both token and accessToken for backward compatibility
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const accessToken = localStorage.getItem('accessToken');
        const token = localStorage.getItem('token');
        return !!(accessToken || token);
    });

    // Apply saved theme on app load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
    }, []);

    // Listen for storage changes (logout in another tab)
    useEffect(() => {
        const handleStorageChange = () => {
            const accessToken = localStorage.getItem('accessToken');
            const token = localStorage.getItem('token');
            setIsAuthenticated(!!(accessToken || token));
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also check periodically in case of same-tab logout
        const interval = setInterval(() => {
            const accessToken = localStorage.getItem('accessToken');
            const token = localStorage.getItem('token');
            const newAuthState = !!(accessToken || token);
            if (newAuthState !== isAuthenticated) {
                setIsAuthenticated(newAuthState);
            }
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [isAuthenticated]);

    return (
        <Router>
            <div className="App">
                {/* Global Shadcn-style background (aurora). Change variant to 'grid' or 'dots' if desired. */}
                <GlobalBackground variant={localStorage.getItem('bgVariant') || 'aurora'} />
                {isAuthenticated && <Navbar />}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <Routes>
                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
                    <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" replace />} />
                    <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />

                    <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
                    <Route path="/subscriptions" element={isAuthenticated ? <SubscriptionList /> : <Navigate to="/login" replace />} />
                    <Route path="/subscriptions/add" element={isAuthenticated ? <AddSubscription /> : <Navigate to="/login" replace />} />
                    <Route path="/subscriptions/edit/:id" element={isAuthenticated ? <EditSubscription /> : <Navigate to="/login" replace />} />
                    <Route path="/calendar" element={isAuthenticated ? <PaymentCalendar /> : <Navigate to="/login" replace />} />
                    <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />} />

                    <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;