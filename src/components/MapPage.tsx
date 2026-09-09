import { useState } from 'react';
import styled from 'styled-components';
import type { Coordinate, ReportedLocation } from '../types/game';
import { D3CityMap } from './D3CityMap';
import { LocationsPanel } from './LocationsPanel';
import { LocationReporter } from './LocationReporter';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  flex: 1;
  min-height: 0;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 55vh 1fr;
    aside { order: 2; }
  }
`;
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 300;
  display: flex;
  justify-content: flex-end;
`;
const Drawer = styled.div`
  width: min(520px, 100%);
  height: 100%;
  overflow: auto;
  background: #000;
  border-left: 1px solid #666;
  .close { position: sticky; top: 0; display: flex; justify-content: flex-end; padding: 8px 12px; background: #000; }
  .close button { background: none; border: 1px solid #666; color: #ccc; font-family: inherit; padding: 4px 10px; cursor: pointer; }
`;

interface Props {
  locations: ReportedLocation[];
  onLocationsChanged: () => void;
  playerLocation: Coordinate;
  onPlayerLocationChange: (c: Coordinate) => void;
  shopsMoveInMs: number;
}

export const MapPage: React.FC<Props> = ({ locations, onLocationsChanged, playerLocation, onPlayerLocationChange, shopsMoveInMs }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const selected = locations.find(l => l.id === selectedId) ?? null;

  return (
    <Layout>
      <LocationsPanel
        locations={locations}
        playerLocation={playerLocation}
        selectedId={selectedId ?? undefined}
        onSelect={l => setSelectedId(l.id)}
        onReport={() => setReporting(true)}
        onChanged={onLocationsChanged}
      />
      <D3CityMap
        playerLocation={playerLocation}
        onPlayerLocationChange={onPlayerLocationChange}
        reportedLocations={locations}
        selected={selected}
        onSelect={l => setSelectedId(l?.id ?? null)}
        shopsMoveInMs={shopsMoveInMs}
      />
      {reporting && (
        <Overlay onClick={() => setReporting(false)}>
          <Drawer onClick={e => e.stopPropagation()}>
            <div className="close"><button onClick={() => setReporting(false)}>Close &times;</button></div>
            <LocationReporter
              onLocationReported={l => {
                onLocationsChanged();
                setSelectedId(l.id);
                setReporting(false);
              }}
            />
          </Drawer>
        </Overlay>
      )}
    </Layout>
  );
};
