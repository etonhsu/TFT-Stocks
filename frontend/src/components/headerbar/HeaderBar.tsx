// src/containers/general/HeaderBar.tsx
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar.tsx';
import { LeagueDropdown } from '../leagues/Dropdown.tsx';
import { StyledButton } from '../../pages/LeaderboardPage';
import { ButtonWithModal } from './NotificationButton.tsx';
import { useAuth } from '../../utils/Authentication.tsx';

const HeaderBarContainer = styled.header`
    width: 100%;
    height: 9%; /* Example height */
    background-color: #333; /* Example background color */
    margin-left: 9%;
    padding-left: 130px;
    color: #EAEAEA;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed; /* Fix it to the top */
    top: 0; /* No space from the top */
    border-bottom: 1px solid #444;
    z-index: 90; /* Ensure it's above other content */
`;

const HeaderRight = styled.div`
    display: flex;
    margin-right: 18vw;
`;

const HeaderLeft = styled.div`
    display: flex;
`;

export const HeaderBar: React.FC<{ currentLeagueId: number, setCurrentLeagueId: React.Dispatch<React.SetStateAction<number>> }> = ({ currentLeagueId, setCurrentLeagueId }) => {
    const { token } = useAuth();

    return (
        <HeaderBarContainer>
            <HeaderLeft>
                <SearchBar />
                {token && (
                    <LeagueDropdown currentLeagueId={currentLeagueId} setCurrentLeagueId={setCurrentLeagueId} />
                )}
            </HeaderLeft>
            <HeaderRight style={{ marginLeft: '0px' }}>
                <Link to="/faq">
                    <StyledButton>FAQ</StyledButton>
                </Link>
                <ButtonWithModal />
            </HeaderRight>
        </HeaderBarContainer>
    );
};
