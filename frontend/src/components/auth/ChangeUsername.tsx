import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from "../../utils/Authentication.tsx";
import styled from "styled-components";

interface ChangeUsernameProps {
    onClose: () => void;
}

const LoginBarContainer = styled.div`
    background: #333; // Dark background color
    border-radius: 20px; // Rounded corners
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 5px 15px;
    height: 40px;
    width: 300px; // Max width of the search bar
    margin-top: 10px;
`;

const StyledInput = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    color: #EAEAEA;
    font-family: 'Sen', sans-serif;
    font-size: 14px;
    &:focus {
        outline: none;
    }
`;

const StyledLabel = styled.label`
  font-size: 18px; // Adjust this value as needed
  color: #EAEAEA; // Example color
`;

const LoginContainer = styled.div`
    padding: 15px 15px 8px 0;
    width: 400px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-start; // Center the button horizontally
`;

const StyledButton = styled.button`
    display: flex;
    justify-content: center; // Centering text since no icon is involved
    padding: 13px 15px;
    margin: 35px 0 15px;
    font-weight: normal;
    font-size: 16px;
    background: #333; // Dark background color
    color: #EAEAEA; // Light text color for contrast
    text-decoration: none;
    border: none;
    border-radius: 4px;
    width: 35%;
    cursor: pointer;

    &:hover {
        background: #444; // Lighter background on hover
        color: cornflowerblue; // Changing text color on hover
    }

    &:active {
        background: #555; // Even lighter background on active
    }

    &:focus {
        outline: none; // No focus outline
    }
`;

export const ChangeUsername: React.FC<ChangeUsernameProps> = ({ onClose }) => {
    const [editing, setEditing] = useState<boolean>(false);
    const [newUsername, setNewUsername] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const { token, setToken, isLoggedIn } = useAuth();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        // Redirect if not logged in
        if (!isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        if (!token) {
            setError("You are not logged in.");
            return;
        }

        try {
            const response = await axios.post(`${backendUrl}/change_username`, { newUsername }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Username changed successfully:', response.data);
            setToken(null); // Clear token to log out user
            onClose(); // Close the modal
            navigate('/'); // Redirect to login page
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError('Failed to change username');
            }
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setError('');
        setNewUsername('');
    };

    if (!isLoggedIn) {
        return null;  // Don't render if not logged in
    }

    return editing ? (
        <form onSubmit={handleSubmit}>
            <LoginContainer>
                <div style={{ position: 'relative' }}>
                    <FaTimes style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }} onClick={handleCancel}/>
                    <StyledLabel>New Username:</StyledLabel>
                    <LoginBarContainer>
                        <StyledInput
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                            required
                        />
                    </LoginBarContainer>
                </div>
            </LoginContainer>
            <ButtonContainer>
                <StyledButton type="submit" className='buttonStyle'>Change Username</StyledButton>
            </ButtonContainer>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    ) : (
        <StyledButton onClick={() => setEditing(true)}>Change Username</StyledButton>
    );
};
