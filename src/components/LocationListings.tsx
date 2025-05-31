import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  getReportedLocations,
  getReportedLocationsByType,
  removeReportedLocation,
  updateLocationConfidence
} from '../data/reportedLocations';
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

const LocationCard = styled.div<{ type: 'shop' | 'guild' }>`
  background: #000;
  border: 1px solid ${props => props.type === 'shop' ? '#4a4a1a' : '#1a4a4a'};
  border-left: 4px solid ${props => props.type === 'shop' ? '#cccc33' : '#3333cc'};
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

const LocationType = styled.span<{ type: 'shop' | 'guild' }>`
  background: ${props => props.type === 'shop' ? '#cccc33' : '#3333cc'};
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
  const [filter, setFilter] = useState<'all' | 'shop' | 'guild'>('all');

  const loadLocations = () => {
    const allLocations = getReportedLocations();
    setLocations(allLocations);
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
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const handleConfidenceToggle = async (location: ReportedLocation) => {
    const newConfidence = location.confidence === 'confirmed' ? 'unverified' : 'confirmed';
    const success = updateLocationConfidence(location.id, newConfidence);

    if (success) {
      loadLocations();
      onLocationUpdated?.();
    }
  };

  const handleRemove = async (location: ReportedLocation) => {
    if (window.confirm(`Are you sure you want to remove the report for ${location.buildingName}?`)) {
      const success = removeReportedLocation(location.id);

      if (success) {
        loadLocations();
        onLocationUpdated?.();
      }
    }
  };

  const filteredLocations = filter === 'all'
    ? locations
    : getReportedLocationsByType(filter);

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
      <ListingsTitle>Reported Shop & Guild Locations</ListingsTitle>

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
      </FilterContainer>

      {sortedLocations.length === 0 ? (
        <EmptyState>
          {filter === 'all'
            ? 'No locations reported yet. Be the first to report a shop or guild location!'
            : `No ${filter} locations reported yet.`
          }
        </EmptyState>
      ) : (
        sortedLocations.map(location => (
          <LocationCard key={location.id} type={location.buildingType}>
            <LocationHeader>
              <div>
                <LocationName>{location.buildingName}</LocationName>
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