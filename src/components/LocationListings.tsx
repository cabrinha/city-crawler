import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ApiService } from '../services/api';
import { getLocationName } from '../data/cityData';
import type { ReportedLocation } from '../types/game';

const ListingsContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  max-width: 1800px;
`;

const ListingsTitle = styled.h3`
  color: #cc3333;
  margin-bottom: 20px;
  text-align: center;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #000;
  border-radius: 4px;
  font-size: 0.9em;
  justify-content: center;
`;

const StatItem = styled.div`
  color: #ccc;
  text-align: center;

  strong {
    color: #fff;
    font-size: 1.2em;
    display: block;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
`;

const Tab = styled.button<{ active: boolean; type: 'guild' | 'shop' | 'other' }>`
  background: ${props => props.active ?
    (props.type === 'guild' ? '#3333cc' :
     props.type === 'shop' ? '#cccc33' : '#9933cc') : 'transparent'};
  color: ${props => props.active ?
    (props.type === 'shop' ? '#000' : '#fff') : '#ccc'};
  border: none;
  padding: 15px 30px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: bold;
  text-transform: uppercase;
  border-bottom: 3px solid ${props => props.active ?
    (props.type === 'guild' ? '#3333cc' :
     props.type === 'shop' ? '#cccc33' : '#9933cc') : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ?
      (props.type === 'guild' ? '#3333cc' :
       props.type === 'shop' ? '#cccc33' : '#9933cc') :
      (props.type === 'guild' ? 'rgba(51, 51, 204, 0.2)' :
       props.type === 'shop' ? 'rgba(204, 204, 51, 0.2)' : 'rgba(153, 51, 204, 0.2)')};
    color: ${props => props.active ?
      (props.type === 'shop' ? '#000' : '#fff') : '#fff'};
  }
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const LocationCard = styled.div<{ type: 'guild' | 'shop' | 'other' }>`
  background: #000;
  border: 1px solid #333;
  border-left: 3px solid ${props =>
    props.type === 'guild' ? '#3333cc' :
    props.type === 'shop' ? '#cccc33' : '#9933cc'};
  border-radius: 4px;
  padding: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props =>
      props.type === 'guild' ? 'rgba(51, 51, 204, 0.05)' :
      props.type === 'shop' ? 'rgba(204, 204, 51, 0.05)' : 'rgba(153, 51, 204, 0.05)'};
    border-color: ${props =>
      props.type === 'guild' ? '#4444dd' :
      props.type === 'shop' ? '#dddd44' : '#aa44dd'};
  }
`;

const LocationName = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 0.85em;
  margin-bottom: 4px;
  line-height: 1.2;
`;

const LocationDetails = styled.div`
  color: #ccc;
  font-size: 0.75em;
  margin-bottom: 6px;
  line-height: 1.2;
`;

const LocationMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const ReportedBy = styled.span`
  color: #888;
  font-size: 0.7em;
`;

const TimeAgo = styled.span`
  color: #888;
  font-size: 0.7em;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 6px;
`;

const ActionButton = styled.button<{ variant: 'remove' }>`
  background: ${props => props.variant === 'remove' ? '#5a2a2a' : '#2a5a2a'};
  color: #fff;
  border: none;
  padding: 2px 6px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.7em;

  &:hover {
    background: ${props => props.variant === 'remove' ? '#4a1a1a' : '#1a4a1a'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 60px 20px;
  font-style: italic;
  font-size: 1.1em;
`;

interface LocationListingsProps {
  onLocationUpdated?: () => void;
}

export const LocationListings: React.FC<LocationListingsProps> = ({ onLocationUpdated }) => {
  const [locations, setLocations] = useState<ReportedLocation[]>([]);
  const [activeTab, setActiveTab] = useState<'guild' | 'shop' | 'other'>('guild');

  const loadLocations = async () => {
    try {
      const allLocations = await ApiService.getLocations();
      // Filter out blood deities and rich vampires as they don't have physical locations
      const physicalLocations = allLocations.filter(location =>
        !['blood_deity', 'rich_vampire'].includes(location.buildingType)
      );
      setLocations(physicalLocations);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return `${diffDays}d ago`;
  };

  const handleRemove = async (location: ReportedLocation) => {
    if (window.confirm(`Remove ${location.buildingName}?`)) {
      try {
        await ApiService.deleteLocation(location.id);
        await loadLocations();
        if (onLocationUpdated) {
          onLocationUpdated();
        }
      } catch (error) {
        console.error('Failed to delete location:', error);
      }
    }
  };

  // Group locations by type
  const guilds = locations.filter(l => l.buildingType === 'guild').sort((a, b) => {
    const nameA = a.buildingType === 'guild' && a.guildLevel ? `${a.buildingName} ${a.guildLevel}` : a.buildingName;
    const nameB = b.buildingType === 'guild' && b.guildLevel ? `${b.buildingName} ${b.guildLevel}` : b.buildingName;
    return nameA.localeCompare(nameB);
  });
  const shops = locations.filter(l => l.buildingType === 'shop').sort((a, b) => a.buildingName.localeCompare(b.buildingName));
  const others = locations.filter(l => !['guild', 'shop'].includes(l.buildingType)).sort((a, b) => a.buildingName.localeCompare(b.buildingName));

  const stats = {
    total: locations.length,
    guilds: guilds.length,
    shops: shops.length,
    others: others.length,
    confirmed: locations.filter(l => l.confidence === 'confirmed').length
  };

  const renderLocationCard = (location: ReportedLocation, type: 'guild' | 'shop' | 'other') => {
    const showTimeAndRemove = ['hunter', 'paladin', 'werewolf', 'item'].includes(location.buildingType);

    return (
      <LocationCard key={location.id} type={type}>
        <LocationName>
          {location.buildingType === 'guild' && location.guildLevel
            ? `${location.buildingName} ${location.guildLevel}`
            : location.buildingName}
        </LocationName>
        <LocationDetails>
          📍 {getLocationName(location.coordinate.x, location.coordinate.y)}
          {location.buildingType !== 'guild' && location.buildingType !== 'shop' && (
            <> • {location.buildingType}</>
          )}
        </LocationDetails>
        <LocationMeta style={{ justifyContent: showTimeAndRemove ? 'space-between' : 'center' }}>
          <ReportedBy>
            Reported by {location.reporterName}
          </ReportedBy>
          {showTimeAndRemove && (
            <TimeAgo>{formatTimeAgo(location.reportedAt)}</TimeAgo>
          )}
        </LocationMeta>
        {showTimeAndRemove && (
          <ActionButtons>
            <ActionButton
              variant="remove"
              onClick={() => handleRemove(location)}
            >
              Remove
            </ActionButton>
          </ActionButtons>
        )}
      </LocationCard>
    );
  };

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'guild': return guilds;
      case 'shop': return shops;
      case 'other': return others;
      default: return [];
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'guild': return 'No guild locations reported yet';
      case 'shop': return 'No shop locations reported yet';
      case 'other': return 'No other locations reported yet';
      default: return 'No locations found';
    }
  };

  return (
    <ListingsContainer>
      <ListingsTitle>Location Reports</ListingsTitle>

      <StatsBar>
        <StatItem>
          <strong>{stats.total}</strong>
          Total Reports
        </StatItem>
        <StatItem>
          <strong>{stats.guilds}</strong>
          Guilds
        </StatItem>
        <StatItem>
          <strong>{stats.shops}</strong>
          Shops
        </StatItem>
        {stats.others > 0 && (
          <StatItem>
            <strong>{stats.others}</strong>
            Others
          </StatItem>
        )}
        <StatItem>
          <strong>{stats.confirmed}</strong>
          Confirmed
        </StatItem>
      </StatsBar>

      <TabContainer>
        <Tab
          active={activeTab === 'guild'}
          type="guild"
          onClick={() => setActiveTab('guild')}
        >
          Guilds ({stats.guilds})
        </Tab>
        <Tab
          active={activeTab === 'shop'}
          type="shop"
          onClick={() => setActiveTab('shop')}
        >
          Shops ({stats.shops})
        </Tab>
        <Tab
          active={activeTab === 'other'}
          type="other"
          onClick={() => setActiveTab('other')}
        >
          Others ({stats.others})
        </Tab>
      </TabContainer>

      <TabContent>
        {getCurrentTabData().length === 0 ? (
          <EmptyState>
            {getEmptyMessage()}
          </EmptyState>
        ) : (
          <LocationGrid>
            {getCurrentTabData().map(location =>
              renderLocationCard(location, activeTab)
            )}
          </LocationGrid>
        )}
      </TabContent>
    </ListingsContainer>
  );
};