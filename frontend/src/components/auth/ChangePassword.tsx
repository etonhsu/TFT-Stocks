import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from "../../utils/Authentication.tsx";
import styled from "styled-components";

interface ChangePasswordProps {
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
    justify-content: flex-start;
    
`;

const StyledButton = styled.button`
    display: flex;
    justify-content: center; // Centering text since no icon is involved
    padding: 13px 15px;
    margin: 5px 0;
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

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose }) => {
    const [editing, setEditing] = useState<boolean>(false);
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>(''); // State for confirming new password
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const { token, setToken, isLoggedIn } = useAuth();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        if (!token) {
            setError("You are not logged in.");
            return;
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            const response = await axios.post(`${backendUrl}/change_password`, {
                oldPassword,
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Password changed successfully:', response.data);
            setToken(null); // Clear token to log out user
            navigate('/'); // Redirect to login page
            onClose(); // Close the modal
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError('Failed to change password: ');
            }
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setError('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    if (!isLoggedIn) {
        return null;  // Don't render if not logged in
    }

    return editing ? (
        <form onSubmit={handleSubmit}>
            <LoginContainer>
                <div style={{ position: 'relative' }}>
                    <FaTimes style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }} onClick={handleCancel}/>
                    <StyledLabel>Old Password:</StyledLabel>
                    <LoginBarContainer>
                        <StyledInput
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter old password"
                            required
                        />
                    </LoginBarContainer>
                    <StyledLabel>New Password:</StyledLabel>
                    <LoginBarContainer>
                        <StyledInput
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                        />
                    </LoginBarContainer>
                    <StyledLabel>Confirm New Password:</StyledLabel>
                    <LoginBarContainer>
                        <StyledInput
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                    </LoginBarContainer>
                </div>
            </LoginContainer>
            <ButtonContainer>
                <StyledButton type="submit" className='buttonStyle'>Change Password</StyledButton>
            </ButtonContainer>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    ) : (
        <StyledButton onClick={() => setEditing(true)}>Change Password</StyledButton>
    );
};
