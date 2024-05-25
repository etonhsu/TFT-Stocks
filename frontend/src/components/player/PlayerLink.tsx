import React from 'react';
import { Link } from 'react-router-dom';

// Define an interface for the component's props
interface PlayerLinkProps {
    gameName: string;
    tagLine: string;  // Add tagLine to the props
    className?: string;  // Optional className prop for styling
}

export const PlayerLink: React.FC<PlayerLinkProps> = ({ gameName, tagLine, className }) => (
    <Link to={`/players/${gameName}/${tagLine}`} className={className}>
        {gameName}
    </Link>
);
