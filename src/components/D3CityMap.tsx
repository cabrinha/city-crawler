import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import type { Coordinate, Building, NavigationState, Route, RouteStep } from '../types/game';
import { CITY_SIZE, getBuildingAt, getLocationName, getDistanceScore, BUILDINGS } from '../data/cityData';
import { findOptimalRoute } from '../services/navigation';
import { displayName } from './LocationsPanel';
import type { ReportedLocation } from '../types/game';
import { NavigationPanel } from './NavigationPanel';
import { formatReportersTooltip } from '../utils/formatters';

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  background-color: #000000; /* Match BODY { background-color:#000000; } from game CSS */
  position: relative;
  overflow: hidden;

  canvas, svg {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
  }
  canvas { pointer-events: none; }
`;

const Controls = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 640px) {
    left: 10px;
  }
`;

const Panel = styled.div`
  position: absolute;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  border: 1px solid #666;
  font-size: 12px;
`;

const NearestBuildingsWidget = styled(Panel)`
  top: 16px;
  right: 16px;
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;

  @media (max-width: 640px) {
    top: auto;
    bottom: 20px;
    right: 10px;
    left: 10px;
    max-height: 40vh;
  }
`;

const Hint = styled(Panel)`
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 14px;
  color: #ccc;
  white-space: nowrap;
  animation: hint-fade 1s ease 10s forwards;
  @keyframes hint-fade { to { opacity: 0; visibility: hidden; } }

  @media (max-width: 640px) { display: none; }
`;


const DetailCard = styled(Panel)`
  top: 16px;
  right: 16px;
  width: 260px;
  padding: 12px 14px;
  b { display: block; font-size: 14px; margin-bottom: 6px; }
  .row { display: flex; justify-content: space-between; margin: 3px 0; color: #ccc; }
  .row span:last-child { color: #00ff00; }
  .row .warn { color: #ff4444; }
  .btn {
    margin-top: 10px; display: block; width: 100%; background: #cc3333; color: #fff; border: 1px solid #ff6666;
    padding: 7px; font-weight: bold; font-family: inherit; cursor: pointer;
  }
  .btn:disabled { background: #333; border-color: #444; color: #888; cursor: default; }
  .close { position: absolute; top: 6px; right: 10px; color: #888; cursor: pointer; }
  @media (max-width: 640px) { top: auto; bottom: 16px; left: 10px; right: 10px; width: auto; }
`;
const Stale = styled(Panel)`
  bottom: 16px;
  left: 16px;
  padding: 8px 12px;
  border-color: #c9a227;
  color: #c9a227;
`;

const Swatch = styled.span<{ $color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  background: ${p => p.$color};
  border: 1px solid #888;
  vertical-align: middle;
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
    font-size: 14px;
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

  h4 {
    margin: 0 0 5px 0;
    font-size: 12px;
    color: #fff;
  }
`;

const BuildingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #444;

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

// Colors match the game's blood.css. One table drives tile fill, map letter and legend.
const BUILDING_STYLE: Record<string, { color: string; letter: string }> = {
  transit:  { color: '#880000', letter: 'T' },
  pub:      { color: '#887700', letter: 'P' },
  shop:     { color: '#004488', letter: 'S' },
  bank:     { color: '#0000ff', letter: 'B' },
  other:    { color: '#660066', letter: 'H' },
  lair:     { color: '#660022', letter: 'L' },
  guild:    { color: '#4400aa', letter: 'G' },
  hunter:   { color: '#0BDA51', letter: 'H' },
  paladin:  { color: '#90D5FF', letter: 'P' },
  werewolf: { color: '#cc9933', letter: 'W' },
  item:     { color: '#cccc33', letter: 'I' },
};
const COLOR_PLAYER = '#ff0000';
const COLOR_SIGN = '#008800';
const tileSize = 12;

// Plain frame around the map, drawn once into the tile bitmap (world units).
const FRAME_W = 48;
const drawFrame = (ctx: CanvasRenderingContext2D, size: number) => {
  const g = ctx.createLinearGradient(-FRAME_W, -FRAME_W, size + FRAME_W, size + FRAME_W);
  g.addColorStop(0, '#8a6516'); g.addColorStop(0.5, '#e0b84a'); g.addColorStop(1, '#6b4a10');
  ctx.fillStyle = g;
  ctx.fillRect(-FRAME_W, -FRAME_W, size + 2 * FRAME_W, size + 2 * FRAME_W);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size); // tiles are translucent; keep the map on black
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeRect(-FRAME_W + 1.5, -FRAME_W + 1.5, size + 2 * FRAME_W - 3, size + 2 * FRAME_W - 3); // outer line
  ctx.strokeRect(-FRAME_W / 2, -FRAME_W / 2, size + FRAME_W, size + FRAME_W);                     // middle rule
  ctx.strokeRect(-1.5, -1.5, size + 3, size + 3);                                                  // inner line
};

interface TileData {
  x: number;
  y: number;
  building?: Building;
  reportedLocation?: ReportedLocation;
  isPlayer: boolean;
  tileType: 'street' | 'city' | 'intersect';
  streetName?: string; // For intersections
  tileColor: string;
  distanceScore: number;
}

interface D3CityMapProps {
  playerLocation?: Coordinate;
  onPlayerLocationChange?: (coord: Coordinate) => void;
  reportedLocations: ReportedLocation[];
  selected?: ReportedLocation | null;
  onSelect: (l: ReportedLocation | null) => void;
  shopsMoveInMs: number;
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
const fitMapToView = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, zoom: d3.ZoomBehavior<SVGSVGElement, unknown>, width: number, height: number, tileSize: number, animate = true) => {
  const mapWidth = CITY_SIZE * tileSize + 2 * FRAME_W;
  const mapHeight = mapWidth;

  const scale = Math.min(width / mapWidth, height / mapHeight) * 0.92;
  const centerX = (width - mapWidth * scale) / 2 + FRAME_W * scale;
  const centerY = (height - mapHeight * scale) / 2 + FRAME_W * scale;

  const t = d3.zoomIdentity.translate(centerX, centerY).scale(scale);
  if (animate) svg.transition().duration(1000).call(zoom.transform, t);
  else svg.call(zoom.transform, t);
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

const buildGrid = (reportedLocations: ReportedLocation[]): TileData[] => {
  const reported = new Map(reportedLocations.map(l => [`${l.coordinate.x},${l.coordinate.y}`, l]));
  const data: TileData[] = [];
  // Row-major: index = (y-1)*CITY_SIZE + (x-1)
  for (let y = 1; y <= CITY_SIZE; y++) {
    for (let x = 1; x <= CITY_SIZE; x++) {
      const building = getBuildingAt(x, y);
      const reportedLocation = reported.get(`${x},${y}`);
      const distanceScore = getDistanceScore(x, y);
      const xIsOdd = x % 2 === 1;
      const yIsOdd = y % 2 === 1;
      const tileType: TileData['tileType'] = xIsOdd && yIsOdd ? 'city' : xIsOdd || yIsOdd ? 'street' : 'intersect';
      const streetName = tileType === 'intersect' ? getLocationName(x, y) : undefined;

      let tileColor = tileType === 'city'
        ? `rgba(0, 255, 0, ${Math.min(distanceScore * 6, 0.6)})`
        : `rgb(68, ${500 * distanceScore + 68}, 68)`;
      // Reported locations take precedence over static buildings
      const styleKey = reportedLocation?.buildingType ?? building?.type;
      if (styleKey && BUILDING_STYLE[styleKey]) tileColor = BUILDING_STYLE[styleKey].color;

      data.push({ x, y, building, reportedLocation, isPlayer: false, tileType, streetName, tileColor, distanceScore });
    }
  }
  return data;
};

const tileLetter = (d: TileData): string => {
  const key = d.reportedLocation?.buildingType ?? d.building?.type;
  return key ? (BUILDING_STYLE[key]?.letter ?? '?') : '';
};

const tooltipHtml = (d: TileData): string => `
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
      by ${formatReportersTooltip(d.reportedLocation.allReporters, d.reportedLocation.reporterName)}
    </span><br/>` :
    d.building ? `${d.building.name} (${d.building.type})` :
    d.tileType === 'city' ? 'City Block' :
    d.tileType === 'intersect' ? 'Street Intersection' : 'Street'}<br/>
  ${d.distanceScore > 0 ? `<span style="color: #00ff00">Thieving Score: ${(d.distanceScore * 1000).toFixed(1)}%</span>` : ''}
  ${d.isPlayer ? '<span style="color: #ff0000">You are here!</span>' : ''}
`;

export const D3CityMap: React.FC<D3CityMapProps> = ({
  playerLocation,
  onPlayerLocationChange,
  reportedLocations,
  selected,
  onSelect,
  shopsMoveInMs,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  // Main g element for the route overlay (SVG stays only for the few overlay nodes).
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const transformRef = useRef(d3.zoomIdentity);
  const hoveredRef = useRef<TileData | null>(null);
  const onPlayerLocationChangeRef = useRef(onPlayerLocationChange);
  onPlayerLocationChangeRef.current = onPlayerLocationChange;

  const [isNearestBuildingsVisible, setIsNearestBuildingsVisible] = useState(true);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    showRouteOnMap: false
  });

  // Only compute nearest buildings once the player has set a real location (x > 0)
  const validPlayerLocation = playerLocation && playerLocation.x > 0 ? playerLocation : null;
  const nearestBanks = validPlayerLocation ? findNearestBuildings(validPlayerLocation, 'bank') : [];
  const nearestPubs = validPlayerLocation ? findNearestBuildings(validPlayerLocation, 'pub') : [];
  const nearestTransit = validPlayerLocation ? findNearestBuildings(validPlayerLocation, 'transit') : [];

  // Grid data + an offscreen bitmap of all tile fills. Rebuilt only when reports change.
  const grid = useMemo(() => buildGrid(reportedLocations), [reportedLocations]);
  const tileBitmap = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = CITY_SIZE * tileSize + 2 * FRAME_W;
    const ctx = c.getContext('2d')!;
    ctx.translate(FRAME_W, FRAME_W);
    drawFrame(ctx, CITY_SIZE * tileSize);
    for (const d of grid) {
      ctx.fillStyle = d.tileColor;
      ctx.fillRect((d.x - 1) * tileSize, (d.y - 1) * tileSize, tileSize - 0.1, tileSize - 0.1);
    }
    return c;
  }, [grid]);

  const tileAt = useCallback((x: number, y: number): TileData | undefined =>
    x >= 1 && x <= CITY_SIZE && y >= 1 && y <= CITY_SIZE ? grid[(y - 1) * CITY_SIZE + (x - 1)] : undefined, [grid]);

  // Draw one frame: bitmap + viewport-only detail (letters, street signs, player, hover).
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const t = transformRef.current;
    const w = canvas.width / dpr, h = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(dpr * t.k, 0, 0, dpr * t.k, dpr * t.x, dpr * t.y);
    ctx.imageSmoothingEnabled = t.k < 1;
    ctx.drawImage(tileBitmap, -FRAME_W, -FRAME_W);

    // Visible tile range
    const x0 = Math.max(1, Math.floor(-t.x / t.k / tileSize) + 1);
    const y0 = Math.max(1, Math.floor(-t.y / t.k / tileSize) + 1);
    const x1 = Math.min(CITY_SIZE, Math.ceil((w - t.x) / t.k / tileSize) + 1);
    const y1 = Math.min(CITY_SIZE, Math.ceil((h - t.y) / t.k / tileSize) + 1);

    const showSigns = t.k > 2, showLetters = t.k > 3, showIndicators = t.k > 4;
    if (showSigns || showLetters) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const signFont = `bold ${Math.max(2, (tileSize * 0.25) / Math.sqrt(t.k))}px Verdana, Arial, sans-serif`;
      const letterFont = `bold ${Math.max(3, (tileSize * 0.3) / Math.sqrt(t.k))}px sans-serif`;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const d = grid[(y - 1) * CITY_SIZE + (x - 1)];
          const px = (x - 1) * tileSize, py = (y - 1) * tileSize;
          if (showSigns && d.streetName) {
            ctx.fillStyle = COLOR_SIGN;
            ctx.fillRect(px + tileSize * 0.1, py + tileSize * 0.1, tileSize * 0.8, tileSize * 0.3);
            ctx.fillStyle = '#fff';
            ctx.font = signFont;
            ctx.fillText(d.streetName, px + tileSize / 2, py + tileSize * 0.25);
          }
          if (showLetters) {
            const letter = tileLetter(d);
            if (letter) {
              ctx.fillStyle = '#fff';
              ctx.font = letterFont;
              ctx.fillText(letter, px + tileSize / 2, py + tileSize / 2);
            }
          }
          if (showIndicators && d.reportedLocation) {
            ctx.beginPath();
            ctx.arc(px + tileSize * 0.8, py + tileSize * 0.2, tileSize * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = d.reportedLocation.confidence === 'confirmed' ? '#00ff00' : '#ffaa00';
            ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
    }

    if (t.k >= 1) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.1;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        ctx.strokeRect((x - 1) * tileSize, (y - 1) * tileSize, tileSize - 0.1, tileSize - 0.1);
      }
    }

    if (playerLocation && playerLocation.x > 0) {
      const px = (playerLocation.x - 1) * tileSize, py = (playerLocation.y - 1) * tileSize;
      ctx.fillStyle = COLOR_PLAYER;
      ctx.fillRect(px, py, tileSize - 0.1, tileSize - 0.1);
      if (t.k > 1) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('★', px + tileSize / 2, py + tileSize / 2);
      }
    }

    const hov = hoveredRef.current;
    if (hov) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 / t.k;
      ctx.strokeRect((hov.x - 1) * tileSize, (hov.y - 1) * tileSize, tileSize, tileSize);
    }
  }, [grid, tileBitmap, playerLocation]);

  // Keep the latest draw in a ref so d3 handlers never go stale.
  const drawRef = useRef(draw);
  drawRef.current = draw;

  // ─── Canvas/zoom setup (once) ───────────────────────────────────────────────
  useEffect(() => {
    const svgEl = svgRef.current, canvas = canvasRef.current;
    if (!svgEl || !canvas) return;
    const svg = d3.select(svgEl);
    gRef.current = svg.append('g').attr('class', 'map-group');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const h = containerRef.current?.clientHeight || window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      svg.attr('width', w).attr('height', h);
      drawRef.current();
    };
    resize();
    window.addEventListener('resize', resize);

    const pointerTile = (event: MouseEvent): TileData | undefined => {
      const [mx, my] = d3.pointer(event, svgEl);
      const [wx, wy] = transformRef.current.invert([mx, my]);
      return tileAt(Math.floor(wx / tileSize) + 1, Math.floor(wy / tileSize) + 1);
    };

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute').style('display', 'none')
      .style('background', 'rgba(0,0,0,0.9)').style('color', 'white')
      .style('padding', '8px').style('border-radius', '4px').style('font-size', '12px')
      .style('pointer-events', 'none').style('z-index', '1000');

    svg.on('mousemove', (event: MouseEvent) => {
      const d = pointerTile(event);
      if (d !== hoveredRef.current) {
        hoveredRef.current = d ?? null;
        if (d) {
          const isPlayer = !!playerLocation && playerLocation.x === d.x && playerLocation.y === d.y;
          tooltip.style('display', 'block').html(tooltipHtml({ ...d, isPlayer }));
        } else {
          tooltip.style('display', 'none');
        }
        drawRef.current();
      }
      if (d) tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 10}px`);
    });
    svg.on('mouseleave', () => {
      hoveredRef.current = null;
      tooltip.style('display', 'none');
      drawRef.current();
    });
    svg.on('click', (event: MouseEvent) => {
      const d = pointerTile(event);
      if (d) onPlayerLocationChangeRef.current?.({ x: d.x, y: d.y });
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        gRef.current?.attr('transform', event.transform.toString());
        drawRef.current();
      });
    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
    fitMapToView(svg, zoom, canvas.clientWidth, canvas.clientHeight, tileSize, false);

    return () => {
      window.removeEventListener('resize', resize);
      tooltip.remove();
      svg.on('.zoom', null).on('mousemove', null).on('mouseleave', null).on('click', null);
      svg.selectAll('*').remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileAt]);

  // Repaint when tiles or player location change (no DOM rebuild).
  useEffect(() => { draw(); }, [draw]);

  // ─── Navigation overlay effect ───────────────────────────────────────────────
  // Updates only the route/marker overlay elements without rebuilding the grid.
  useEffect(() => {
    const g = gRef.current;
    if (!g) return;

    // Remove previous overlay elements
    g.selectAll('.start-location-marker, .start-location-text, .route-line, .route-marker, .route-marker-text').remove();

    // Add start location marker when "Calculate Route" is clicked
    if (navigationState.isNavigating && navigationState.startLocation) {
      g.append('circle')
        .attr('class', 'start-location-marker')
        .attr('cx', (navigationState.startLocation.x - 1) * tileSize + tileSize / 2)
        .attr('cy', (navigationState.startLocation.y - 1) * tileSize + tileSize / 2)
        .attr('r', tileSize * 0.4)
        .attr('fill', '#00ff00')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('opacity', 0.8)
        .style('pointer-events', 'none');

      g.append('text')
        .attr('class', 'start-location-text')
        .attr('x', (navigationState.startLocation.x - 1) * tileSize + tileSize / 2)
        .attr('y', (navigationState.startLocation.y - 1) * tileSize + tileSize / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text('START');
    }

    // Add route visualization if navigation is active
    if (navigationState.showRouteOnMap && navigationState.currentRoute) {
      const route = navigationState.currentRoute;

      if (route.steps.length > 1) {
        const lineGenerator = d3.line<RouteStep>()
          .x((d) => (d.coordinate.x - 1) * tileSize + tileSize / 2)
          .y((d) => (d.coordinate.y - 1) * tileSize + tileSize / 2)
          .curve(d3.curveLinear);

        g.append('path')
          .datum(route.steps)
          .attr('class', 'route-line')
          .attr('d', lineGenerator)
          .attr('stroke', route.usesTransit ? '#00ccff' : '#00ff00')
          .attr('stroke-width', 3)
          .attr('fill', 'none')
          .attr('stroke-dasharray', route.usesTransit ? '5,5' : 'none')
          .style('opacity', 0.8)
          .style('pointer-events', 'none');

        route.steps.forEach((step, index) => {
          if (index === 0) {
            g.append('circle')
              .attr('class', 'route-marker start')
              .attr('cx', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('cy', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('r', tileSize * 0.3)
              .attr('fill', '#00ff00')
              .attr('stroke', 'white')
              .attr('stroke-width', 2)
              .style('pointer-events', 'none');

            g.append('text')
              .attr('class', 'route-marker-text')
              .attr('x', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('y', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', 'black')
              .attr('font-size', '8px')
              .attr('font-weight', 'bold')
              .style('pointer-events', 'none')
              .text('S');
          } else if (index === route.steps.length - 1) {
            g.append('circle')
              .attr('class', 'route-marker end')
              .attr('cx', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('cy', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('r', tileSize * 0.3)
              .attr('fill', '#ff0000')
              .attr('stroke', 'white')
              .attr('stroke-width', 2)
              .style('pointer-events', 'none');

            g.append('text')
              .attr('class', 'route-marker-text')
              .attr('x', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('y', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', 'white')
              .attr('font-size', '8px')
              .attr('font-weight', 'bold')
              .style('pointer-events', 'none')
              .text('E');
          } else if (step.action === 'transit') {
            g.append('circle')
              .attr('class', 'route-marker transit')
              .attr('cx', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('cy', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('r', tileSize * 0.25)
              .attr('fill', '#00ccff')
              .attr('stroke', 'white')
              .attr('stroke-width', 1)
              .style('pointer-events', 'none');

            g.append('text')
              .attr('class', 'route-marker-text')
              .attr('x', (step.coordinate.x - 1) * tileSize + tileSize / 2)
              .attr('y', (step.coordinate.y - 1) * tileSize + tileSize / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', 'black')
              .attr('font-size', '6px')
              .attr('font-weight', 'bold')
              .style('pointer-events', 'none')
              .text('T');
          }
        });
      }
    }

    // Zoom to show the route or start location
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3.select(svgRef.current);
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;

      if (navigationState.showRouteOnMap && navigationState.currentRoute) {
        fitRouteToView(svg, zoomBehaviorRef.current, navigationState.currentRoute, width, height, tileSize);
      } else if (navigationState.isNavigating && navigationState.startLocation) {
        centerOnLocation(svg, zoomBehaviorRef.current, navigationState.startLocation, width, height, tileSize);
      }
    }
  }, [navigationState]);



  // Pan to a location chosen in the panel.
  useEffect(() => {
    if (!selected || !svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current?.clientWidth || window.innerWidth;
    const height = containerRef.current?.clientHeight || window.innerHeight;
    centerOnLocation(svg, zoomBehaviorRef.current, selected.coordinate, width, height, tileSize);
  }, [selected]);

  const routeToSelected = () => {
    if (!selected || !validPlayerLocation) return;
    const result = findOptimalRoute(validPlayerLocation, selected.coordinate);
    setNavigationState({
      startLocation: validPlayerLocation,
      destination: selected.coordinate,
      currentRoute: result.recommendedRoute,
      isNavigating: true,
      showRouteOnMap: true,
    });
  };

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
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      fitRouteToView(svg, zoomBehaviorRef.current, route, width, height, tileSize);
    }
  };

  const nearestSection = (title: string, color: string, items: (Building & { distance: number })[], name: (b: Building) => string) => (
    <BuildingList>
      <h4><Swatch $color={color} />{title}</h4>
      {items.map((b) => (
        <BuildingItem key={b.id}>
          <BuildingName>{name(b)}</BuildingName>
          <Distance>{b.distance} blocks</Distance>
        </BuildingItem>
      ))}
    </BuildingList>
  );

  const selDist = selected && validPlayerLocation
    ? Math.abs(selected.coordinate.x - validPlayerLocation.x) + Math.abs(selected.coordinate.y - validPlayerLocation.y)
    : null;
  const staleMs = 3600_000;

  return (
    <MapContainer ref={containerRef}>
      <canvas ref={canvasRef} />
      <svg ref={svgRef} style={{ cursor: 'pointer' }} />

      {!validPlayerLocation && (
        <Hint>Scroll to zoom, drag to pan. Click a tile to set your location.</Hint>
      )}

      <Controls>
        <NavigationPanel
          playerLocation={playerLocation}
          navigationState={navigationState}
          onNavigationChange={handleNavigationChange}
          onRouteSelect={handleRouteSelect}
        />
      </Controls>

      {selected && (
        <DetailCard>
          <span className="close" onClick={() => onSelect(null)} aria-label="Close">&times;</span>
          <b>{displayName(selected)}</b>
          <div className="row"><span>{getLocationName(selected.coordinate.x, selected.coordinate.y)}</span><span>{selDist !== null ? `${selDist} blocks` : ''}</span></div>
          <div className="row"><span>Reported</span><span>{Math.max(0, Math.floor((Date.now() - selected.reportedAt.getTime()) / 3600_000))}h ago{selected.reporterName ? ` by ${selected.reporterName}` : ''}</span></div>
          <div className="row"><span>Confidence</span><span>{selected.confidence ?? 'unverified'}</span></div>
          {selected.buildingType === 'shop' && (
            <div className="row"><span>Moves in</span><span className={shopsMoveInMs < staleMs ? 'warn' : ''}>{Math.floor(shopsMoveInMs / 3600_000)}h {Math.floor((shopsMoveInMs % 3600_000) / 60000)}m</span></div>
          )}
          <button className="btn" onClick={routeToSelected} disabled={!validPlayerLocation}
            title={validPlayerLocation ? undefined : 'Click the map to set your location first'}>
            Route from my location &rarr;
          </button>
        </DetailCard>
      )}

      {shopsMoveInMs < staleMs && (
        <Stale>&#9888; Shops move in {Math.floor(shopsMoveInMs / 60000)}m &mdash; shop reports reset then</Stale>
      )}

      {validPlayerLocation && !selected && (
        <NearestBuildingsWidget>
          <WidgetHeader
            $isVisible={isNearestBuildingsVisible}
            onClick={() => setIsNearestBuildingsVisible(!isNearestBuildingsVisible)}
          >
            <h3>Nearest Buildings</h3>
          </WidgetHeader>
          <WidgetContent $isVisible={isNearestBuildingsVisible}>
            {nearestSection('Banks', BUILDING_STYLE.bank.color, nearestBanks, b => getLocationName(b.coordinate.x, b.coordinate.y))}
            {nearestSection('Pubs', BUILDING_STYLE.pub.color, nearestPubs, b => b.name)}
            {nearestSection('Transit', BUILDING_STYLE.transit.color, nearestTransit, b => b.name)}
          </WidgetContent>
        </NearestBuildingsWidget>
      )}

    </MapContainer>
  );
};
