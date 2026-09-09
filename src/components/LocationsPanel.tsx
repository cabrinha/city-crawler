import { useMemo, useState } from 'react';
import styled from 'styled-components';
import type { Coordinate, ReportedLocation } from '../types/game';
import { getLocationName } from '../data/cityData';
import { formatTimeAgo, formatReporters } from '../utils/formatters';
import { ApiService } from '../services/api';

const Panel = styled.aside`
  display: flex;
  text-align: left;
  flex-direction: column;
  background: #0c0c0c;
  border-right: 1px solid #333;
  min-height: 0;
  @media (max-width: 768px) { border-right: none; border-top: 1px solid #333; }
`;
const Search = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #333;
  input {
    flex: 1;
    min-width: 0;
    background: #000;
    border: 1px solid #444;
    color: #fff;
    padding: 8px;
    font-family: inherit;
    font-size: 13px;
  }
  button {
    background: #cc3333;
    color: #fff;
    border: 0;
    padding: 8px 12px;
    font-family: inherit;
    font-weight: bold;
    cursor: pointer;
    white-space: nowrap;
  }
`;
const Filters = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid #333;
  font-size: 11px;
  flex-wrap: wrap;
  span { padding: 3px 8px; border: 1px solid #444; color: #aaa; cursor: pointer; }
  span.on { border-color: #4488ff; color: #fff; }
`;
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
  flex: 1;
`;
const Row = styled.li<{ $color: string; $selected: boolean }>`
  display: grid;
  grid-template-columns: 8px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 9px 12px;
  border-bottom: 1px solid #1a1a1a;
  font-size: 13px;
  cursor: pointer;
  background: ${p => (p.$selected ? '#161616' : 'transparent')};
  &:hover { background: #141414; }
  i { width: 8px; height: 8px; background: ${p => p.$color}; border: 1px solid #fff4; }
  .n { color: #fff; }
  .w { color: #888; font-size: 12px; }
  .d { color: #00ff00; font-size: 12px; text-align: right; }
  .d small { display: block; color: #888; }
  .x { color: #666; font-size: 11px; margin-left: 6px; }
  .x:hover { color: #ff4444; }
`;
const Empty = styled.div`padding: 24px 12px; color: #888; font-size: 13px; text-align: center;`;

export const TYPE_COLORS: Record<string, string> = {
  shop: '#004488', guild: '#4400aa', hunter: '#0BDA51', paladin: '#90D5FF', werewolf: '#cc9933', item: '#cccc33',
};
const FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All' }, { key: 'shop', label: 'Shops' }, { key: 'guild', label: 'Guilds' },
  { key: 'hunter', label: 'Hunters' }, { key: 'item', label: 'Items' }, { key: 'near', label: 'Near me' },
];
const REMOVABLE = ['hunter', 'paladin', 'werewolf', 'item'];

export const displayName = (l: ReportedLocation) =>
  l.buildingType === 'guild' && l.guildLevel ? `${l.buildingName} ${l.guildLevel}` : l.customItemName || l.buildingName;

interface Props {
  locations: ReportedLocation[];
  playerLocation?: Coordinate;
  selectedId?: string;
  onSelect: (l: ReportedLocation) => void;
  onReport: () => void;
  onChanged: () => void;
}

export const LocationsPanel: React.FC<Props> = ({ locations, playerLocation, selectedId, onSelect, onReport, onChanged }) => {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const hasPlayer = !!playerLocation && playerLocation.x > 0;
  const dist = (l: ReportedLocation) =>
    hasPlayer ? Math.abs(l.coordinate.x - playerLocation!.x) + Math.abs(l.coordinate.y - playerLocation!.y) : Infinity;

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = locations.filter(l => !['blood_deity', 'rich_vampire'].includes(l.buildingType));
    if (filter !== 'all' && filter !== 'near') out = out.filter(l => l.buildingType === filter);
    if (needle) out = out.filter(l => `${displayName(l)} ${getLocationName(l.coordinate.x, l.coordinate.y)}`.toLowerCase().includes(needle));
    return out.sort((a, b) =>
      filter === 'near' && hasPlayer ? dist(a) - dist(b) : displayName(a).localeCompare(displayName(b)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, q, filter, playerLocation]);

  const remove = async (e: React.MouseEvent, l: ReportedLocation) => {
    e.stopPropagation();
    if (!window.confirm(`Remove ${displayName(l)}?`)) return;
    try { await ApiService.deleteLocation(l.id); onChanged(); } catch (err) { console.error('Failed to delete location:', err); }
  };

  return (
    <Panel>
      <Search>
        <input placeholder="Find a shop, guild, or street…" value={q} onChange={e => setQ(e.target.value)} />
        <button onClick={onReport}>+ Report</button>
      </Search>
      <Filters>
        {FILTERS.map(f => (
          <span key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}
            title={f.key === 'near' && !hasPlayer ? 'Click the map to set your location first' : undefined}>
            {f.label}
          </span>
        ))}
      </Filters>
      <List>
        {rows.length === 0 && <Empty>{locations.length === 0 ? 'No locations reported this cycle yet.' : 'Nothing matches.'}</Empty>}
        {rows.map(l => (
          <Row key={l.id} $color={TYPE_COLORS[l.buildingType] ?? '#666'} $selected={l.id === selectedId} onClick={() => onSelect(l)}>
            <i />
            <div>
              <div className="n">{displayName(l)}</div>
              <div className="w">{getLocationName(l.coordinate.x, l.coordinate.y)}</div>
            </div>
            <div className="d">
              {hasPlayer ? `${dist(l)} blocks` : ''}
              <small>
                {formatTimeAgo(l.reportedAt)} &middot; {formatReporters(l.allReporters, l.reporterName)}
                {REMOVABLE.includes(l.buildingType) && <span className="x" onClick={e => remove(e, l)}>remove</span>}
              </small>
            </div>
          </Row>
        ))}
      </List>
    </Panel>
  );
};
