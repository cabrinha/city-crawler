import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import type { Coordinate, Building, NavigationState, Route, RouteStep } from '../types/game';
import { CITY_SIZE, getBuildingAt, getLocationName, getDistanceScore, BUILDINGS } from '../data/cityData';
import { ApiService } from '../services/api';
import type { ReportedLocation } from '../types/game';
import { NavigationPanel } from './NavigationPanel';

const MapContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #000000; /* Match BODY { background-color:#000000; } from game CSS */
  position: relative;
  overflow: hidden;
`;

const Controls = styled.div`
  position: absolute;
  top: 80px;
  left: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NearestBuildingsWidget = styled.div`
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  border: 1px solid #666;
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
`;

const WidgetHeader = styled.div<{ $isVisible: boolean }>`
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
    fontSize: 14px;
  }

  &::after {
    content: '${props => props.$isVisible ? '▼' : '▶'}';
    font-size: 12px;
    color: #ccc;
  }
`;

const WidgetContent = styled.div<{ $isVisible: boolean }>`
  padding: ${props => props.$isVisible ? '15px' : '0'};
  max-height: ${props => props.$isVisible ? '400px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
`;

const BuildingList = styled.div`
  margin-bottom: 15px;
`;

const BuildingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #444;
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }
`;

const BuildingName = styled.span`
  flex: 1;
  margin-right: 10px;
`;

const Distance = styled.span`
  color: #00ff00;
  font-weight: bold;
`;



const PerformanceStats = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #666;
  font-size: 12px;
`;

interface TileData {
  x: number;
  y: number;
  building?: Building;
  reportedLocation?: ReportedLocation;
  isStrategic: boolean;
  isPlayer: boolean;
  tileType: 'street' | 'city' | 'intersect';
  streetName?: string; // For intersections
  tileColor: string;
  distanceScore: number;
}

interface D3CityMapProps {
  playerLocation?: Coordinate;
}

// Utility function to calculate Manhattan distance
const calculateDistance = (a: Coordinate, b: Coordinate): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Utility function to find nearest buildings of a specific type
const findNearestBuildings = (playerLocation: Coordinate, buildingType: string): (Building & { distance: number })[] => {
  const buildings = BUILDINGS.filter((b: Building) => b.type === buildingType);
  return buildings
    .map((building: Building) => ({
      ...building,
      distance: calculateDistance(playerLocation, building.coordinate)
    }))
    .sort((a: Building & { distance: number }, b: Building & { distance: number }) => a.distance - b.distance)
    .slice(0, 3); // Return top 3 nearest
};

// Helper function to fit the entire map to view
const fitMapToView = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, zoom: d3.ZoomBehavior<SVGSVGElement, unknown>, width: number, height: number, tileSize: number) => {
  const mapWidth = CITY_SIZE * tileSize;
  const mapHeight = CITY_SIZE * tileSize;

  const scale = Math.min(width / mapWidth, height / mapHeight) * 0.9; // 90% of available space
  const centerX = (width - mapWidth * scale) / 2;
  const centerY = (height - mapHeight * scale) / 2;

  svg.transition()
    .duration(1000)
    .call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale));
};

// Helper function to center on a specific location
const centerOnLocation = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, zoom: d3.ZoomBehavior<SVGSVGElement, unknown>, location: Coordinate, width: number, height: number, tileSize: number) => {
  const scale = 2;
  const centerX = width / 2 - (location.x - 1) * tileSize * scale;
  const centerY = height / 2 - (location.y - 1) * tileSize * scale;

  svg.transition()
    .duration(1000)
    .call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale));
};

// Helper function to fit a route to view
const fitRouteToView = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, zoom: d3.ZoomBehavior<SVGSVGElement, unknown>, route: Route, width: number, height: number, tileSize: number) => {
  if (route.steps.length === 0) return;

  // Find bounding box of the route
  const coordinates = route.steps.map(step => step.coordinate);
  const minX = Math.min(...coordinates.map(c => c.x));
  const maxX = Math.max(...coordinates.map(c => c.x));
  const minY = Math.min(...coordinates.map(c => c.y));
  const maxY = Math.max(...coordinates.map(c => c.y));

  // Add padding
  const padding = 5;
  const routeWidth = (maxX - minX + 2 * padding) * tileSize;
  const routeHeight = (maxY - minY + 2 * padding) * tileSize;

  // Calculate scale to fit route with padding
  const scale = Math.min(width / routeWidth, height / routeHeight) * 0.8; // 80% of available space

  // Center on the middle of the route
  const centerX = width / 2 - ((minX + maxX) / 2 - 1) * tileSize * scale;
  const centerY = height / 2 - ((minY + maxY) / 2 - 1) * tileSize * scale;

  svg.transition()
    .duration(1000)
    .call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale));
};

export const D3CityMap: React.FC<D3CityMapProps> = ({
  playerLocation
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [renderTime, setRenderTime] = useState(0);
  const [visibleTiles, setVisibleTiles] = useState(0);
  const [hoveredCoordinates, setHoveredCoordinates] = useState<Coordinate | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinate | null>(null);
  const [isCoordinatesLocked, setIsCoordinatesLocked] = useState(false);
  const [isNearestBuildingsVisible, setIsNearestBuildingsVisible] = useState(true);
  const [reportedLocations, setReportedLocations] = useState<ReportedLocation[]>([]);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    showRouteOnMap: false
  });

  // Load reported locations on component mount
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

  // Calculate nearest buildings (only if player location is set)
  const nearestBanks = playerLocation ? findNearestBuildings(playerLocation, 'bank') : [];
  const nearestPubs = playerLocation ? findNearestBuildings(playerLocation, 'pub') : [];
  const nearestTransit = playerLocation ? findNearestBuildings(playerLocation, 'transit') : [];

  // Define colors to match the actual game CSS from blood.css
  const colors = {
    street: '#444444',        // TD.street { background-color:#444444; }
    city: '#000000',          // TD.city has black background
    intersect: '#444444',     // Gray background like streets
    intersectSign: '#008800', // Green rectangle for street signs
    citylimit: '#0088ff',     // Bright blue for city limits border
    transit: '#880000',       // SPAN.transit { background-color:#880000; }
    pub: '#887700',           // SPAN.pub { background-color:#887700; }
    shop: '#004488',          // SPAN.shop { background-color:#004488; }
    bank: '#0000ff',          // SPAN.bank { background-color:#0000ff; }
    hidden: '#660066',        // Dark purple for hidden buildings
    lair: '#660022',          // SPAN.lair { background-color:#660022; }
    guild: '#4400aa',         // Purple for guilds
    strategic: '#008800',     // Green for strategic locations
    player: '#ff0000',        // Red for player location
    grid: '#ffffff',          // White borders
    text: '#ffffff'           // White text
  };

  // Define tile size for consistent rendering (larger for better visibility)
  const tileSize = 12;

  const createGridData = useCallback((): TileData[] => {
    const data: TileData[] = [];

    for (let x = 1; x <= CITY_SIZE; x++) {
      for (let y = 1; y <= CITY_SIZE; y++) {
        const building = getBuildingAt(x, y);
        const reportedLocation = reportedLocations.find(loc =>
          loc.coordinate.x === x && loc.coordinate.y === y
        );
        const distanceScore = getDistanceScore(x, y);
        const isPlayer = playerLocation ? (playerLocation.x === x && playerLocation.y === y) : false;

        // Determine tile type based on coordinate pattern
        let tileType: 'street' | 'city' | 'intersect';
        let streetName: string | undefined;

        const xIsOdd = x % 2 === 1;
        const yIsOdd = y % 2 === 1;

        if (xIsOdd && yIsOdd) {
          // City block - both coordinates are odd (1,1), (1,3), (3,1), etc.
          tileType = 'city';
        } else if (xIsOdd || yIsOdd) {
          // Street - one coordinate is odd, one is even
          tileType = 'street';
        } else {
          // Intersection - both coordinates are even (2,2), (4,4), etc.
          tileType = 'intersect';
          streetName = getLocationName(x, y);
        }

        // Create a hashmap of tile colors based on distance score
        // rgba value for grey streets and intersects is 44, 44, 44
        let tileColor = {
          city: `rgba(0, 255, 0, ${Math.min(distanceScore * 6, 0.6)})`,
          intersect: `rgb(68, ${500 * distanceScore + 68}, 68)`,
          street: `rgb(68, ${500 * distanceScore + 68}, 68)`
        }[tileType];

        // Add building colors on top of base tile color
        if (isPlayer) {
          tileColor = colors.player;
        } else if (reportedLocation) {
          // Reported locations take precedence over static buildings
          switch (reportedLocation.buildingType) {
            case 'shop': tileColor = colors.shop; break;
            case 'guild': tileColor = colors.guild; break;
            case 'hunter': tileColor = '#0BDA51'; break;  // Bright Green for hunters
            case 'paladin': tileColor = '#90D5FF'; break; // Light blue for paladins
            case 'werewolf': tileColor = '#cc9933'; break; // Orange for werewolves
            case 'item': tileColor = '#cccc33'; break;     // Gold for items
            default: tileColor = colors.shop; break;
          }
        } else if (building) {
          // Buildings use their specific colors from the game CSS
          switch (building.type) {
            case 'transit': tileColor = colors.transit; break;  // #880000
            case 'pub': tileColor = colors.pub; break;          // #887700
            case 'shop': tileColor = colors.shop; break;        // #004488
            case 'bank': tileColor = colors.bank; break;        // #0000ff
            case 'other': tileColor = colors.hidden; break;     // #660066
            case 'lair': tileColor = colors.lair; break;        // #660022
            case 'guild': tileColor = colors.guild; break;      // #4400aa
            default: break; // Keep base tile color
          }
        }

        data.push({
          x,
          y,
          building,
          reportedLocation,
          isStrategic: distanceScore > 0,
          isPlayer,
          tileType,
          streetName,
          tileColor,
          distanceScore
        });
      }
    }

    return data;
  }, [playerLocation, reportedLocations]);

  useEffect(() => {
    if (!svgRef.current) return;

    const startTime = performance.now();

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.attr('width', width).attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group for zooming/panning
    const g = svg.append('g').attr('class', 'map-group');

    // Create grid data
    const gridData = createGridData();

    // Create tiles with optimized rendering
    const tiles = g.selectAll('.tile')
      .data(gridData)
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .attr('x', (d: TileData) => (d.x - 1) * tileSize)
      .attr('y', (d: TileData) => (d.y - 1) * tileSize)
      .attr('width', tileSize - 0.1)
      .attr('height', tileSize - 0.1)
      .attr('fill', (d: TileData) => d.tileColor)
      .attr('stroke', colors.grid)  // White borders like the game
      .attr('stroke-width', 0.1)
      .style('cursor', 'pointer')
      .on('click', function(_event, d: TileData) {
        // Update selected coordinates state and lock for 3 seconds
        setSelectedCoordinates({ x: d.x, y: d.y });
        setIsCoordinatesLocked(true);

        // Clear the lock after 3 seconds
        setTimeout(() => {
          setIsCoordinatesLocked(false);
          setSelectedCoordinates(null);
        }, 3000);

        // Highlight selected tile
        tiles.attr('stroke-width', 0.1).attr('stroke', colors.grid);
        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2);
      });

    // Add building labels (only visible at higher zoom levels)
    const buildingLabels = g.selectAll('.building-label')
      .data(gridData.filter(d => d.building || d.reportedLocation))
      .enter()
      .append('text')
      .attr('class', 'building-label')
      .attr('x', (d: TileData) => (d.x - 1) * tileSize + tileSize / 2)
      .attr('y', (d: TileData) => (d.y - 1) * tileSize + tileSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .style('display', 'none') // Hidden by default
      .text((d: TileData) => {
        // Reported locations take precedence
        if (d.reportedLocation) {
          switch (d.reportedLocation.buildingType) {
            case 'shop': return 'S';
            case 'guild': return 'G';
            case 'hunter': return 'H';
            case 'paladin': return 'P';
            case 'werewolf': return 'W';
            case 'item': return 'I';
            default: return '?';
          }
        }
        if (!d.building) return '';
        switch (d.building.type) {
          case 'transit': return 'T';
          case 'pub': return 'P';
          case 'shop': return 'S';
          case 'bank': return 'B';
          case 'other': return 'H';
          case 'lair': return 'L';
          case 'guild': return 'G';
          default: return '';
        }
      });

    // Add reported location confidence indicators
    const reportedLocationIndicators = g.selectAll('.reported-indicator')
      .data(gridData.filter(d => d.reportedLocation))
      .enter()
      .append('circle')
      .attr('class', 'reported-indicator')
      .attr('cx', (d: TileData) => (d.x - 1) * tileSize + tileSize * 0.8)
      .attr('cy', (d: TileData) => (d.y - 1) * tileSize + tileSize * 0.2)
      .attr('r', tileSize * 0.15)
      .attr('fill', (d: TileData) =>
        d.reportedLocation?.confidence === 'confirmed' ? '#00ff00' : '#ffaa00'
      )
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .style('display', 'none'); // Hidden by default, shown at high zoom

    // Add player marker (only if player location is set)
    const playerMarker = playerLocation ? g.append('text')
      .attr('class', 'player-marker')
      .attr('x', (playerLocation.x - 1) * tileSize + tileSize / 2)
      .attr('y', (playerLocation.y - 1) * tileSize + tileSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('★') : g.append('g'); // Empty group if no player location

    // Add start location marker (when "Calculate Route" is clicked)
    const startLocationMarker = (navigationState.isNavigating && navigationState.startLocation) ?
      g.append('circle')
        .attr('class', 'start-location-marker')
        .attr('cx', (navigationState.startLocation.x - 1) * tileSize + tileSize / 2)
        .attr('cy', (navigationState.startLocation.y - 1) * tileSize + tileSize / 2)
        .attr('r', tileSize * 0.4)
        .attr('fill', '#00ff00')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('opacity', 0.8) : g.append('g'); // Empty group if no start location

    // Add start location marker text
    const startLocationText = (navigationState.isNavigating && navigationState.startLocation) ?
      g.append('text')
        .attr('class', 'start-location-text')
        .attr('x', (navigationState.startLocation.x - 1) * tileSize + tileSize / 2)
        .attr('y', (navigationState.startLocation.y - 1) * tileSize + tileSize / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('START') : g.append('g'); // Empty group if no start location

    // Add route visualization if navigation is active
    if (navigationState.showRouteOnMap && navigationState.currentRoute) {
      const route = navigationState.currentRoute;

      // Draw route line connecting all steps
      if (route.steps.length > 1) {
        const lineGenerator = d3.line<RouteStep>()
          .x((d) => (d.coordinate.x - 1) * tileSize + tileSize / 2)
          .y((d) => (d.coordinate.y - 1) * tileSize + tileSize / 2)
          .curve(d3.curveLinear);

        // Main route line
        g.append('path')
          .datum(route.steps)
          .attr('class', 'route-line')
          .attr('d', lineGenerator)
          .attr('stroke', route.usesTransit ? '#00ccff' : '#00ff00')
          .attr('stroke-width', 3)
          .attr('fill', 'none')
          .attr('stroke-dasharray', route.usesTransit ? '5,5' : 'none')
          .style('opacity', 0.8);

        // Add route markers for each step
        route.steps.forEach((step, index) => {
          if (index === 0) {
            // Start marker
            g.append('circle')
              .attr('class', 'route-marker start')
              .attr('cx', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('cy', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('r', tileSize * 0.3)
              .attr('fill', '#00ff00')
              .attr('stroke', 'white')
              .attr('stroke-width', 2);

            g.append('text')
              .attr('class', 'route-marker-text')
              .attr('x', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('y', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', 'black')
              .attr('font-size', '8px')
              .attr('font-weight', 'bold')
              .text('S');
          } else if (index === route.steps.length - 1) {
            // End marker
            g.append('circle')
              .attr('class', 'route-marker end')
              .attr('cx', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('cy', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('r', tileSize * 0.3)
              .attr('fill', '#ff0000')
              .attr('stroke', 'white')
              .attr('stroke-width', 2);

            g.append('text')
              .attr('class', 'route-marker-text')
              .attr('x', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('y', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', 'white')
              .attr('font-size', '8px')
              .attr('font-weight', 'bold')
              .text('E');
          } else if (step.action === 'transit') {
            // Transit station marker
            g.append('circle')
              .attr('class', 'route-marker transit')
              .attr('cx', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('cy', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('r', tileSize * 0.25)
              .attr('fill', '#00ccff')
              .attr('stroke', 'white')
              .attr('stroke-width', 1);

            g.append('text')
              .attr('class', 'route-marker-text')
              .attr('x', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('y', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', 'black')
              .attr('font-size', '6px')
              .attr('font-weight', 'bold')
              .text('T');
          }
        });
      }
    }

    // Add green street sign rectangles for intersections
    const streetSigns = g.selectAll('.street-sign')
      .data(gridData.filter(d => d.tileType === 'intersect' && d.streetName))
      .enter()
      .append('rect')
      .attr('class', 'street-sign')
      .attr('x', (d: TileData) => (d.x - 1) * tileSize + tileSize * 0.1)
      .attr('y', (d: TileData) => (d.y - 1) * tileSize + tileSize * 0.1)
      .attr('width', tileSize * 0.8)
      .attr('height', tileSize * 0.3)
      .attr('fill', colors.intersectSign)
      .attr('stroke', 'none');

    // Add street name text on the green rectangles
    const streetNameLabels = g.selectAll('.street-name')
      .data(gridData.filter(d => d.tileType === 'intersect' && d.streetName))
      .enter()
      .append('text')
      .attr('class', 'street-name')
      .attr('x', (d: TileData) => (d.x - 1) * tileSize + tileSize / 2)
      .attr('y', (d: TileData) => (d.y - 1) * tileSize + tileSize * 0.25)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', `${tileSize * 0.25}px`)
      .attr('font-family', 'Verdana, Arial, sans-serif')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text((d: TileData) => d.streetName || '');

    // Zoom and pan behavior with performance optimizations
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8]) // Max zoom shows 3x3 grid (viewport width / (3 * tileSize))
      .on('zoom', (event) => {
        const { transform } = event;
        g.attr('transform', transform.toString());

        // Level-of-detail rendering
        const labelThreshold = 3;
        const detailThreshold = 1;
        const streetSignThreshold = 2;
        const indicatorThreshold = 4; // Show confidence indicators at high zoom

        buildingLabels.style('display', transform.k > labelThreshold ? 'block' : 'none');
        reportedLocationIndicators.style('display', transform.k > indicatorThreshold ? 'block' : 'none');
        playerMarker.style('display', transform.k > detailThreshold ? 'block' : 'none');

        // Show start location marker at all zoom levels when navigation is active
        startLocationMarker.style('display', navigationState.isNavigating ? 'block' : 'none');
        startLocationText.style('display', navigationState.isNavigating ? 'block' : 'none');

        // Show/hide street signs and street names based on zoom level
        streetSigns.style('display', transform.k > streetSignThreshold ? 'block' : 'none');
        streetNameLabels.style('display', transform.k > streetSignThreshold ? 'block' : 'none');

        // Update text scaling based on zoom level
        const baseFontSize = tileSize * 0.25;
        const scaledFontSize = Math.max(2, baseFontSize / Math.sqrt(transform.k));
        streetNameLabels.attr('font-size', `${scaledFontSize}px`);

        // Update building label scaling
        const buildingFontSize = Math.max(3, (tileSize * 0.3) / Math.sqrt(transform.k));
        buildingLabels.attr('font-size', `${buildingFontSize}px`);

        // Optimize stroke rendering at different zoom levels
        if (transform.k < 1) {
          tiles.attr('stroke', 'none');
        } else {
          tiles.attr('stroke', colors.grid).attr('stroke-width', 0.1); // Thinner white borders
        }

        // Calculate visible tiles for performance stats
        const viewportBounds = {
          left: -transform.x / transform.k,
          top: -transform.y / transform.k,
          right: (-transform.x + width) / transform.k,
          bottom: (-transform.y + height) / transform.k
        };

        const tilesInView = gridData.filter(d => {
          const tileX = (d.x - 1) * tileSize;
          const tileY = (d.y - 1) * tileSize;
          return tileX >= viewportBounds.left &&
                 tileX <= viewportBounds.right &&
                 tileY >= viewportBounds.top &&
                 tileY <= viewportBounds.bottom;
        }).length;

        setVisibleTiles(tilesInView);
      });

    // Store zoom behavior in ref for use by control buttons
    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Set initial view based on navigation state
    if (navigationState.showRouteOnMap && navigationState.currentRoute) {
      // Show entire route when "Use This Route" is clicked
      fitRouteToView(svg, zoom, navigationState.currentRoute, width, height, tileSize);
    } else if (navigationState.isNavigating && navigationState.startLocation) {
      // Center on start location when "Calculate Route" is clicked
      centerOnLocation(svg, zoom, navigationState.startLocation, width, height, tileSize);
    } else {
      // Default: show entire map when app starts up
      fitMapToView(svg, zoom, width, height, tileSize);
    }

    // Add tooltip functionality
    tiles.on('mouseover', function(event, d: TileData) {
      // Update hover coordinates if not locked
      if (!isCoordinatesLocked) {
        setHoveredCoordinates({ x: d.x, y: d.y });
      }

      d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0,0,0,0.9)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .html(`
          <strong>${d.tileType === 'intersect' && d.streetName ? d.streetName : getLocationName(d.x, d.y)}</strong><br/>
          ${d.reportedLocation ?
            `<span style="color: ${d.reportedLocation.buildingType === 'shop' ? '#4488ff' : '#aa44ff'}">
              ${d.reportedLocation.buildingType === 'guild' && d.reportedLocation.guildLevel
                ? `${d.reportedLocation.buildingName} ${d.reportedLocation.guildLevel}`
                : d.reportedLocation.buildingName} (reported ${d.reportedLocation.buildingType})
            </span><br/>
            <span style="color: ${d.reportedLocation.confidence === 'confirmed' ? '#00ff00' : '#ffaa00'}">
              ${d.reportedLocation.confidence === 'confirmed' ? 'Confirmed' : 'Unverified'}
            </span><br/>
            <span style="color: #ccc">
              Reported ${Math.floor((new Date().getTime() - d.reportedLocation.reportedAt.getTime()) / (1000 * 60 * 60))}h ago
              ${d.reportedLocation.reporterName ? ` by ${d.reportedLocation.reporterName}` : ''}
            </span><br/>` :
            d.building ? `${d.building.name} (${d.building.type})` :
            d.tileType === 'city' ? 'City Block' :
            d.tileType === 'intersect' ? 'Street Intersection' : 'Street'}<br/>
          ${d.distanceScore > 0 ? `<span style="color: #00ff00">Thieving Score: ${(d.distanceScore * 1000).toFixed(1)}%</span>` : ''}
          ${d.isPlayer ? '<span style="color: #ff0000">You are here!</span>' : ''}
        `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 10}px`);

      // Highlight the hovered tile
      d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2);
    })
    .on('mouseout', function() {
      // Clear hover coordinates if not locked
      if (!isCoordinatesLocked) {
        setHoveredCoordinates(null);
      }

      // Remove tooltip
      d3.selectAll('.tooltip').remove();

      // Reset stroke to default
      d3.select(this)
        .attr('stroke', colors.grid)
        .attr('stroke-width', 0.1);
    });

    const endTime = performance.now();
    setRenderTime(endTime - startTime);
    setVisibleTiles(gridData.length);

    // Cleanup function
    return () => {
      d3.selectAll('.tooltip').remove();
    };
  }, [playerLocation, createGridData, isCoordinatesLocked, navigationState]);



  const handleNavigationChange = (newState: NavigationState) => {
    setNavigationState(newState);
  };

  const handleRouteSelect = (route: Route) => {
    setNavigationState(prev => ({
      ...prev,
      currentRoute: route,
      showRouteOnMap: true
    }));

    // Immediately fit the route to view when a route is selected
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3.select(svgRef.current);
      const width = window.innerWidth;
      const height = window.innerHeight;
      fitRouteToView(svg, zoomBehaviorRef.current, route, width, height, tileSize);
    }
  };

  return (
    <MapContainer>
      <svg ref={svgRef} style={{ display: 'block' }} />

      <Controls>
        <NavigationPanel
          playerLocation={playerLocation}
          navigationState={navigationState}
          onNavigationChange={handleNavigationChange}
          onRouteSelect={handleRouteSelect}
        />
      </Controls>

      <NearestBuildingsWidget>
        <WidgetHeader
          $isVisible={isNearestBuildingsVisible}
          onClick={() => setIsNearestBuildingsVisible(!isNearestBuildingsVisible)}
        >
          <h3>Nearest Buildings</h3>
        </WidgetHeader>
        <WidgetContent $isVisible={isNearestBuildingsVisible}>
          <BuildingList>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#0000ff' }}>Banks</h4>
            {nearestBanks.map((bank) => (
              <BuildingItem key={bank.id}>
                <BuildingName>{getLocationName(bank.coordinate.x, bank.coordinate.y)}</BuildingName>
                <Distance>{bank.distance} blocks</Distance>
              </BuildingItem>
            ))}
          </BuildingList>

          <BuildingList>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#887700' }}>Pubs</h4>
            {nearestPubs.map((pub) => (
              <BuildingItem key={pub.id}>
                <BuildingName>{pub.name}</BuildingName>
                <Distance>{pub.distance} blocks</Distance>
              </BuildingItem>
            ))}
          </BuildingList>

          <BuildingList>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#880000' }}>Transit</h4>
            {nearestTransit.map((transit) => (
              <BuildingItem key={transit.id}>
                <BuildingName>{transit.name}</BuildingName>
                <Distance>{transit.distance} blocks</Distance>
              </BuildingItem>
            ))}
          </BuildingList>
        </WidgetContent>
      </NearestBuildingsWidget>

      <PerformanceStats>
        <div><strong>Performance Stats:</strong></div>
        <div>Render Time: {renderTime.toFixed(1)}ms</div>
        <div>Visible Tiles: {visibleTiles.toLocaleString()}</div>
        <div>Coordinates: {
          selectedCoordinates
            ? `${selectedCoordinates.x}, ${selectedCoordinates.y}${isCoordinatesLocked ? ' (locked)' : ''}`
            : hoveredCoordinates
              ? `${hoveredCoordinates.x}, ${hoveredCoordinates.y}`
              : 'None'
        }</div>
      </PerformanceStats>
    </MapContainer>
  );
};