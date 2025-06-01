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
  max-width: 800px;
`;

const ListingsTitle = styled.h3`
  color: #cc3333;
  margin-bottom: 20px;
  text-align: center;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#cc3333' : '#333'};
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${props => props.active ? '#aa2222' : '#444'};
  }
`;

const LocationCard = styled.div<{ type: 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item' }>`
  background: #000;
  border: 1px solid ${props =>
    props.type === 'shop' ? '#4a4a1a' :
    props.type === 'guild' ? '#1a4a4a' :
    props.type === 'hunter' ? '#4a1a1a' :
    props.type === 'paladin' ? '#1a4a1a' :
    props.type === 'werewolf' ? '#3a3a1a' :
    '#2a2a2a'
  };
  border-left: 4px solid ${props =>
    props.type === 'shop' ? '#cccc33' :
    props.type === 'guild' ? '#3333cc' :
    props.type === 'hunter' ? '#cc3333' :
    props.type === 'paladin' ? '#cccc33' :
    props.type === 'werewolf' ? '#cc9933' :
    '#9933cc'
  };
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
`;

const LocationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const LocationName = styled.h4`
  color: #fff;
  margin: 0;
  font-size: 1.1em;
`;

const LocationType = styled.span<{ type: 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item' }>`
  background: ${props =>
    props.type === 'shop' ? '#cccc33' :
    props.type === 'guild' ? '#3333cc' :
    props.type === 'hunter' ? '#cc3333' :
    props.type === 'paladin' ? '#cccc33' :
    props.type === 'werewolf' ? '#cc9933' :
    '#9933cc'
  };
  color: #000;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  text-transform: uppercase;
`;

const LocationDetails = styled.div`
  color: #ccc;
  margin-bottom: 10px;
`;

const LocationCoordinate = styled.div`
  color: #888;
  font-family: monospace;
  font-size: 0.9em;
`;

const TimeInfo = styled.div`
  color: #888;
  font-size: 0.9em;
  margin-top: 10px;
`;

const ReporterInfo = styled.div`
  color: #aaa;
  font-size: 0.9em;
  margin-top: 5px;
`;

const Notes = styled.div`
  color: #ccc;
  font-style: italic;
  margin-top: 10px;
  padding: 8px;
  background: #111;
  border-radius: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ActionButton = styled.button<{ variant: 'confirm' | 'remove' | 'neutral' }>`
  background: ${props =>
    props.variant === 'confirm' ? '#2a5a2a' :
    props.variant === 'remove' ? '#5a2a2a' :
    '#4a4a4a'
  };
  color: #fff;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;

  &:hover {
    background: ${props =>
      props.variant === 'confirm' ? '#1a4a1a' :
      props.variant === 'remove' ? '#4a1a1a' :
      '#5a5a5a'
    };
  }
`;

const ConfidenceBadge = styled.span<{ confidence: 'confirmed' | 'unverified' }>`
  background: ${props => props.confidence === 'confirmed' ? '#2a5a2a' : '#5a5a2a'};
  color: #fff;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7em;
  text-transform: uppercase;
  margin-left: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #888;
  padding: 40px;
  font-style: italic;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background: #000;
  border-radius: 4px;
  font-size: 0.9em;
`;

const StatItem = styled.div`
  color: #ccc;

  strong {
    color: #fff;
  }
`;

interface LocationListingsProps {
  onLocationUpdated?: () => void;
}

export const LocationListings: React.FC<LocationListingsProps> = ({ onLocationUpdated }) => {
  const [locations, setLocations] = useState<ReportedLocation[]>([]);
  const [filter, setFilter] = useState<'all' | 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item'>('all');

  const loadLocations = async () => {
    try {
      const allLocations = await ApiService.getLocations();
      setLocations(allLocations);
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
      return `${diffMinutes} minutes ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }
    return `${diffDays} days ago`;
  };

  const handleConfidenceToggle = async (location: ReportedLocation) => {
    const newConfidence = location.confidence === 'confirmed' ? 'unverified' : 'confirmed';
    try {
      await ApiService.updateLocationConfidence(location.id, newConfidence);
      await loadLocations(); // Reload to get updated data
      if (onLocationUpdated) {
        onLocationUpdated();
      }
    } catch (error) {
      console.error('Failed to update confidence:', error);
    }
  };

  const handleRemove = async (location: ReportedLocation) => {
    if (window.confirm(`Are you sure you want to remove the report for ${location.buildingName}?`)) {
      try {
        await ApiService.deleteLocation(location.id);
        await loadLocations(); // Reload to get updated data
        if (onLocationUpdated) {
          onLocationUpdated();
        }
      } catch (error) {
        console.error('Failed to delete location:', error);
      }
    }
  };

  const filteredLocations = filter === 'all'
    ? locations
    : locations.filter(location => location.buildingType === filter);

  const sortedLocations = [...filteredLocations].sort((a, b) =>
    b.reportedAt.getTime() - a.reportedAt.getTime()
  );

  const stats = {
    total: locations.length,
    shops: locations.filter(l => l.buildingType === 'shop').length,
    guilds: locations.filter(l => l.buildingType === 'guild').length,
    confirmed: locations.filter(l => l.confidence === 'confirmed').length
  };

  return (
    <ListingsContainer>
      <ListingsTitle>Reports</ListingsTitle>

      <StatsBar>
        <StatItem><strong>{stats.total}</strong> total reports</StatItem>
        <StatItem><strong>{stats.shops}</strong> shops</StatItem>
        <StatItem><strong>{stats.guilds}</strong> guilds</StatItem>
        <StatItem><strong>{stats.confirmed}</strong> confirmed</StatItem>
      </StatsBar>

      <FilterContainer>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All ({locations.length})
        </FilterButton>
        <FilterButton
          active={filter === 'shop'}
          onClick={() => setFilter('shop')}
        >
          Shops ({stats.shops})
        </FilterButton>
        <FilterButton
          active={filter === 'guild'}
          onClick={() => setFilter('guild')}
        >
          Guilds ({stats.guilds})
        </FilterButton>
        <FilterButton
          active={filter === 'hunter'}
          onClick={() => setFilter('hunter')}
        >
          Hunters ({locations.filter(l => l.buildingType === 'hunter').length})
        </FilterButton>
        <FilterButton
          active={filter === 'paladin'}
          onClick={() => setFilter('paladin')}
        >
          Paladins ({locations.filter(l => l.buildingType === 'paladin').length})
        </FilterButton>
        <FilterButton
          active={filter === 'werewolf'}
          onClick={() => setFilter('werewolf')}
        >
          Werewolves ({locations.filter(l => l.buildingType === 'werewolf').length})
        </FilterButton>
        <FilterButton
          active={filter === 'item'}
          onClick={() => setFilter('item')}
        >
          Items ({locations.filter(l => l.buildingType === 'item').length})
        </FilterButton>
      </FilterContainer>

      {sortedLocations.length === 0 ? (
        <EmptyState>
          {filter === 'all'
            ? 'No locations reported yet. Be the first to report a shop, guild, hunter, paladin, werewolf, or item location!'
            : `No ${filter} locations reported yet.`
          }
        </EmptyState>
      ) : (
        sortedLocations.map(location => (
          <LocationCard key={location.id} type={location.buildingType}>
            <LocationHeader>
              <div>
                <LocationName>
                  {location.buildingType === 'guild' && location.guildLevel
                    ? `${location.buildingName} ${location.guildLevel}`
                    : location.buildingName}
                </LocationName>
                <LocationType type={location.buildingType}>
                  {location.buildingType}
                </LocationType>
                <ConfidenceBadge confidence={location.confidence || 'unverified'}>
                  {location.confidence || 'unverified'}
                </ConfidenceBadge>
              </div>
            </LocationHeader>

            <LocationDetails>
              <strong>Location:</strong> {getLocationName(location.coordinate.x, location.coordinate.y)}
            </LocationDetails>

            <LocationCoordinate>
              Coordinates: ({location.coordinate.x}, {location.coordinate.y})
            </LocationCoordinate>

            <TimeInfo>
              Reported {formatTimeAgo(location.reportedAt)}
            </TimeInfo>

            {location.reporterName && (
              <ReporterInfo>
                Reported by: {location.reporterName}
              </ReporterInfo>
            )}

            {location.notes && (
              <Notes>
                "{location.notes}"
              </Notes>
            )}

            <ActionButtons>
              <ActionButton
                variant="confirm"
                onClick={() => handleConfidenceToggle(location)}
              >
                {location.confidence === 'confirmed' ? 'Mark Unverified' : 'Mark Confirmed'}
              </ActionButton>
              <ActionButton
                variant="remove"
                onClick={() => handleRemove(location)}
              >
                Remove
              </ActionButton>
            </ActionButtons>
          </LocationCard>
        ))
      )}
    </ListingsContainer>
  );
};