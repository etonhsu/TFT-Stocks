import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { MainContent } from '../containers/general/MainContent';
import { StyledTable, StyledRow, StyledHeader, StyledCell } from "../containers/multiUse/TableStyle";
import { useAuth } from '../utils/Authentication';
import { LeagueEditModal } from '../components/leagues/EditLeague.tsx';
import { CreateLeagueModal } from '../components/leagues/CreateLeague.tsx';
import { JoinLeagueModal } from '../components/leagues/JoinLeague.tsx';
import { useModals } from '../components/auth/ModalContext.tsx';

interface LeagueOverview {
  name: string;
  start_date: string;
  end_date: string;
  player_count: number;
  max_players: number | null;
  password: string | null;
  is_creator: boolean; // Add is_creator field
}

const LeagueContainer = styled.div`
  position: relative; // This will allow you to absolutely position the label
  margin-left: 3%;
  margin-right: 5%;
  flex: 1;  // Takes up all available space
`;

const ButtonContainer = styled.div`
  position: relative; // This will allow you to absolutely position the label
  margin-top: 20px;
  flex: 1;  // Takes up all available space
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  width: 75%;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: flex-start; /* Vertically center the children */
  justify-content: flex-start; /* Aligns children (icon and text) to the start of the container */
  font-weight: normal;
  background-color: #222;
  padding-left: 3px;
  padding-right: 3px;
`;

const StyledButton2 = styled.button`
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
    width: 45%; // Adjusted to fit within the ButtonContainer
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

const ErrorMessage = styled.p`
  color: red;
`;

export const Leagues: React.FC = () => {
  const [leagues, setLeagues] = useState<LeagueOverview[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { token } = useAuth(); // Access the token from the context
  const { isLeagueEditOpen, isCreateLeagueOpen, isJoinLeagueOpen, setLeagueEditOpen, setCreateLeagueOpen, setJoinLeagueOpen } = useModals(); // Use the modal context
  const [selectedLeague, setSelectedLeague] = useState<LeagueOverview | null>(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await axios.get(`${backendUrl}/leagues`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          throw new Error('Failed to fetch leagues');
        }

        const data = response.data;
        setLeagues(data);
      } catch (error) {
        setError('Error: Failed to fetch leagues');
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [backendUrl, navigate, token]);

  if (isLoading) {
    return (<MainContent className="mainContentContainer">Loading...</MainContent>);
  }

  if (error) {
    return <MainContent><ErrorMessage>{error}</ErrorMessage></MainContent>;
  }

  const handleEditClick = (league: LeagueOverview) => {
    setSelectedLeague(league);
    setLeagueEditOpen(true);
  };

  const handleClose = () => {
    setSelectedLeague(null);
    setLeagueEditOpen(false);
    setCreateLeagueOpen(false);
    setJoinLeagueOpen(false);
  };

  const handleCreateLeague = () => {
    setCreateLeagueOpen(true);
  };

  const handleJoinLeague = () => {
    setJoinLeagueOpen(true);
  };

  return (
    <MainContent>
      <h1>Leagues Overview</h1>
      <LeagueContainer>
        <StyledTable>
          <thead>
            <tr>
              <StyledHeader>Name</StyledHeader>
              <StyledHeader>Start Date</StyledHeader>
              <StyledHeader>End Date</StyledHeader>
              <StyledHeader>Player Count</StyledHeader>
              <StyledHeader>Owner</StyledHeader> {/* Add Owner header */}
            </tr>
          </thead>
          <tbody>
            {leagues.map((league) => (
              <StyledRow key={league.name}>
                <StyledCell>{league.name}</StyledCell>
                <StyledCell>{new Date(league.start_date).toLocaleDateString()}</StyledCell>
                <StyledCell>{new Date(league.end_date).toLocaleDateString()}</StyledCell>
                <StyledCell>{league.player_count}</StyledCell>
                <StyledCell>
                  {league.is_creator ? (
                    <StyledButton onClick={() => handleEditClick(league)}>Yes/ Edit</StyledButton>
                  ) : (
                    'No'
                  )}
                </StyledCell>
              </StyledRow>
            ))}
          </tbody>
        </StyledTable>
        <ButtonContainer>
          <StyledButton2 onClick={handleJoinLeague}>Join League</StyledButton2>
          <StyledButton2 onClick={handleCreateLeague}>Create League</StyledButton2>
        </ButtonContainer>
      </LeagueContainer>
      {selectedLeague && isLeagueEditOpen && (
        <LeagueEditModal
          leagueName={selectedLeague.name}
          maxPlayers={selectedLeague.max_players ?? selectedLeague.player_count} // Provide default value if null
          password={selectedLeague.password ?? ''} // Provide default value if null
          onClose={handleClose} // Function to close the modal
        />
      )}
      {isCreateLeagueOpen && <CreateLeagueModal onClose={handleClose} />}
      {isJoinLeagueOpen && <JoinLeagueModal onClose={handleClose} />}
    </MainContent>
  );
};
