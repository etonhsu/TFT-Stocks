import React from 'react';
import {FAQComponent} from '../components/headerbar/FAQComponent.tsx';
import {MainContent} from "../containers/general/MainContent.tsx";
import styled from "styled-components";
import {
    CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis
} from '../../node_modules/recharts';

interface DataPoint {
    lp: number;
    currentPrice: number;
    newPrice: number;
}

const FAQContainer = styled.div`
    padding-top: 0;
    padding-left: 80px;
    padding-right: 80px;
`;

const PriceChart = () => {
    // Example data
    const data: DataPoint[] =
        [
            {'lp': 0, 'currentPrice': 0.0, 'newPrice': 0.0}, {'lp': 100, 'currentPrice': 61.56, 'newPrice': 22.07},
            {'lp': 200, 'currentPrice': 156.91, 'newPrice': 74.24}, {'lp': 300, 'currentPrice': 271.26, 'newPrice': 150.94},
            {'lp': 400, 'currentPrice': 399.99, 'newPrice': 249.72}, {'lp': 500, 'currentPrice': 540.6, 'newPrice': 369.02},
            {'lp': 600, 'currentPrice': 691.47, 'newPrice': 507.72}, {'lp': 700, 'currentPrice': 851.43, 'newPrice': 664.93},
            {'lp': 800, 'currentPrice': 1019.63, 'newPrice': 839.97}, {'lp': 900, 'currentPrice': 1195.35, 'newPrice': 1032.24},
            {'lp': 1000, 'currentPrice': 1378.06, 'newPrice': 1241.24}, {'lp': 1100, 'currentPrice': 1567.29, 'newPrice': 1466.54},
            {'lp': 1200, 'currentPrice': 1762.64, 'newPrice': 1707.74}, {'lp': 1300, 'currentPrice': 1963.78, 'newPrice': 1964.52},
            {'lp': 1400, 'currentPrice': 2170.41, 'newPrice': 2236.55}, {'lp': 1500, 'currentPrice': 2382.28, 'newPrice': 2523.57},
            {'lp': 1600, 'currentPrice': 2599.15, 'newPrice': 2825.31}, {'lp': 1700, 'currentPrice': 2820.82, 'newPrice': 3141.53},
            {'lp': 1800, 'currentPrice': 3047.1, 'newPrice': 3472.02}, {'lp': 1900, 'currentPrice': 3277.83, 'newPrice': 3816.58},
            {'lp': 2000, 'currentPrice': 3512.85, 'newPrice': 4175.01}
        ];

    const formatLabel = (value: number) => `LP: ${value}`;

    // Format tooltip content
    const formatTooltipContent = (value: number, name: string) => {
        const newName = name === 'currentPrice' ? 'Current Model' : 'New Model';
        return [`${value.toFixed(2)} USD`, newName];
    };

    return (
        <LineChart width={1000} height={500} data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="lp" label={{ value: "League Points (LP)", position: 'insideBottomRight', offset: 0, dy: 15 }} />
            <YAxis domain={[0, 4500]} label={{ value: 'Price', angle: -90, position: 'insideLeft', dx: -10 }} />
            <Tooltip
                labelFormatter={formatLabel}
                formatter={formatTooltipContent}
                contentStyle={{ backgroundColor: '#222', borderColor: '#555' }}
            />
            <Legend />
            <Line type="monotone" dataKey="currentPrice" stroke="#8884d8" dot={false} />
            <Line type="monotone" dataKey="newPrice" stroke="#82ca9d" dot={false} />
        </LineChart>
    );
};

const faqs = [
    {
        question: "What is this site?",
        answer: "It's a stock trading platform for players on the TFT ladder! " +
                "You can buy and sell your favorite streamers, and feel invested as the climb the ladder."
    },
    {
        question: "How is the price of each player determined?",
        answer:
            <span>
                The price correlates with the LP of each player, scaling more as a player's LP goes up.
                We are currently on an old price model, and will be switching to a new one soon, you can see the difference below.
                The exact scaling formula is <strong> (LP<sup>A</sup>) &times; B</strong>,
                with the values for <strong> A = 1.35, B = 0.12282 </strong> for the current model, and
                <strong> A = 1.75, B = 0.00698 </strong> for the new model.

                <br/>
                <div style={{marginTop: '20px'}}>  {/* Add space using margin-top */}
                    <PriceChart/>
                </div>
            </span>
    },
    {
        question: "Which players are available to invest in?",
        answer: "Everyone Grandmaster will be available to buy! " +
                "If a player falls out of GM for over 3 days, " +
                "they will be delisted, and those who had them in their portfolio will lose all their money." +
                "Not to worry though, you'll be notified, and each player's portfolio will indicate their listing status."
    },
    {
        question: "Can I put real money on this?",
        answer: "No, there's no real money involved at all, and I don't plan to put any sort of real money gambling features " +
                "into the site."
    },
    {
        question: "What other features are you planning on implementing?",
        answer: "My short term priority is to implement minimum hold times, which prevents users from watching a stream " +
                "and sniping an easy boost in a stock because they can see who's going first, and immediately selling. " +
                "Long term I hope to implement some sort of monthly league system where people can compete to " +
                "see who can make the best portfolio in a month, as well as mutual funds/ etfs for different study groups!"
    },
    {
        question: "Where can I submit suggestions?",
        answer:
            <span>
                Currently I don't have a submit form in place, you can try dm'ing me
                on <a href="https://twitter.com/2BrainCel1" target="_blank"
                      rel="noopener noreferrer">Twitter. </a>
                or joining the newly created TFT Stocks
                <a href="https://discord.gg/QHmEsJ6qRr" target="_blank"
                      rel="noopener noreferrer"> Discord</a>
                . I can't guarantee I'll be able to answer you quickly, as I'm putting in a lot of my time into the site,
                but I'll try to get back to everyone!
            </span>
    },
    // Add more FAQ items here
];

export const FAQPage: React.FC = () => {
    return (
        <MainContent>
            <h1>Frequently Asked Questions</h1>
            <FAQContainer>
                <FAQComponent faqs={faqs}/>
            </FAQContainer>
        </MainContent>
    );
};

