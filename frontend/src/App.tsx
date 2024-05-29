import './App.css';
import {Suspense, lazy, useState} from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';

const Login = lazy(() => import('./pages/Login.tsx').then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const PlayerInfo = lazy(() => import('./pages/PlayerInfo').then(module => ({ default: module.PlayerInfo })));
import {LeaderboardPage, StyledButton} from './pages/LeaderboardPage';
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const SearchBar = lazy(() => import('./components/headerbar/SearchBar.tsx').then(module => ({ default: module.SearchBar })));
const UserProfile = lazy(() => import('./pages/User').then(module => ({ default: module.UserProfile })));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage').then(module => ({ default: module.PortfolioPage })));
const TransactionPage = lazy(() => import('./pages/TransactionPage').then(module => ({ default: module.TransactionPage })));

import {FAQPage} from './pages/FAQPage';
import {HeaderBar, HeaderLeft, HeaderRight} from "./containers/general/HeaderBar.tsx";
import {MainContent} from "./containers/general/MainContent.tsx";
import {SidebarComponent} from "./pages/Sidebar.tsx";
import {AuthProvider} from "./utils/Authentication.tsx";
import {Favorites} from "./pages/Favorites.tsx";
// import {Settings} from "./pages/Settings.tsx";
import {Slideshow} from "./components/homepage/Slideshow.tsx";
import {ModalProvider} from "./components/auth/ModalContext.tsx";
import {ButtonWithModal} from "./components/headerbar/NotificationButton.tsx";
import {ScrollToTop} from "./components/headerbar/ScrollToTop.tsx";
import {SearchResults} from "./pages/SearchResults.tsx";
import {Leagues} from "./pages/Leagues.tsx";
import {LeagueDropdown} from "./components/leagues/Dropdown.tsx";
import {LeagueProvider} from "./components/leagues/LeagueProvider.tsx";

function App() {
    const [currentLeagueId, setCurrentLeagueId] = useState<number>(0);

    return (
        <AuthProvider>
            <ModalProvider>
                <LeagueProvider>
                    <Router>
                        <ScrollToTop/>
                        <SidebarComponent/>
                        <div className="App">
                            <HeaderBar>
                                <HeaderLeft>
                                    <SearchBar/>
                                    <LeagueDropdown currentLeagueId={currentLeagueId} setCurrentLeagueId={setCurrentLeagueId} />
                                </HeaderLeft>
                                <HeaderRight style={{marginLeft: '0px'}}>
                                    <Link to="/faq">
                                        <StyledButton>FAQ</StyledButton>
                                    </Link>
                                    <ButtonWithModal/>
                                </HeaderRight>
                            </HeaderBar>
                            <MainContent> {/* Main content area */}
                                <Suspense fallback={<div>Loading...</div>}>
                                    <Routes>
                                        <Route path="/login" element={<Login/>}/>
                                        <Route path="/dashboard" element={<Dashboard/>}/>
                                        <Route path="/players/:gameName/:tagLine" element={<PlayerInfo/>}/>
                                        <Route path="/leaderboard" element={<LeaderboardPage/>}/>
                                        <Route path="/users/:username" element={<UserProfile/>}/>
                                        <Route path="/register" element={<Register/>}/>
                                        <Route path="/portfolio" element={<PortfolioPage/>}/>
                                        <Route path="/transaction_history" element={<TransactionPage/>}/>
                                        <Route path="/favorites" element={<Favorites/>}/>
                                        <Route path="/results/players/:searchQuery" element={<SearchResults />} />
                                        <Route path="/" element={<Slideshow/>}/>
                                        <Route path="/FAQ" element={<FAQPage/>}/>
                                        <Route path="/leagues" element={<Leagues />} />
                                    </Routes>
                                </Suspense>
                                <Login />
                                <Register />
                                {/*<Settings />*/}
                            </MainContent>
                        </div>
                    </Router>
                </LeagueProvider>
            </ModalProvider>
        </AuthProvider>
    );
}

export default App;
