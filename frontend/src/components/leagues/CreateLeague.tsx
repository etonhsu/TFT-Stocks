import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useAuth } from '../../utils/Authentication.tsx';
import { useModals } from '../auth/ModalContext.tsx';
import { MainContent } from '../../containers/general/MainContent.tsx';
import { ModalContent, ModalOverlay } from '../../containers/multiUse/StyledComponents.tsx';
import { LoginBarContainer, StyledInput } from "../../pages/Login.tsx";

const LeagueCreateContainer = styled.div`
  padding: 25px;
  margin-left: 40px;
`;

const StyledLabel = styled.label`
  font-size: 18px;
  color: #EAEAEA;
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

const Dropdown = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  background-color: #333;
  color: #EAEAEA;
  border: none;
  font-family: 'Sen', sans-serif;
  &:focus {
    outline: none;
  }
`;

const DropdownOption = styled.option`
  background-color: #333;
  color: #EAEAEA;
`;

interface CreateLeagueModalProps {
  onClose: () => void;
}

export const CreateLeagueModal: React.FC<CreateLeagueModalProps> = ({ onClose }) => {
  const [name, setName] = useState<string>('');
  const [length, setLength] = useState<string>('14'); // Default to 2 weeks
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { isCreateLeagueOpen, setCreateLeagueOpen } = useModals();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    const leagueLength = parseInt(length, 10);

    try {
      const response = await axios.post(`${backendUrl}/create_league`, {
        name,
        length: leagueLength,
        max_players: maxPlayers,
        password: password || null, // Set to null if blank
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        alert('League created successfully!');
        setCreateLeagueOpen(false);
        onClose();
      } else {
        throw new Error('Failed to create league');
      }
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Error creating league');
    }
  };

  if (!isCreateLeagueOpen) return null;

  return (
    <MainContent>
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
            <LeagueCreateContainer>
              <StyledLabel>League Name:</StyledLabel>
              <LoginBarContainer>
                <StyledInput
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter League Name"
                  required
                />
              </LoginBarContainer>
              <StyledLabel>League Length:</StyledLabel>
              <LoginBarContainer>
                <Dropdown value={length} onChange={(e) => setLength(e.target.value)}>
                  <DropdownOption value="14">2 Weeks</DropdownOption>
                  <DropdownOption value="30">1 Month</DropdownOption>
                  <DropdownOption value="60">2 Months</DropdownOption>
                  <DropdownOption value="custom">Set End Date</DropdownOption>
                </Dropdown>
              </LoginBarContainer>
              <StyledLabel>Max Number of Players:</StyledLabel>
              <LoginBarContainer>
                <StyledInput
                  type="number"
                  value={maxPlayers ?? ''}
                  onChange={(e) => setMaxPlayers(e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder="Enter Max Number of Players"
                />
              </LoginBarContainer>
              <StyledLabel>Password:</StyledLabel>
              <LoginBarContainer>
                <StyledInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password (Optional)"
                />
              </LoginBarContainer>
              <StyledLabel>Confirm Password:</StyledLabel>
              <LoginBarContainer>
                <StyledInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password (Optional)"
                />
              </LoginBarContainer>
            </LeagueCreateContainer>
            <ButtonContainer>
              <StyledButton type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Create League'}
              </StyledButton>
            </ButtonContainer>
          </form>
        </ModalContent>
      </ModalOverlay>
    </MainContent>
  );
};
