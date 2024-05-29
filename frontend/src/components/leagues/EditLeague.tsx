import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useAuth } from '../../utils/Authentication.tsx';
import { MainContent } from '../../containers/general/MainContent.tsx';
import { ModalContent, ModalOverlay } from '../../containers/multiUse/StyledComponents.tsx';
import { LoginBarContainer, StyledInput } from "../../pages/Login.tsx";

const LeagueEditContainer = styled.div`
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

const StyledButton = styled.button<{ loading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px 15px;
  margin: 5px 0;
  font-weight: normal;
  font-size: 16px;
  background: ${({ loading }) => (loading ? '#888' : '#333')};
  color: #EAEAEA;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  width: calc(35%);
  cursor: ${({ loading }) => (loading ? 'not-allowed' : 'pointer')};

  &:hover {
    background: ${({ loading }) => (loading ? '#888' : '#444')};
  }

  &:active {
    background: ${({ loading }) => (loading ? '#888' : '#555')};
  }

  &:focus {
    outline: none;
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;

interface LeagueEditModalProps {
  leagueName: string;
  maxPlayers: number;
  password: string;
  onClose: () => void; // Function to close the modal
}

export const LeagueEditModal: React.FC<LeagueEditModalProps> = ({ leagueName, maxPlayers, password, onClose }) => {
  const [name, setName] = useState(leagueName);
  const [maxNumberOfPlayers, setMaxNumberOfPlayers] = useState(maxPlayers);
  const [leaguePassword, setLeaguePassword] = useState(password);
  const [confirmPassword, setConfirmPassword] = useState(password);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (leaguePassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const encodedLeagueName = encodeURIComponent(leagueName.trim());
      const response = await axios.put(`${backendUrl}/leagues/${encodedLeagueName}`, {
        name,
        max_players: maxNumberOfPlayers,
        password: leaguePassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        alert('League updated successfully!');
        window.location.reload(); // Refresh the page
      } else {
        throw new Error('Failed to update league');
      }
    } catch (error) {
      console.error('Error updating league:', error);
      setError('Error updating league');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContent>
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
            <LeagueEditContainer>
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
              <StyledLabel>Max Number of Players:</StyledLabel>
              <LoginBarContainer>
                <StyledInput
                  type="number"
                  value={maxNumberOfPlayers}
                  onChange={(e) => setMaxNumberOfPlayers(parseInt(e.target.value, 10))}
                  placeholder="Enter Max Number of Players"
                  required
                />
              </LoginBarContainer>
              <StyledLabel>Password:</StyledLabel>
              <LoginBarContainer>
                <StyledInput
                  type="password"
                  value={leaguePassword}
                  onChange={(e) => setLeaguePassword(e.target.value)}
                  placeholder="Enter Password"
                />
              </LoginBarContainer>
              <StyledLabel>Confirm Password:</StyledLabel>
              <LoginBarContainer>
                <StyledInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                />
              </LoginBarContainer>
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </LeagueEditContainer>
            <ButtonContainer>
              <StyledButton type="submit" loading={loading} disabled={loading}>
                {loading ? 'Loading...' : 'Save Changes'}
              </StyledButton>
            </ButtonContainer>
          </form>
        </ModalContent>
      </ModalOverlay>
    </MainContent>
  );
};
