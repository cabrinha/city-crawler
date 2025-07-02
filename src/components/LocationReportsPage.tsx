import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LocationReporter } from './LocationReporter';
import { LocationListings } from './LocationListings';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #000;
  color: #fff;
  padding: 20px;
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

const BackToMapButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  background: #cc3333;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1000;

  &:hover {
    background: #aa2222;
  }
`;

interface LocationReportsPageProps {
  onBackToMap?: () => void;
}

export const LocationReportsPage: React.FC<LocationReportsPageProps> = ({ onBackToMap }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'listings'>('report');
  const [refreshKey, setRefreshKey] = useState(0);
  const [countdown, setCountdown] = useState({ shops: '', guilds: '' });

  const calculateCountdown = () => {
    const now = new Date();

    // Calculate next shop expiration (10:40 GMT and 22:40 GMT)
    const nextShopExpiration = new Date(now);
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    if (currentHour < 10 || (currentHour === 10 && currentMinute < 40)) {
      // Next is today at 10:40
      nextShopExpiration.setUTCHours(10, 40, 0, 0);
    } else if (currentHour < 22 || (currentHour === 22 && currentMinute < 40)) {
      // Next is today at 22:40
      nextShopExpiration.setUTCHours(22, 40, 0, 0);
    } else {
      // Next is tomorrow at 10:40
      nextShopExpiration.setUTCDate(nextShopExpiration.getUTCDate() + 1);
      nextShopExpiration.setUTCHours(10, 40, 0, 0);
    }

    // Calculate next guild movement (1st, 6th, 10th, 14th, 19th, 23rd, 27th at 12:00 AM UTC)
    const guildMovementDates = [1, 6, 10, 14, 19, 23, 27];
    const nextGuildExpiration = new Date(now);
    const currentDay = now.getUTCDate();

    // Find the next guild movement date
    let nextMovementDay = guildMovementDates.find(day => day > currentDay);

    if (nextMovementDay) {
      // Next movement is this month
      nextGuildExpiration.setUTCDate(nextMovementDay);
    } else {
      // Next movement is first day of next month
      nextGuildExpiration.setUTCMonth(nextGuildExpiration.getUTCMonth() + 1);
      nextGuildExpiration.setUTCDate(guildMovementDates[0]); // 1st of next month
    }

    nextGuildExpiration.setUTCHours(0, 0, 0, 0); // 12:00 AM UTC

    // Calculate time differences
    const shopDiff = nextShopExpiration.getTime() - now.getTime();
    const guildDiff = nextGuildExpiration.getTime() - now.getTime();

    // Format countdowns
    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h ${minutes}m ${seconds}s`;
      }
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setCountdown({
      shops: shopDiff > 0 ? formatTime(shopDiff) : 'Moving now!',
      guilds: guildDiff > 0 ? formatTime(guildDiff) : 'Moving now!'
    });
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
    setActiveTab('report'); // Switch to report to show the new report
  };

  const handleLocationUpdated = () => {
    // Refresh when locations are updated
    setRefreshKey(prev => prev + 1);
  };

  return (
    <PageContainer>
      {onBackToMap && (
        <BackToMapButton onClick={onBackToMap}>
          ← Back to Map
        </BackToMapButton>
      )}

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
          active={activeTab === 'report'}
          onClick={() => setActiveTab('report')}
        >
          Report Location
        </TabButton>
        <TabButton
          active={activeTab === 'listings'}
          onClick={() => setActiveTab('listings')}
        >
          View Reports
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