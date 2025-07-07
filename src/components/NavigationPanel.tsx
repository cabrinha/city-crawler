import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { Coordinate, Route, PathfindingResult, NavigationState, ReportedLocation } from '../types/game';
import {
  findOptimalRoute,
  getRouteDescription
} from '../services/navigation';
import { STREET_NAMES, BUILDINGS, getStreetName, getStreetNumber } from '../data/cityData';
import { ApiService } from '../services/api';

const NavigationContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  border: 1px solid #666;
  min-width: 280px;
  max-width: 320px;
  position: relative;
  user-select: none;
`;

const NavigationHeader = styled.div<{ $isVisible: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: ${props => props.$isVisible ? '1px solid #666' : 'none'};
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    color: #00ff00;
    pointer-events: none;
  }

  &::after {
    content: '${props => props.$isVisible ? '▼' : '▶'}';
    font-size: 12px;
    color: #ccc;
    pointer-events: none;
  }
`;

const NavigationContent = styled.div<{ $isVisible: boolean }>`
  padding: ${props => props.$isVisible ? '15px' : '0'};
  max-height: ${props => props.$isVisible ? '500px' : '0'};
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const InputSection = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  color: #ccc;
  margin-bottom: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 8px 12px;
  background-color: ${props => props.$variant === 'primary' ? '#00ff00' : 'rgba(0, 0, 0, 0.8)'};
  color: ${props => props.$variant === 'primary' ? '#000' : 'white'};
  border: 1px solid ${props => props.$variant === 'primary' ? '#00ff00' : '#666'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: ${props => props.$variant === 'primary' ? 'bold' : 'normal'};

  &:hover {
    background-color: ${props => props.$variant === 'primary' ? '#00cc00' : 'rgba(0, 0, 0, 0.9)'};
    border-color: ${props => props.$variant === 'primary' ? '#00cc00' : '#999'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RouteSection = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #666;
`;

const RouteOption = styled.div<{ $isRecommended?: boolean }>`
  margin-bottom: 12px;
  padding: 10px;
  background-color: ${props => props.$isRecommended ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$isRecommended ? '#00ff00' : '#444'};
  border-radius: 4px;
`;

const RouteTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #00ff00;
  margin-bottom: 5px;
`;

const RouteDescription = styled.div`
  font-size: 11px;
  color: #ccc;
  line-height: 1.4;
`;

const MovesDisplay = styled.span`
  color: #00ff00;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  color: #ff6666;
  font-size: 11px;
  margin-top: 5px;
`;

const HelpText = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 5px;
  line-height: 1.3;
`;

const LocationInputGroup = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
`;

const SmallSelect = styled.select`
  flex: 1;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border: 1px solid #666;
  border-radius: 4px;
  font-size: 11px;

  &:focus {
    outline: none;
    border-color: #00ff00;
  }

  &:disabled {
    opacity: 0.6;
    background-color: rgba(0, 0, 0, 0.5);
    color: #999;
    cursor: not-allowed;
  }

  option {
    background-color: #000;
    color: white;
  }
`;

const LocationTypeSelect = styled.select`
  width: 100%;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border: 1px solid #666;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #00ff00;
  }

  &:disabled {
    opacity: 0.6;
    background-color: rgba(0, 0, 0, 0.5);
    color: #999;
    cursor: not-allowed;
  }

  option {
    background-color: #000;
    color: white;
  }
`;



interface NavigationPanelProps {
  playerLocation?: Coordinate;
  navigationState: NavigationState;
  onNavigationChange: (state: NavigationState) => void;
  onRouteSelect: (route: Route) => void;
}

type LocationInputType = 'street' | 'nearest' | 'reported';

interface LocationSelection {
  type: LocationInputType;
  streetName?: string;
  streetNumber?: string;
  nearestType?: string;
  reportedLocationId?: string;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  playerLocation,
  navigationState,
  onNavigationChange,
  onRouteSelect
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pathfindingResult, setPathfindingResult] = useState<PathfindingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportedLocations, setReportedLocations] = useState<ReportedLocation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Location selection states
  const [startSelection, setStartSelection] = useState<LocationSelection>({ type: 'street' });
  const [destinationSelection, setDestinationSelection] = useState<LocationSelection>({ type: 'street' });

  // Load reported locations
  useEffect(() => {
    const loadReportedLocations = async () => {
      try {
        const locations = await ApiService.getLocations();
        setReportedLocations(locations);
      } catch (error) {
        console.error('Failed to load reported locations:', error);
      }
    };
    loadReportedLocations();
  }, []);

  // Update selections when navigation state changes
  useEffect(() => {
    if (navigationState.startLocation) {
      const streetName = getStreetName(navigationState.startLocation.x);
      const streetNumber = getStreetNumber(navigationState.startLocation.y);
      setStartSelection({
        type: 'street',
        streetName,
        streetNumber
      });
    }
    if (navigationState.destination) {
      // Try to convert coordinates back to street address if possible
      const streetName = getStreetName(navigationState.destination.x);
      const streetNumber = getStreetNumber(navigationState.destination.y);
      setDestinationSelection({
        type: 'street',
        streetName,
        streetNumber
      });
    }
  }, [navigationState.startLocation, navigationState.destination]);

  // Initialize start location with player's current location, but allow user changes
  useEffect(() => {
    if (playerLocation && !startSelection.streetName) {
      const streetName = getStreetName(playerLocation.x);
      const streetNumber = getStreetNumber(playerLocation.y);
      setStartSelection({
        type: 'street',
        streetName,
        streetNumber
      });
    }
  }, [playerLocation, startSelection.streetName]);

  // Helper function to convert street name to coordinate
  const streetNameToCoordinate = (streetName: string): number => {
    if (streetName === "Western City Limits") return 1;
    const index = STREET_NAMES.indexOf(streetName);
    if (index === -1) return 1;
    return index * 2 + 2;
  };

  // Helper function to convert street number to coordinate
  const streetNumberToCoordinate = (streetNumber: string): number => {
    if (streetNumber === "Northern City Limits") return 1;
    const match = streetNumber.match(/(\d+)/);
    if (!match) return 1;
    const num = Number.parseInt(match[1], 10);
    return (num - 1) * 2 + 2;
  };

  // Convert location selection to coordinate
  const getCoordinateFromSelection = (selection: LocationSelection, referenceLocation?: Coordinate): Coordinate | null => {
    switch (selection.type) {
      case 'street':
        if (selection.streetName && selection.streetNumber) {
          return {
            x: streetNameToCoordinate(selection.streetName),
            y: streetNumberToCoordinate(selection.streetNumber)
          };
        }
        return null;

      case 'nearest':
        if (!referenceLocation || !selection.nearestType) return null;
        const buildings = BUILDINGS.filter(b => b.type === selection.nearestType);
        if (buildings.length === 0) return null;

        let nearest = buildings[0];
        let minDistance = Math.abs(referenceLocation.x - nearest.coordinate.x) + Math.abs(referenceLocation.y - nearest.coordinate.y);

        for (const building of buildings) {
          const distance = Math.abs(referenceLocation.x - building.coordinate.x) + Math.abs(referenceLocation.y - building.coordinate.y);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = building;
          }
        }
        return nearest.coordinate;

      case 'reported':
        if (!selection.reportedLocationId) return null;
        const reported = reportedLocations.find(loc => loc.id === selection.reportedLocationId);
        return reported?.coordinate || null;

      default:
        return null;
    }
  };

  const handleCalculateRoute = () => {
    setError(null);

    const startCoord = getCoordinateFromSelection(startSelection);
    if (!startCoord) {
      setError('Invalid start location. Please check your selection.');
      return;
    }

    const destCoord = getCoordinateFromSelection(destinationSelection, startCoord);
    if (!destCoord) {
      setError('Invalid destination. Please check your selection.');
      return;
    }

    if (startCoord.x === destCoord.x && startCoord.y === destCoord.y) {
      setError('You are already at the destination.');
      return;
    }

    const result = findOptimalRoute(startCoord, destCoord);
    setPathfindingResult(result);

    onNavigationChange({
      ...navigationState,
      startLocation: startCoord,
      destination: destCoord,
      currentRoute: result.recommendedRoute,
      isNavigating: true
    });
  };

  const handleSelectRoute = (route: Route) => {
    onRouteSelect(route);
    onNavigationChange({
      ...navigationState,
      currentRoute: route,
      showRouteOnMap: true
    });
  };

  const handleClearNavigation = () => {
    setDestinationSelection({ type: 'street' });
    setPathfindingResult(null);
    setError(null);
    onNavigationChange({
      startLocation: undefined,
      destination: undefined,
      currentRoute: undefined,
      isNavigating: false,
      showRouteOnMap: false
    });
  };



  // Helper function to render destination input
  const renderDestinationInput = () => {
    return (
      <InputSection>
        <Label>Destination</Label>
        <LocationTypeSelect
          value={destinationSelection.type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDestinationSelection({ type: e.target.value as LocationInputType })}
        >
          <option value="street">Street Address</option>
          <option value="nearest">Nearest Building</option>
          <option value="reported">Reported Location</option>
        </LocationTypeSelect>

        {destinationSelection.type === 'street' && (
          <>
            <LocationInputGroup>
              <SmallSelect
                value={destinationSelection.streetName || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDestinationSelection({ ...destinationSelection, streetName: e.target.value })}
              >
                <option value="">Select Street</option>
                <option value="Western City Limits">Western City Limits</option>
                {STREET_NAMES.map((street) => (
                  <option key={street} value={street}>{street}</option>
                ))}
              </SmallSelect>
              <SmallSelect
                value={destinationSelection.streetNumber || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDestinationSelection({ ...destinationSelection, streetNumber: e.target.value })}
              >
                <option value="">Select Number</option>
                <option value="Northern City Limits">Northern City Limits</option>
                {Array.from({ length: 100 }, (_, i) => {
                  const num = i + 1;
                  const lastDigit = num % 10;
                  const lastTwoDigits = num % 100;
                  let suffix = 'th';
                  if (!(lastTwoDigits >= 11 && lastTwoDigits <= 13)) {
                    switch (lastDigit) {
                      case 1: suffix = 'st'; break;
                      case 2: suffix = 'nd'; break;
                      case 3: suffix = 'rd'; break;
                    }
                  }
                  return `${num}${suffix}`;
                }).map((streetNumber) => (
                  <option key={streetNumber} value={streetNumber}>{streetNumber}</option>
                ))}
              </SmallSelect>
            </LocationInputGroup>
            <HelpText>Select street name and number</HelpText>
          </>
        )}

        {destinationSelection.type === 'nearest' && (
          <>
            <LocationTypeSelect
              value={destinationSelection.nearestType || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDestinationSelection({ ...destinationSelection, nearestType: e.target.value })}
            >
              <option value="">Select Building Type</option>
              <option value="bank">Nearest Bank</option>
              <option value="pub">Nearest Pub</option>
              <option value="transit">Nearest Transit Station</option>
            </LocationTypeSelect>
            <HelpText>Find nearest building of selected type</HelpText>
          </>
        )}

        {destinationSelection.type === 'reported' && (
          <>
            <LocationTypeSelect
              value={destinationSelection.reportedLocationId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDestinationSelection({ ...destinationSelection, reportedLocationId: e.target.value })}
            >
              <option value="">Select Reported Location</option>
              {reportedLocations.filter(loc => loc.buildingType === 'guild').map((location) => (
                <option key={location.id} value={location.id}>
                  {location.buildingName} (Guild Level {location.guildLevel})
                </option>
              ))}
              {reportedLocations.filter(loc => loc.buildingType === 'shop').map((location) => (
                <option key={location.id} value={location.id}>
                  {location.buildingName} (Shop)
                </option>
              ))}
              {reportedLocations.filter(loc => loc.buildingType === 'hunter').map((location) => (
                <option key={location.id} value={location.id}>
                  {location.buildingName} (Hunter)
                </option>
              ))}
              {reportedLocations.filter(loc => loc.buildingType === 'paladin').map((location) => (
                <option key={location.id} value={location.id}>
                  {location.buildingName} (Paladin)
                </option>
              ))}
              {reportedLocations.filter(loc => loc.buildingType === 'werewolf').map((location) => (
                <option key={location.id} value={location.id}>
                  {location.buildingName} (Werewolf)
                </option>
              ))}
            </LocationTypeSelect>
            <HelpText>Select from currently reported locations</HelpText>
          </>
        )}
      </InputSection>
    );
  };

  return (
    <NavigationContainer ref={containerRef}>
      <NavigationHeader
        $isVisible={isVisible}
        onClick={() => setIsVisible(!isVisible)}
      >
        <h3>🧭 Navigation</h3>
      </NavigationHeader>

      <NavigationContent $isVisible={isVisible}>
        <InputSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <Label>Start Location</Label>
            <Button
              style={{ fontSize: '10px', padding: '4px 8px' }}
              onClick={() => {
                if (playerLocation) {
                  const streetName = getStreetName(playerLocation.x);
                  const streetNumber = getStreetNumber(playerLocation.y);
                  setStartSelection({
                    type: 'street',
                    streetName,
                    streetNumber
                  });
                }
              }}
            >
              Use Current
            </Button>
          </div>
          <LocationTypeSelect
            value={startSelection.type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStartSelection({ type: e.target.value as LocationInputType })}
          >
            <option value="street">Street Address</option>
            <option value="nearest">Nearest Building</option>
            <option value="reported">Reported Location</option>
          </LocationTypeSelect>

          {startSelection.type === 'street' && (
            <>
              <LocationInputGroup>
                <SmallSelect
                  value={startSelection.streetName || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStartSelection({ ...startSelection, streetName: e.target.value })}
                >
                  <option value="">Select Street</option>
                  <option value="Western City Limits">Western City Limits</option>
                  {STREET_NAMES.map((street) => (
                    <option key={street} value={street}>{street}</option>
                  ))}
                </SmallSelect>
                <SmallSelect
                  value={startSelection.streetNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStartSelection({ ...startSelection, streetNumber: e.target.value })}
                >
                  <option value="">Select Number</option>
                  <option value="Northern City Limits">Northern City Limits</option>
                  {Array.from({ length: 100 }, (_, i) => {
                    const num = i + 1;
                    const lastDigit = num % 10;
                    const lastTwoDigits = num % 100;
                    let suffix = 'th';
                    if (!(lastTwoDigits >= 11 && lastTwoDigits <= 13)) {
                      switch (lastDigit) {
                        case 1: suffix = 'st'; break;
                        case 2: suffix = 'nd'; break;
                        case 3: suffix = 'rd'; break;
                      }
                    }
                    return `${num}${suffix}`;
                  }).map((streetNumber) => (
                    <option key={streetNumber} value={streetNumber}>{streetNumber}</option>
                  ))}
                </SmallSelect>
              </LocationInputGroup>
              <HelpText>Select street name and number</HelpText>
            </>
          )}

          {startSelection.type === 'nearest' && (
            <>
              <LocationTypeSelect
                value={startSelection.nearestType || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStartSelection({ ...startSelection, nearestType: e.target.value })}
              >
                <option value="">Select Building Type</option>
                <option value="bank">Nearest Bank</option>
                <option value="pub">Nearest Pub</option>
                <option value="transit">Nearest Transit Station</option>
              </LocationTypeSelect>
              <HelpText>Find nearest building of selected type</HelpText>
            </>
          )}

          {startSelection.type === 'reported' && (
            <>
              <LocationTypeSelect
                value={startSelection.reportedLocationId || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStartSelection({ ...startSelection, reportedLocationId: e.target.value })}
              >
                <option value="">Select Reported Location</option>
                {reportedLocations.filter(loc => loc.buildingType === 'guild').map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.buildingName} (Guild Level {location.guildLevel})
                  </option>
                ))}
                {reportedLocations.filter(loc => loc.buildingType === 'shop').map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.buildingName} (Shop)
                  </option>
                ))}
                {reportedLocations.filter(loc => loc.buildingType === 'hunter').map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.buildingName} (Hunter)
                  </option>
                ))}
                {reportedLocations.filter(loc => loc.buildingType === 'paladin').map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.buildingName} (Paladin)
                  </option>
                ))}
                {reportedLocations.filter(loc => loc.buildingType === 'werewolf').map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.buildingName} (Werewolf)
                  </option>
                ))}
              </LocationTypeSelect>
              <HelpText>Select from currently reported locations</HelpText>
            </>
          )}
        </InputSection>

        {renderDestinationInput()}

        <ButtonGroup>
          <Button $variant="primary" onClick={handleCalculateRoute}>
            Calculate Route
          </Button>
          <Button onClick={handleClearNavigation}>
            Clear
          </Button>
        </ButtonGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {pathfindingResult && (
          <RouteSection>
            <RouteOption $isRecommended={true}>
              <RouteTitle>
                🎯 Recommended Route (<MovesDisplay>{pathfindingResult.recommendedRoute.totalMoves} moves</MovesDisplay>)
              </RouteTitle>
              <RouteDescription>
                {getRouteDescription(pathfindingResult.recommendedRoute)}
              </RouteDescription>
              <div style={{ marginTop: '8px' }}>
                <Button onClick={() => handleSelectRoute(pathfindingResult.recommendedRoute)}>
                  Use This Route
                </Button>
              </div>
            </RouteOption>

            <RouteOption>
              <RouteTitle>
                🚶 Walking Route (<MovesDisplay>{pathfindingResult.walkingRoute.totalMoves} moves</MovesDisplay>)
              </RouteTitle>
              <RouteDescription>
                {getRouteDescription(pathfindingResult.walkingRoute)}
              </RouteDescription>
              <div style={{ marginTop: '8px' }}>
                <Button onClick={() => handleSelectRoute(pathfindingResult.walkingRoute)}>
                  Use Walking Route
                </Button>
              </div>
            </RouteOption>

            {pathfindingResult.transitRoute && (
              <RouteOption>
                <RouteTitle>
                  🚇 Transit Route (<MovesDisplay>{pathfindingResult.transitRoute.totalMoves} moves</MovesDisplay>)
                </RouteTitle>
                <RouteDescription>
                  {getRouteDescription(pathfindingResult.transitRoute)}
                </RouteDescription>
                <div style={{ marginTop: '8px' }}>
                  <Button onClick={() => pathfindingResult.transitRoute && handleSelectRoute(pathfindingResult.transitRoute)}>
                    Use Transit Route
                  </Button>
                </div>
              </RouteOption>
            )}
          </RouteSection>
        )}
      </NavigationContent>
    </NavigationContainer>
  );
};