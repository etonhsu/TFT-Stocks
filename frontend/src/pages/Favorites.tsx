import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { StyledCell, StyledHeader, StyledRow, StyledTable } from "../containers/multiUse/TableStyle";
import { formatCurrency } from "../utils/CurrencyFormatter";
import { MainContent } from "../containers/general/MainContent";
import { StyledPlayerLink } from "../containers/multiUse/LinkStyle";
import styled from "styled-components";
import { useAuth } from "../utils/Authentication";

interface FavoriteData {
    name: string;
    tag_line: string;
    current_price: number;
    eight_hour_change: number;
    one_day_change: number;
    three_day_change: number;
}

const FavoritesContainer = styled.div`
    position: relative; // This will allow you to absolutely position the label
    margin-left: 3%;
    margin-right: 5%;
    flex: 1;  // Takes up all available space
`;

export const Favorites: React.FC = () => {
    const [favoritesSummary, setFavoritesSummary] = useState<FavoriteData[]>([]);
    const [isLoading, setLoading] = useState(true);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${backendUrl}/favorites`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFavoritesSummary(response.data.favorites);  // Assuming response.data.favorites is the correct path
            } catch (error) {
                navigate('/');
                console.error('Error fetching data:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [backendUrl, navigate, token]);

    if (isLoading) {
        return (
            <MainContent className="mainContentContainer">
                Loading...
            </MainContent>
        );
    }

    if (!favoritesSummary || favoritesSummary.length === 0) {
        return (
            <MainContent className="mainContentContainer">
                No data available.
            </MainContent>
        );
    }

    return (
        <MainContent>
            <h1>Favorites</h1>
            <FavoritesContainer>
                <StyledTable>
                    <thead>
                        <tr>
                            <StyledHeader>Name</StyledHeader>
                            <StyledHeader>Current Price</StyledHeader>
                            <StyledHeader>8-Hour Change</StyledHeader>
                            <StyledHeader>1-Day Change</StyledHeader>
                            <StyledHeader>3-Day Change</StyledHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {favoritesSummary.map((favorite, index) => (
                            <StyledRow key={index}>
                                <StyledCell>
                                    <StyledPlayerLink gameName={favorite.name} tagLine={favorite.tag_line} />
                                </StyledCell>
                                <StyledCell>{formatCurrency(favorite.current_price, 2)}</StyledCell>
                                <StyledCell>{formatCurrency(favorite.eight_hour_change, 1)}</StyledCell>
                                <StyledCell>{formatCurrency(favorite.one_day_change, 1)}</StyledCell>
                                <StyledCell>{formatCurrency(favorite.three_day_change, 1)}</StyledCell>
                            </StyledRow>
                        ))}
                    </tbody>
                </StyledTable>
            </FavoritesContainer>
        </MainContent>
    );
};
