import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/Authentication.tsx';
import { ClickedFavoritesIcon, FavoritesIcon } from "../../assets/Icons.tsx";
import styled from "styled-components";

export const FavoriteButton = styled.button`
    background-color: #222;
    padding: 0;
    border: none;  // Ensure there's no border by default

    &:hover {
        border: none;  // Explicitly remove border on hover
    }
`;

export const FavoriteIcon: React.FC<{ gameName?: string; tagLine?: string }> = ({ gameName, tagLine }) => {
  const [isFavorited, setIsFavorited] = useState<boolean | null>(null);
  const { token } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    async function fetchFavoriteStatus() {
      if (!gameName || !tagLine || !token) {
        setIsFavorited(null);  // Indicates an indeterminate state, not necessarily false.
        return;
      }
      try {
        const response = await axios.get(`${backendUrl}/favorite_status/${gameName}/${tagLine}`, {
          headers: {
            Authorization: `Bearer ${token}` // Use the token for authorization
          }
        });
        setIsFavorited(response.data);
      } catch (error) {
        console.error("Error fetching favorite status:", error);
        setIsFavorited(null);  // Maintain an indeterminate state on error.
      }
    }

    fetchFavoriteStatus();
  }, [backendUrl, gameName, tagLine, token]);  // Dependency array ensures re-fetching on gameName, tagLine, or token change.

  const toggleFavorite = async () => {
    if (isFavorited === null || !token) return;
    try {
      const response = await axios.post<boolean>(
        `${backendUrl}/toggle_favorites`,
        { gameName, tagLine },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorited(response.data);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Optional: handle null state visually
  if (isFavorited === null) {
    return <FavoriteButton disabled>Loading...</FavoriteButton>;
  }

  return (
    <FavoriteButton onClick={toggleFavorite}>
      {isFavorited ? <ClickedFavoritesIcon /> : <FavoritesIcon />}
    </FavoriteButton>
  );
};
