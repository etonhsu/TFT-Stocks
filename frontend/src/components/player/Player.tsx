import React from 'react';

// Define the interface for the component props
interface PlayerProps {
    name: string;
    shares: number;
    price: number;
}

export const Player: React.FC<PlayerProps> = ({ name, shares, price }) => {
    if (!name) {
        console.error('Invalid props:', { name, shares, price });
        return <p>Error: Data for player is incomplete or still loading...</p>;
    }

    const totalValue = shares * price; // Calculate the total value here since it's not passed

    return (
        <div>
            <h3>{name}</h3>
            <p>Shares: {shares}</p>
            <p>Price per Share: ${price.toFixed(2)}</p>
            <p>Total Value: ${totalValue.toFixed(2)}</p>
        </div>
    );
};
