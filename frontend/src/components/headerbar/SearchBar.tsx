import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SearchBarContainer = styled.div`
    background: #222; // Dark background color
    border-radius: 20px; // Rounded corners
    display: flex;
    align-items: center;
    padding: 5px 15px;
    margin-left: 10px;
    height: 40px;
    width: 350px; 
    
`;

const SearchSelect = styled.select`
    border: none;
    background: transparent;
    color: #EAEAEA;
    font-family: 'Sen', sans-serif;
    margin-right: 10px;
    &:focus {
        outline: none;
    }
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    color: #EAEAEA;
    font-family: 'Sen', sans-serif;
    &:focus {
        outline: none;
    }
`;


export const SearchBar: React.FC = () => {
    const [searchType, setSearchType] = useState<string>('players');
    const [query, setQuery] = useState<string>('');
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const searchQuery = query.trim().toLowerCase(); // Trim and convert to lowercase
        const url = `${backendUrl}/search/${searchType}/${encodeURIComponent(searchQuery)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No matching data found.');
                }
                return response.json();
            })
            .then(data => {
                // Assuming data has properties like gameName or username based on searchType
                const redirectPath = searchType === 'players' ? `/players/${data.gameName}` : `/users/${data.username}`;
                navigate(redirectPath);
                setQuery('');
            })
            .catch(error => {
                console.error('Search error:', error);
                alert(error.message);
            });
    };


    return (
        <SearchBarContainer>
            <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
                <SearchSelect value={searchType} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSearchType(e.target.value)}>
                    <option value="players">Players</option>
                    <option value="users">Users</option>
                </SearchSelect>
                <SearchInput
                    type="text"
                    value={query}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    placeholder="Search"
                />
            </form>
        </SearchBarContainer>
    );
};
