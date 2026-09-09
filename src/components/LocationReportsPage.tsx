import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getMoveCountdown } from '../utils/formatters';
import { LocationReporter } from './LocationReporter';
import { LocationListings } from './LocationListings';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #000;
  color: #fff;
  padding: 70px 20px 20px;
`;

const PageTitle = styled.h1`
  color: #cc3333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5em;
`;

const CountdownContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 15px;
  margin: 0 auto 20px;
  max-width: 700px;
  text-align: center;
`;

const CountdownTitle = styled.h3`
  color: #cc3333;
  margin-bottom: 10px;
  font-size: 1.2em;
`;

const CountdownGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const CountdownItem = styled.div`
  background: #000;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px;
`;

const CountdownLabel = styled.div`
  color: #ccc;
  font-size: 0.9em;
  margin-bottom: 5px;
`;

const CountdownTime = styled.div`
  color: #fff;
  font-size: 1.1em;
  font-weight: bold;
  font-family: 'Courier New', monospace;
`;

const TabNavigation = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #333;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#333' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#ccc'};
  border: none;
  padding: 15px 30px;
  cursor: pointer;
  font-size: 1.1em;
  border-bottom: 3px solid ${props => props.active ? '#cc3333' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    background: #333;
    color: #fff;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const LocationReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'listings'>('listings');
  const [refreshKey, setRefreshKey] = useState(0);
  const [countdown, setCountdown] = useState({ shops: '', guilds: '' });

  const calculateCountdown = () => {
    setCountdown(getMoveCountdown(new Date()));
  };

  useEffect(() => {
    // Calculate initial countdown
    calculateCountdown();

    // Update every second
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLocationReported = () => {
    // Refresh the listings when a new location is reported
    setRefreshKey(prev => prev + 1);
    setActiveTab('listings'); // Show the new report in the list
  };

  const handleLocationUpdated = () => {
    // Refresh when locations are updated
    setRefreshKey(prev => prev + 1);
  };

  return (
    <PageContainer>
      <PageTitle>Report Shops & Guilds</PageTitle>

      <CountdownContainer>
        <CountdownTitle>Next Location Changes</CountdownTitle>
        <CountdownGrid>
          <CountdownItem>
            <CountdownLabel>Shops moving in:</CountdownLabel>
            <CountdownTime>{countdown.shops}</CountdownTime>
          </CountdownItem>
          <CountdownItem>
            <CountdownLabel>Guilds moving in:</CountdownLabel>
            <CountdownTime>{countdown.guilds}</CountdownTime>
          </CountdownItem>
        </CountdownGrid>
      </CountdownContainer>

      <TabNavigation>
        <TabButton
          active={activeTab === 'listings'}
          onClick={() => setActiveTab('listings')}
        >
          Current Locations
        </TabButton>
        <TabButton
          active={activeTab === 'report'}
          onClick={() => setActiveTab('report')}
        >
          Report a Location
        </TabButton>
      </TabNavigation>

      <ContentContainer>
        {activeTab === 'report' && (
          <LocationReporter onLocationReported={handleLocationReported} />
        )}
        {activeTab === 'listings' && (
          <LocationListings
            key={refreshKey}
            onLocationUpdated={handleLocationUpdated}
          />
        )}
      </ContentContainer>
    </PageContainer>
  );
};