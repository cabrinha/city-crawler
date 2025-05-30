import { useState } from 'react';
import styled from 'styled-components';
import { D3CityMap } from './components/D3CityMap';
import type { GameState } from './types/game';

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: 'Courier New', monospace;
`;

const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background-color: rgba(0, 0, 0, 0.9);
  padding: 10px 20px;
  border-bottom: 1px solid #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  color: #ff4444;
  font-size: 24px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const GameStats = styled.div`
  display: flex;
  gap: 20px;
  font-size: 14px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .label {
    font-size: 10px;
    color: #ccc;
    text-transform: uppercase;
  }

  .value {
    font-weight: bold;
    color: #fff;
  }
`;

function App() {
  const [gameState] = useState<GameState>({
    playerLocation: { x: 50, y: 50 }, // Starting at center of the city
    actionPoints: 8,
    maxActionPoints: 90,
    bloodPints: 105449,
    coins: 1000,
    rank: 'Blood Deity'
  });

  return (
    <AppContainer>
      <Header>
        <Title>Vespertine's City Crawler</Title>
        <GameStats>
          {/* <StatItem>
            <div className="label">Action Points</div>
            <div className="value">{gameState.actionPoints}/{gameState.maxActionPoints}</div>
          </StatItem>
          <StatItem>
            <div className="label">Blood</div>
            <div className="value">{gameState.bloodPints.toLocaleString()} pints</div>
          </StatItem>
          <StatItem>
            <div className="label">Coins</div>
            <div className="value">{gameState.coins.toLocaleString()}</div>
          </StatItem>
          <StatItem>
            <div className="label">Rank</div>
            <div className="value">{gameState.rank}</div>
          </StatItem> */}
        </GameStats>
      </Header>

      <D3CityMap playerLocation={gameState.playerLocation} />
    </AppContainer>
  );
}

export default App;