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

 ## Entities

 - **Stocks**
   - Represents the top 750~ players on the NA TFT ladder
   - Each stock has its own profile, tracking price history and current price
   - Updates in real time (every 5 minutes)
   - Publicly available profile, requires user authentication to purchase
- **Portfolio**
  - Collection of all user stocks
  - Shows monetary and % allocation in each stock
  - Publicly available on user profile
 - **Profile**
   - Shows portfolio allocation and performance history
   - Publicly available
- **Dashboard**
  - Consolidates all site information (profile, leaderboard, individual stocks)
  - Each user's dashboard is different
- **Leaderboard**
  - Shows the top performing users and stocks across different time periods
  - Publicly available
- **Leagues**
  - Allows user to have a different portfolio for each league
  - Each league has its own leaderboard and dashboard
  - Portfolio performance in each league is independent

## Technical Requirements

- **Frontend**: React TypeScript (ReactTS), Vite
  - React is one of the most popular library for web interface creation, with a large ecosystem of libraries and tools
  - Component reusability simplifies maintainence and expansion
  - Typescript catches errors at compile time, and significantly helps with bugfixing 
- **Backend**: FastAPI
  - Fast and efficient, leveraging asynchronous programming to handle large numbers of requests efficiently 
  - Provides automatic generation of OpenAPI and JSON Schema documentation, making it easy to integrate with frontend frameworks and manage RESTful APIs 
  - Integrates seamlessly with Pydantic for data validation and SQLAlchemy for ORM, both of which enhance developer productivity and code reliability.
- **Database**: PostgreSQL (AWS RDS)
  - I originally started with MongoDB before migrating everything to Postgres due to ACID compliance and complexity of the data as I expanded
  - Using RDS helped keep my entire infrastructure in the same ecosystem, and ensured high availability and durability
- **Containerization**: Docker, Amazon ECR
- **CI/CD**: Google Build, Google Cloud Run (initially), AWS
- **Security**: (Oauth2)
  - Industry standard in securing APIs and authenticating users
  - Granular access control allows fine-grained permissions
  - Supports JWT for stateless authentication
- **Other**: Riot Games API for real-time data

## Non-Functional Requirements

- **Scalability**
  - Supports up to 100 concurrent users
- **Performance**
  - Low latency (<200ms) for all API requests, particularly transactions
- **Availability**
  - 99.9% uptime for all services
- **Security**
  - Secure data storage and communication



