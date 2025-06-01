import React, { useState } from 'react';
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

const Subtitle = styled.p`
  text-align: center;
  color: #ccc;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
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

const InfoBox = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const InfoTitle = styled.h3`
  color: #cc3333;
  margin-bottom: 15px;
`;

const InfoText = styled.p`
  color: #ccc;
  margin-bottom: 10px;
  line-height: 1.5;
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

  const handleLocationReported = () => {
    // Refresh the listings when a new location is reported
    setRefreshKey(prev => prev + 1);
    setActiveTab('listings'); // Switch to listings to show the new report
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

      <Subtitle>
        Help the vampire community by reporting the current locations of shops, guilds, and other locations!
        Shops move every 12 hours, and guilds move on specific dates (1st, 6th, 10th, 14th, 19th, 23rd, and 27th of each month at 00:05 UTC).
      </Subtitle>

      <InfoBox>
        <InfoTitle>How It Works</InfoTitle>
        <InfoText>Shops move every 12 hours, and guilds move on specific dates (1st, 6th, 10th, 14th, 19th, 23rd, and 27th of each month at 00:05 UTC/GMT).</InfoText>
        <InfoText>
          <strong>Reporting:</strong> You can report locations using dropdown menus or natural language like "Paper and Scrolls, right by Regret and 90th".
        </InfoText>
      </InfoBox>

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