// components/leagues/JoinLeague.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { MainContent } from '../../containers/general/MainContent';
import { ModalContent, ModalOverlay } from '../../containers/multiUse/StyledComponents';
import { useAuth } from '../../utils/Authentication';

const JoinLeagueContainer = styled.div`
  padding: 25px;
  margin-left: 40px;
`;

const StyledLabel = styled.label`
  font-size: 18px;
  color: #EAEAEA;
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

const LoginBarContainer = styled.div`
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

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const StyledButton = styled.button`
    display: flex;
    justify-content: center; // Centering text since no icon is involved
    padding: 13px 15px;
    margin: 0 0 15px;
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

interface JoinLeagueModalProps {
  onClose: () => void;
}

export const JoinLeagueModal: React.FC<JoinLeagueModalProps> = ({ onClose }) => {
  const [leagueName, setLeagueName] = useState('');
  const [password, setPassword] = useState('');
  const { token } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleJoinLeague = async () => {
    try {
      const response = await fetch(`${backendUrl}/join_league`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: leagueName, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to join league');
      }

      alert('League joined successfully!');
      onClose();
    } catch (error) {
      console.error('Error joining league:', error);
      alert('Error joining league');
    }
  };

  return (
    <MainContent>
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <JoinLeagueContainer>
            <StyledLabel>League Name:</StyledLabel>
            <LoginBarContainer>
              <StyledInput
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="Enter League Name"
                required
              />
            </LoginBarContainer>
            <StyledLabel>Password:</StyledLabel>
            <LoginBarContainer>
              <StyledInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password (if required)"
              />
            </LoginBarContainer>
            <ButtonContainer>
              <StyledButton onClick={handleJoinLeague}>Join League</StyledButton>
            </ButtonContainer>
          </JoinLeagueContainer>
        </ModalContent>
      </ModalOverlay>
    </MainContent>
  );
};
