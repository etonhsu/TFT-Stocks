import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainContent } from '../containers/general/MainContent.tsx';
import { useAuth } from '../utils/Authentication.tsx';
import { useModals } from '../components/auth/ModalContext.tsx';
import styled from 'styled-components';
import { ModalContent, ModalOverlay } from '../containers/multiUse/StyledComponents.tsx';

export const LoginBarContainer = styled.div`
  background: #333;
  border-radius: 20px;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 5px 15px;
  height: 40px;
  width: 350px;
  margin-top: 10px;
`;

export const StyledInput = styled.input`
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

export const StyledLabel = styled.label`
  font-size: 18px;
  color: #EAEAEA;
`;

export const LoginContainer = styled.div`
  padding: 25px;
  margin-left: 40px;
`;

export const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

export function Login() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { setToken } = useAuth();
  const { isLoginOpen, setLoginOpen } = useModals();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setLoginOpen(false);
        navigate('/dashboard');
      } else {
        throw new Error('Failed to log in');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoginOpen) return null;

  return (
    <MainContent>
      <ModalOverlay onClick={() => setLoginOpen(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
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
            </LoginContainer>
            <ButtonContainer>
              <button type="submit" disabled={loading} className="buttonStyle">
                {loading ? 'Logging In...' : 'Login'}
              </button>
            </ButtonContainer>
          </form>
        </ModalContent>
      </ModalOverlay>
    </MainContent>
  );
}
