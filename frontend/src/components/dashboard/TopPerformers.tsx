import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import {PlayerLink} from "../player/PlayerLink.tsx";
import {formatCurrency} from "../../utils/CurrencyFormatter.tsx";
import {UserLink} from "../user/UserLink.tsx";
import {useAuth} from "../../utils/Authentication.tsx";

interface LeaderboardEntry {
    name: string;
    tagLine: string;
    value: number;
}

interface TopLeaderboard {
    price: LeaderboardEntry;
    delta_8h: LeaderboardEntry;
    delta_24h: LeaderboardEntry;
    delta_72h: LeaderboardEntry;
    portfolio_value: LeaderboardEntry;
}

const PerformersContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    width: 100%;  // Ensures the container takes full width
`;

const TransitionContainer = styled.div`
    width: 100%;
    min-height: 100px;
    position: relative;
`;

const PerformersDetails = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
`;

const LinkContainer = styled.div`
    width: 100%;
    text-align: center;  // Center aligns this container
    margin: 0;
`;

const StyledPlayerLink = styled(PlayerLink)`
    color: cornflowerblue; // Example color
    font-size: 36px;
    font-weight: bold;
    text-decoration: none;

    &:hover {
        color: #646cff; // Change color on hover
    }
`;

const StyledUserLink = styled(UserLink)`
    color: cornflowerblue; // Example color
    font-size: 36px;
    font-weight: bold;
    text-decoration: none;

    &:hover {
        color: #646cff; // Change color on hover
    }
`;

const PriceLabel = styled.p`
    width: 100%;
    text-align: center; 
    font-size: 14px;
    color: #EAEAEA;
    margin: 0
`;

const PriceContainer = styled.p`
    width: 100%;
    text-align: center; 
    font-size: 30px;
    font-weight: bold;
    margin: 0;  // Removes margin to ensure vertical alignment
`;

const ButtonContainer = styled.div`
    margin-right: 20px;
    display: flex;
    justify-content: space-around; // This will space out buttons if needed
    width: 100%; // Ensures buttons can be aligned to the edges if necessary
`;

const StyledButton = styled.button`
  background-color: #222;
  color: #EAEAEA;
  font-size: 16px;
    font-weight: bolder;
    width: 30px;
    height: 18px;


  &:hover {
      color: #999;
      border-color: #222
  }
`;

export const TopPerformers: React.FC = () => {
    const [leaderboardData, setLeaderboardData] = useState<TopLeaderboard | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [currentType, setCurrentType] = useState('price');
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            // if (!token) {
            //     navigate('/login');
            //     return;
            // }
            try {
                const response = await axios.get(`${backendUrl}/top_leaderboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeaderboardData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
                setLoading(false);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    navigate('/login');
                }
            }
        };
        fetchData();
    }, [backendUrl, navigate, token]);

    const types = ['price', 'delta_8h', 'delta_24h', 'delta_72h', 'portfolio_value'];
    const currentIndex = types.indexOf(currentType);
    const showNext = () => {
        setCurrentType(types[(currentIndex + 1) % types.length]);
    };
    const showPrev = () => {
        setCurrentType(types[(currentIndex - 1 + types.length) % types.length]);
    };

    if (isLoading) {
        return <PerformersContainer>Loading...</PerformersContainer>;
    }

    if (!leaderboardData) {
        return <PerformersContainer>Error: No leaderboard data available.</PerformersContainer>;
    }

    const currentData = leaderboardData[currentType as keyof TopLeaderboard];


    let currencyType = 0
    const displayType = (() => {
        switch(currentType) {
            case 'price':
                currencyType = 2;
                return 'Price';
            case 'delta_8h':
                currencyType = 1;
                return '8-Hour Change';
            case 'delta_24h':
                currencyType = 1;
                return '1-Day Change';
            case 'delta_72h':
                currencyType = 1;
                return '3-Day Change';
            case 'portfolio_value':
                currencyType = 2;
                return 'Portfolio Value';
            default:
                return '';
        }
    })();

    return (
        <PerformersContainer>
            <TransitionContainer>
                <TransitionGroup>
                    <CSSTransition
                        key={currentType}
                        timeout={500}
                        classNames={{
                            enter: 'fade-enter',
                            enterActive: 'fade-enter-active',
                            exit: 'fade-exit',
                            exitActive: 'fade-exit-active'
                        }}
                    >
                        <PerformersDetails>
                            <LinkContainer>
                                {currentType === 'portfolio_value' ? (
                                    <StyledUserLink gameName={currentData.name}/>
                                ) : (
                                    <StyledPlayerLink gameName={currentData.name} tagLine={currentData.tagLine}/>
                                )}
                            </LinkContainer>
                            <PriceLabel>{displayType}:</PriceLabel>
                            <PriceContainer>{formatCurrency(currentData.value, currencyType)}</PriceContainer>
                        </PerformersDetails>
                    </CSSTransition>
                </TransitionGroup>
            </TransitionContainer>
            <ButtonContainer>
                <StyledButton onClick={showPrev}>&lt;&lt;</StyledButton>
                <StyledButton onClick={showNext}>&gt;&gt;</StyledButton>
            </ButtonContainer>
        </PerformersContainer>
    );
};

