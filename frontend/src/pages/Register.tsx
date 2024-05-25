import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../utils/Authentication.tsx";
import { useModals } from '../components/auth/ModalContext.tsx';
import { ModalContent, ModalOverlay } from "../containers/multiUse/StyledComponents.tsx";
import { MainContent } from "../containers/general/MainContent.tsx";
import { ButtonContainer, LoginBarContainer, LoginContainer, StyledInput, StyledLabel } from "./Login.tsx";

export const Register: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const { setToken } = useAuth();
    const { isRegisterOpen, setRegisterOpen } = useModals();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError('');

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch(`${backendUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to register');
            }
            setToken(data.access_token); // Use context to manage token
            setRegisterOpen(false);
            navigate('/dashboard');
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Could not register');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isRegisterOpen) return null;

    return (
        <MainContent>
            <ModalOverlay onClick={() => setRegisterOpen(false)}>
                <ModalContent onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleRegister}>
                        <LoginContainer>
                            <StyledLabel>Username:</StyledLabel>
                            <LoginBarContainer>
                                <StyledInput
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Username"
                                    required
                                />
                            </LoginBarContainer>
                            <StyledLabel>Password:</StyledLabel>
                            <LoginBarContainer>
                                <StyledInput
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Password"
                                    required
                                />
                            </LoginBarContainer>
                            <StyledLabel>Confirm Password:</StyledLabel>
                            <LoginBarContainer>
                                <StyledInput
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    required
                                />
                            </LoginBarContainer>
                        </LoginContainer>
                        <ButtonContainer>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </ButtonContainer>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </form>
                </ModalContent>
            </ModalOverlay>
        </MainContent>
    );
};
