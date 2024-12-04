# Introduction
TFT Stocks is a unique stock market simulation platform based on the League Points of Teamfight Tactics (TFT) players. Built with React TypeScript, FastAPI, and PostgreSQL, the application integrates Riot's API to fetch real-time data, enabling users to buy and sell 'player stocks' and track their portfolio performance through dynamic visualization.

## Problem Statement

Streaming is one of the core aspects of the Teamfight Tactics community, particularly when top players share their perspectives live. These streams are a blend of entertainment and education, and the best players often have thousands of viewers invested in the outcome of their games. TFTStocks.com builds on this investment by allowing users to purchase "stocks" in their favorite players, providing real stakes as they watch, and a sense of satsifaction when the player does well. As the players climb, the viewers' protfolio grows, creating a new layer of engagement and motivation to follow and support top TFT talent. 

## User Stories

- **Portfolio Management**
  - Buy/ sell player stocks
  - See their investment breakdown
  - Track each player on their portfolio
- **Real-Time Data Integration**
  - Get real time updates on stock prices
  - Follow along with what's happening on their favorite players' streams
- **Interactive Visualizations**
  - Dynamic charts and graphs display the historical performance of stocks and portfolios.
- **Leaderboards**
  - Users and players are ranked and displayed on site leaderboards
  - Compare portfolios with other users
- **Leagues**
  - Create monthly/ set long leagues to compete directly with your friends
  - Play in site wide leagues to see who's the best investor

## Technologies Used

- **Frontend**: React TypeScript (ReactTS), Vite
- **Backend**: FastAPI, AWS Lambda
- **Database**: PostgreSQL (Amazon RDS)
- **Containerization**: Docker, Amazon ECR
- **CI/CD**: Google Build, Google Cloud Run (initially), AWS
- **Other**: Riot Games API for real-time data


