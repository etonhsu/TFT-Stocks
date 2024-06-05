import { useState, useEffect } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { TransactionComponent } from '../components/transactions/TransactionComponent';
import { PlayerChart } from '../components/player/PlayerChart';
import { MainContent } from "../containers/general/MainContent";
import {
    DetailsAndTransactionColumn,
    FavoritesIconContainer,
    PlayerDetailsContainer,
    PlayerInfoContainer,
    PlayerNameContainer
} from "../containers/player/PlayerInfoContainer";
import { TransactionContainer } from "../containers/player/TransactionContainer";
import { formatCurrency } from "../utils/CurrencyFormatter";
import { FavoriteIcon } from "../components/player/FavoritesIcon";
import { formatDate } from "../utils/DateFormatter";
import styled from "styled-components";

export interface PlayerData {
    name: string;
    tagLine: string;
    price: number[];
    date: string[];
    date_updated: Date;
    '8 Hour Change': number;
    '24 Hour Change': number;
    '3 Day Change': number;
    delist_date?: string;  // Optional delist_date
}

const DelistText = styled.div`
    margin-top: 53px;
    margin-left: 15px;
`;

const StyledLink = styled.a`
    text-decoration: none;
    color: #EAEAEA;
    font-weight: bold;
    padding: 8px;
    margin-top: 45px;
    margin-left: 15px;
    border-radius: 4px;
    background-color: #444;

    &:hover {
        color: cornflowerblue;
    }
`;

const ExternalLink = () => {
    return (
        <StyledLink href="http://tactics.tools" target="_blank" rel="noopener noreferrer">
            Visit Tactics Tools
        </StyledLink>
    );
};

export default ExternalLink;

export function PlayerInfo() {
    const { gameName, tagLine } = useParams<{ gameName?: string; tagLine?: string }>();
    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (gameName && tagLine) {
            fetchPlayerData(gameName, tagLine);
        }
    }, [gameName, tagLine]);

    const fetchPlayerData = async (gameName: string, tagLine: string) => {
        console.log(`Fetching player data for ${gameName} with tagLine ${tagLine}`);
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${backendUrl}/players/${gameName}/${tagLine}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error fetching player data');
            }
            const data = await response.json();
            setPlayerData(data);
        } catch (err) {
            console.error('Error fetching player data:', err);
            setError('Failed to load player data');
            setLoading(false);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const encodedGameName = encodeURIComponent(gameName || '');
    const encodedTagLine = encodeURIComponent(tagLine || '');
    const url = `http://tactics.tools/player/na/${encodedGameName}/${encodedTagLine}`;

    const handleUserDataUpdate = () => {
        if (gameName && tagLine) {
            fetchPlayerData(gameName, tagLine);
        }
    };

    if (loading) {
        return (<MainContent className="mainContentContainer">Loading...</MainContent>);
    }
    if (error) {
        return (<MainContent className="mainContentContainer">Error: No data available.</MainContent>);
    }
    if (!playerData) {
        return <MainContent className="mainContentContainer">No data available.</MainContent>;
    }

    return (
        <MainContent>
            <PlayerNameContainer>
                <h1>{playerData.name}</h1>
                <FavoritesIconContainer>
                    <FavoriteIcon gameName={gameName!} tagLine={tagLine!} />
                </FavoritesIconContainer>
                <StyledLink href={url} target="_blank" rel="noopener noreferrer">
                    tactics.tools
                </StyledLink>
                {playerData.delist_date && (
                    <DelistText>
                        Delisted on {formatDate(new Date(playerData.delist_date))}
                    </DelistText>
                )}
            </PlayerNameContainer>
            <PlayerInfoContainer>
                <DetailsAndTransactionColumn>
                    <PlayerDetailsContainer label="Overview">
                        <p>Current Price: {playerData.price?.length ? formatCurrency(playerData.price[playerData.price.length - 1], 2) : 'N/A'}</p>
                        <p>Updated: {playerData.date_updated ? formatDate(playerData.date_updated) : 'N/A'}</p>
                        <p>8 Hour Change: {playerData['8 Hour Change'] !== undefined ? formatCurrency(playerData['8 Hour Change'], 1) : 'N/A'}</p>
                        <p>24 Hour Change: {playerData['24 Hour Change'] !== undefined ? formatCurrency(playerData['24 Hour Change'], 1) : 'N/A'}</p>
                        <p>3 Day Change: {playerData['3 Day Change'] !== undefined ? formatCurrency(playerData['3 Day Change'], 1) : 'N/A'}</p>
                    </PlayerDetailsContainer>
                    <TransactionContainer label={"Transaction"}>
                        {gameName && tagLine && (
                            <TransactionComponent gameName={gameName!} tagLine={tagLine!} updateUserData={handleUserDataUpdate} />
                        )}
                    </TransactionContainer>
                </DetailsAndTransactionColumn>
                <PlayerChart playerData={playerData} />
            </PlayerInfoContainer>
        </MainContent>
    );
}
