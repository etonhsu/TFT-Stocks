import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/Authentication.tsx'; // Ensure the path is correct
import '../../index.css';

export const LogoutButton: React.FC = () => {
    const navigate = useNavigate();
    const { setToken, setIsLoggedIn } = useAuth(); // Use the useAuth hook to get the setToken method and setIsLoggedIn

    const handleLogout = () => {
        // Clear the token and logged-in status using the auth context
        setToken(null);
        setIsLoggedIn(false); // Explicitly setting logged-in status to false

        // Optionally remove other local storage items that are not managed by AuthContext
        localStorage.removeItem('dashboardData');

        // Redirect user to the home page or login page
        navigate('/');
    };

    return (
        <button style={{
            width: '100%',
            color: '#222',
            background: '#EAEAEA'
        }} onClick={handleLogout}>Logout</button>
    );
}
