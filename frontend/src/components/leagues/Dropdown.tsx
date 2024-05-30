import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../utils/Authentication';
import { FaSortDown } from 'react-icons/fa';

interface LeagueDropdownProps {
    currentLeagueId: number;
    setCurrentLeagueId: React.Dispatch<React.SetStateAction<number>>;
}

interface LeagueDropdownItem {
    name: string;
    current_value: number;
    rank: number;
    league_id: number;
}

const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

const DropdownButton = styled.button`
    background-color: #444;
    color: #EAEAEA;
    padding: 13px;
    font-size: 16px;
    border: none;
    cursor: pointer;
    font-weight: normal;
    width: auto;
    max-width: 100%;
    margin-left: 35px;
    margin-top: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const DropdownContent = styled.div<{ show: boolean }>`
    display: ${({ show }) => (show ? 'block' : 'none')};
    position: absolute;
    background-color: #666;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    width: auto;
    margin-left: 35px;
`;

const DropdownItem = styled.a`
    color: #EAEAEA;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    font-weight: normal;

    &:hover {
        color: cornflowerblue;
        cursor: pointer;
    }
`;

const ArrowIcon = styled(FaSortDown)`
    margin-left: 18px;
`;

export const LeagueDropdown: React.FC<LeagueDropdownProps> = ({ currentLeagueId, setCurrentLeagueId }) => {
    const [leagues, setLeagues] = useState<LeagueDropdownItem[]>([]);
    const [currentLeague, setCurrentLeague] = useState<LeagueDropdownItem | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const { token } = useAuth();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserLeagues = async () => {
            try {
                const response = await axios.get<LeagueDropdownItem[]>(`${backendUrl}/user_leagues`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userLeagues = response.data;
                setLeagues(userLeagues);
                const currentLeagueResponse = await axios.get<{ current_league_id: number }>(`${backendUrl}/league_current`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const current = userLeagues.find(league => league.league_id === currentLeagueResponse.data.current_league_id) || userLeagues[0] || null;
                setCurrentLeague(current);
                setCurrentLeagueId(current?.league_id || 0);
            } catch (error) {
                console.error('Error fetching user leagues:', error);
            }
        };

        fetchUserLeagues();
    }, [backendUrl, token, currentLeagueId, setCurrentLeagueId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLeagueChange = async (leagueId: number) => {
        try {
            setCurrentLeague(null);
            setShowDropdown(false);
            await axios.put(`${backendUrl}/users/current_league`, { current_league_id: leagueId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCurrentLeagueId(leagueId);
            const selectedLeague = leagues.find(league => league.league_id === leagueId) || null;
            setCurrentLeague(selectedLeague);
            window.location.reload(); // Refresh the page after changing the league
        } catch (error) {
            console.error('Error updating current league:', error);
        }
    };

    const formatCurrencyManually = (value: number): string => {
        return `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    };

    const filteredLeagues = leagues.filter(league => league.league_id !== currentLeague?.league_id);

    return (
        <DropdownContainer ref={dropdownRef}>
            <DropdownButton onClick={() => setShowDropdown(prev => !prev)}>
                {currentLeague
                    ? `${currentLeague.name} | ${formatCurrencyManually(currentLeague.current_value)} | Rank ${currentLeague.rank || 'N/A'}`
                    : 'Loading...'}
                <ArrowIcon />
            </DropdownButton>
            <DropdownContent show={showDropdown}>
                {filteredLeagues.map(league => (
                    <DropdownItem key={league.league_id} onClick={() => handleLeagueChange(league.league_id)}>
                        {league.name} | {formatCurrencyManually(league.current_value)} | Rank {league.rank || 'N/A'}
                    </DropdownItem>
                ))}
            </DropdownContent>
        </DropdownContainer>
    );
};
