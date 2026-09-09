import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { MapPage } from './components/MapPage';
import { StatusBar } from './components/StatusBar';
import { RankingsPage } from './components/RankingsPage';
import { ShoppingCalculatorPage } from './components/ShoppingCalculatorPage';
import { updateMetaTags } from './main';
import { getMoveCycle } from './utils/formatters';
import { ApiService } from './services/api';
import type { ReportedLocation } from './types/game';

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000;
  color: #fff;
  font-family: 'Courier New', monospace;
`;

const Header = styled.header`
  z-index: 200;
  background-color: rgba(0, 0, 0, 0.9);
  padding: 10px 20px;
  border-bottom: 1px solid #666;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 640px) {
    padding: 8px 10px;
    flex-wrap: wrap;
    gap: 6px;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #ff4444;
  font-size: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);

  @media (max-width: 640px) {
    font-size: 16px;
    white-space: nowrap;
    flex: 1 1 100%;
    text-align: center;
  }
`;

const GameStats = styled.div`
  display: flex;
  gap: 20px;
  font-size: 14px;
  align-items: center;

  @media (max-width: 640px) {
    gap: 6px;
    flex: 1 1 100%;
    justify-content: center;
  }
`;


const NavigationButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? '#cc3333' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#ff6666'};
  border: 1px solid #cc3333;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background 0.3s ease;

  &:hover {
    background: #cc3333;
    color: #fff;
  }

  @media (max-width: 640px) {
    padding: 6px 8px;
    font-size: 12px;
  }
`;

const GitHubLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  @media (max-width: 640px) {
    width: 32px;
    height: 32px;
  }
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid #666;
  border-radius: 8px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: #999;
    transform: translateY(-1px);
  }

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [playerLocation, setPlayerLocation] = useState({ x: 0, y: 0 });
  const [locations, setLocations] = useState<ReportedLocation[]>([]);
  const [shopsMoveInMs, setShopsMoveInMs] = useState(() => getMoveCycle().shops.next.getTime() - Date.now());

  const loadLocations = () =>
    ApiService.getLocations().then(setLocations).catch(err => console.error('Failed to load locations:', err));

  // Reload on mount, every 5 minutes, and right after a shop/guild move (reports reset then).
  useEffect(() => {
    loadLocations();
    const id = setInterval(loadLocations, 5 * 60_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      const ms = getMoveCycle().shops.next.getTime() - Date.now();
      setShopsMoveInMs(prev => { if (ms > prev) loadLocations(); return ms; });
    }, 30_000);
    return () => clearInterval(id);
  }, []);
  const goToRankings = () => navigate('/rankings');
  const goToShopping = () => navigate('/shopping');
  const goToMap = () => navigate('/');

  const currentPath = location.pathname;

  useEffect(() => {
    updateMetaTags();
  }, []);

  return (
    <AppContainer>
      <Header>
        <Title>Vespertine's City Crawler</Title>
        <GameStats>
          <NavigationButton onClick={goToMap} $active={currentPath === '/'}>
            Map
          </NavigationButton>
          <NavigationButton onClick={goToRankings} $active={currentPath === '/rankings'}>
            Rankings
          </NavigationButton>
          <NavigationButton onClick={goToShopping} $active={currentPath === '/shopping'}>
            Shopping
          </NavigationButton>
          <GitHubLink
            href="https://github.com/cabrinha/city-crawler"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            aria-label="View source code on GitHub"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </GitHubLink>
        </GameStats>
      </Header>

      <StatusBar locations={locations} />

      <Routes>
        <Route
          path="/"
          element={
            <MapPage
              locations={locations}
              onLocationsChanged={loadLocations}
              playerLocation={playerLocation}
              onPlayerLocationChange={setPlayerLocation}
              shopsMoveInMs={shopsMoveInMs}
            />
          }
        />
        <Route path="/locations" element={<Navigate to="/" replace />} />
        <Route
          path="/rankings"
          element={<RankingsPage />}
        />
        <Route
          path="/shopping"
          element={<ShoppingCalculatorPage />}
        />
      </Routes>
    </AppContainer>
  );
}

export default App;