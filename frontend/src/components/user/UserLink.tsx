import React from 'react';
import { Link } from 'react-router-dom';

// Define the structure for the component's props
interface UserLinkProps {
    gameName: string;  // Ensuring gameName is always a string
    className?: string;
}

export const UserLink: React.FC<UserLinkProps> = ({ gameName, className }) => (
    <Link to={`/users/${gameName}`} className={className}>
        {gameName}
    </Link>
);

