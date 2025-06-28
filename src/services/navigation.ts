import type { Coordinate, Route, RouteStep, PathfindingResult } from '../types/game';
import { BUILDINGS } from '../data/cityData';

// Transit stations from cityData.ts
const TRANSIT_STATIONS = BUILDINGS.filter(building => building.type === 'transit');

// Transit cost: 1 move to enter station + 1 move per transit + 1 move to exit = 3 moves minimum
const TRANSIT_BASE_COST = 3;

/**
 * Calculate Manhattan distance between two points
 */
export function calculateManhattanDistance(start: Coordinate, end: Coordinate): number {
  return Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
}

/**
 * Find the walking route between two points (straight-line Manhattan distance)
 */
export function findWalkingRoute(start: Coordinate, destination: Coordinate): Route {
  const totalMoves = calculateManhattanDistance(start, destination);

  // Create steps for the route (simplified - just show start and end)
  const steps: RouteStep[] = [
    {
      coordinate: start,
      action: 'walk',
      distanceFromStart: 0
    },
    {
      coordinate: destination,
      action: 'walk',
      distanceFromStart: totalMoves
    }
  ];

  return {
    steps,
    totalMoves,
    usesTransit: false,
    transitStations: [],
    description: `Walk directly from (${start.x},${start.y}) to (${destination.x},${destination.y})`
  };
}

/**
 * Find the nearest transit station to a coordinate
 */
function findNearestTransitStation(coordinate: Coordinate): { station: typeof TRANSIT_STATIONS[0], distance: number } {
  let nearestStation = TRANSIT_STATIONS[0];
  let minDistance = calculateManhattanDistance(coordinate, nearestStation.coordinate);

  for (const station of TRANSIT_STATIONS) {
    const distance = calculateManhattanDistance(coordinate, station.coordinate);
    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  }

  return { station: nearestStation, distance: minDistance };
}

/**
 * Find the optimal transit route between two points
 */
export function findTransitRoute(start: Coordinate, destination: Coordinate): Route | undefined {
  const startStation = findNearestTransitStation(start);
  const endStation = findNearestTransitStation(destination);

  // If start and end are at the same station, transit doesn't help
  if (startStation.station.id === endStation.station.id) {
    return undefined;
  }

  // Calculate transit distance (always 1 move between any two stations)
  const transitMoves = 1;

  // Total moves: walk to start station + transit + walk from end station
  const totalMoves = startStation.distance + TRANSIT_BASE_COST + transitMoves + endStation.distance;

  const steps: RouteStep[] = [
    {
      coordinate: start,
      action: 'walk',
      distanceFromStart: 0
    },
    {
      coordinate: startStation.station.coordinate,
      action: 'walk',
      distanceFromStart: startStation.distance
    },
    {
      coordinate: endStation.station.coordinate,
      action: 'transit',
      transitStation: endStation.station.name,
      distanceFromStart: startStation.distance + TRANSIT_BASE_COST + transitMoves
    },
    {
      coordinate: destination,
      action: 'walk',
      distanceFromStart: totalMoves
    }
  ];

  return {
    steps,
    totalMoves,
    usesTransit: true,
    transitStations: [startStation.station.name, endStation.station.name],
    description: `Walk to ${startStation.station.name}, transit to ${endStation.station.name}, then walk to destination`
  };
}

/**
 * Find the best route between two points, comparing walking vs transit
 */
export function findOptimalRoute(start: Coordinate, destination: Coordinate): PathfindingResult {
  const walkingRoute = findWalkingRoute(start, destination);
  const transitRoute = findTransitRoute(start, destination);

  let recommendedRoute = walkingRoute;

  // Use transit route if it's significantly better (at least 3 moves saved)
  if (transitRoute && transitRoute.totalMoves < walkingRoute.totalMoves - 2) {
    recommendedRoute = transitRoute;
  }

  return {
    walkingRoute,
    transitRoute,
    recommendedRoute
  };
}

/**
 * Get a detailed description of a route
 */
export function getRouteDescription(route: Route): string {
  if (!route.usesTransit) {
    return `Walk ${route.totalMoves} moves directly to your destination.`;
  }

  const transitStations = route.transitStations;
  if (transitStations.length >= 2) {
    return `${route.totalMoves} moves total: Walk to ${transitStations[0]}, take transit to ${transitStations[1]}, then walk to your destination.`;
  }

  return route.description;
}

/**
 * Parse coordinate input (supports formats like "50,75", "50 75", or "Mongoose 25")
 */
export function parseCoordinateInput(input: string): Coordinate | undefined {
  const trimmed = input.trim();

  // Try parsing as "x,y" or "x y"
  const coordMatch = trimmed.match(/^(\d+)[,\s]+(\d+)$/);
  if (coordMatch) {
    const x = Number.parseInt(coordMatch[1], 10);
    const y = Number.parseInt(coordMatch[2], 10);
    if (x >= 1 && x <= 200 && y >= 1 && y <= 200) {
      return { x, y };
    }
  }

  // TODO: Add support for street name parsing like "Mongoose 25"
  // This would require importing street name functions from cityData

  return undefined;
}