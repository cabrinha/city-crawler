import { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { Coordinate, Route, PathfindingResult, NavigationState } from '../types/game';
import {
  findOptimalRoute,
  getRouteDescription,
  parseCoordinateInput
} from '../services/navigation';

const NavigationContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  border: 1px solid #666;
  min-width: 280px;
  max-width: 320px;
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
  }

  &::after {
    content: '${props => props.$isVisible ? '▼' : '▶'}';
    font-size: 12px;
    color: #ccc;
  }
`;

const NavigationContent = styled.div<{ $isVisible: boolean }>`
  padding: ${props => props.$isVisible ? '15px' : '0'};
  max-height: ${props => props.$isVisible ? '600px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
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

const Input = styled.input`
  width: 100%;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border: 1px solid #666;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #00ff00;
  }

  &::placeholder {
    color: #999;
  }
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

const QuickLocationButton = styled.button`
  padding: 4px 8px;
  margin: 2px 4px 2px 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ccc;
  border: 1px solid #555;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
    border-color: #777;
    color: white;
  }
`;

interface NavigationPanelProps {
  playerLocation?: Coordinate;
  navigationState: NavigationState;
  onNavigationChange: (state: NavigationState) => void;
  onRouteSelect: (route: Route) => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  playerLocation,
  navigationState,
  onNavigationChange,
  onRouteSelect
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [startInput, setStartInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [pathfindingResult, setPathfindingResult] = useState<PathfindingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update input when navigation state changes
  useEffect(() => {
    if (navigationState.startLocation) {
      setStartInput(`${navigationState.startLocation.x},${navigationState.startLocation.y}`);
    }
    if (navigationState.destination) {
      setDestinationInput(`${navigationState.destination.x},${navigationState.destination.y}`);
    }
  }, [navigationState.startLocation, navigationState.destination]);

  const handleUseCurrentLocation = () => {
    if (playerLocation) {
      setStartInput(`${playerLocation.x},${playerLocation.y}`);
      setError(null);
    }
  };

  const handleCalculateRoute = () => {
    setError(null);

    const startCoord = parseCoordinateInput(startInput);
    const destCoord = parseCoordinateInput(destinationInput);

    if (!startCoord) {
      setError('Invalid start location. Use format: "x,y" (e.g., "50,75")');
      return;
    }

    if (!destCoord) {
      setError('Invalid destination. Use format: "x,y" (e.g., "100,150")');
      return;
    }

    if (startCoord.x === destCoord.x && startCoord.y === destCoord.y) {
      setError('Start and destination cannot be the same.');
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
    setStartInput('');
    setDestinationInput('');
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

  const quickLocations = [
    { name: 'Center', coord: { x: 100, y: 100 } },
    { name: 'Bank District', coord: { x: 67, y: 67 } },
    { name: 'Transit Hub', coord: { x: 101, y: 101 } },
  ];

  return (
    <NavigationContainer>
      <NavigationHeader
        $isVisible={isVisible}
        onClick={() => setIsVisible(!isVisible)}
      >
        <h3>🧭 Navigation</h3>
      </NavigationHeader>

      <NavigationContent $isVisible={isVisible}>
        <InputSection>
          <Label>Start Location</Label>
          <Input
            type="text"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            placeholder="e.g., 50,75 or current location"
          />
          <div style={{ marginTop: '5px' }}>
            <Button onClick={handleUseCurrentLocation}>Use Current Location</Button>
          </div>
        </InputSection>

        <InputSection>
          <Label>Destination</Label>
          <Input
            type="text"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            placeholder="e.g., 100,150"
          />
          <div style={{ marginTop: '5px' }}>
            {quickLocations.map((location) => (
              <QuickLocationButton
                key={location.name}
                onClick={() => setDestinationInput(`${location.coord.x},${location.coord.y}`)}
              >
                {location.name}
              </QuickLocationButton>
            ))}
          </div>
          <HelpText>
            Enter coordinates as "x,y" (e.g., "50,75"). Coordinates range from 1-200.
          </HelpText>
        </InputSection>

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