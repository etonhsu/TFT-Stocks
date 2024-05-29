import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import {MainContent} from "../containers/general/MainContent.tsx";

const ResultsContainer = styled.div`
    padding: 20px;
    color: #EAEAEA;
`;

const ResultItem = styled.div`
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #EAEAEA;
    border-radius: 5px;
`;

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Player {
    gameName: string;
    tagLine: string;
}

export const SearchResults: React.FC = () => {
    const { searchQuery } = useParams<{ searchQuery: string }>();
    const [results, setResults] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery) return;

            try {
                const response = await fetch(`${backendUrl}/search/players/${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                if (response.ok) {
                    setResults(data);
                } else {
                    throw new Error(data.detail || 'Failed to fetch search results');
                }
            } catch (error) {
                setError('Failed to load search results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchQuery]);

    if (loading) {
        return <ResultsContainer>Loading...</ResultsContainer>;
    }

    if (error) {
        return <ResultsContainer>Error: {error}</ResultsContainer>;
    }

    if (results.length === 0) {
        return <ResultsContainer>No results found.</ResultsContainer>;
    }

    return (
        <MainContent>
            <ResultsContainer>
                <h1>Search Results</h1>
                {results.map((player, index) => (
                    <ResultItem key={index}>
                        <Link to={`/players/${player.gameName}/${player.tagLine}`}>
                            {player.gameName} ({player.tagLine})
                        </Link>
                    </ResultItem>
                ))}
            </ResultsContainer>
        </MainContent>
    );
};
