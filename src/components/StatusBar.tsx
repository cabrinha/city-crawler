import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { ReportedLocation } from '../types/game';
import { getMoveCycle, formatDuration, formatTimeAgo } from '../utils/formatters';
import { SHOP_NAMES, GUILD_NAMES } from '../data/reportedLocations';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  border-bottom: 1px solid #333;
  background: #050505;
  flex-wrap: wrap;
`;

const Chip = styled.div<{ $urgent: boolean; $color: string; $pct: number }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 14px;
  border: 1px solid ${p => (p.$urgent ? '#ff4444' : '#333')};
  background: #0c0c0c;
  min-width: 250px;

  .ring {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: conic-gradient(${p => p.$color} ${p => p.$pct}%, #222 0);
    display: grid;
    place-items: center;
    flex: none;
  }
  .ring::after { content: ''; width: 24px; height: 24px; border-radius: 50%; background: #0c0c0c; }
  b { font-size: 18px; color: ${p => (p.$urgent ? '#ff4444' : '#fff')}; line-height: 1.1; }
  span { display: block; font-size: 10px; color: #888; letter-spacing: 0.06em; text-transform: uppercase; }
`;

const Meta = styled.div`
  margin-left: auto;
  font-size: 12px;
  color: #888;
  b { color: #00ff00; }
  @media (max-width: 900px) { margin-left: 0; }
`;

const fmtUTC = (d: Date) => `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
const ordinal = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) || n % 10 > 3 ? 0 : n % 10]}`;

interface Props { locations: ReportedLocation[] }

export const StatusBar: React.FC<Props> = ({ locations }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const cycle = getMoveCycle(now);
  const left = (c: { prev: Date; next: Date }) => c.next.getTime() - now.getTime();
  const pct = (c: { prev: Date; next: Date }) =>
    Math.min(100, Math.max(0, (100 * (now.getTime() - c.prev.getTime())) / (c.next.getTime() - c.prev.getTime())));
  const shopsLeft = left(cycle.shops);
  const guildsLeft = left(cycle.guilds);

  // Cycle health: distinct buildings reported since the last move of that type.
  const since = (type: 'shop' | 'guild', prev: Date) =>
    new Set(locations.filter(l => l.buildingType === type && l.reportedAt >= prev).map(l => l.buildingName + (l.guildLevel ?? ''))).size;
  const shopsReported = since('shop', cycle.shops.prev);
  const guildsReported = since('guild', cycle.guilds.prev);
  const latest = locations.reduce<ReportedLocation | null>((a, l) => (!a || l.reportedAt > a.reportedAt ? l : a), null);

  useEffect(() => {
    document.title = `${formatDuration(shopsLeft, false)} · City Crawler`;
  }, [Math.floor(shopsLeft / 60000)]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Bar>
      <Chip $urgent={shopsLeft < 3600_000} $color="#ff4444" $pct={pct(cycle.shops)} title="Shops move at 10:40 and 22:40 UTC">
        <div className="ring" />
        <div>
          <b>{formatDuration(shopsLeft, shopsLeft < 3600_000)}</b>
          <span>until shops move &middot; {fmtUTC(cycle.shops.next)}</span>
        </div>
      </Chip>
      <Chip $urgent={guildsLeft < 3600_000} $color="#8866ff" $pct={pct(cycle.guilds)} title="Guilds move at 00:00 UTC on the 1st, 6th, 10th, 14th, 19th, 23rd and 27th">
        <div className="ring" />
        <div>
          <b>{formatDuration(guildsLeft, guildsLeft < 3600_000)}</b>
          <span>until guilds move &middot; the {ordinal(cycle.guilds.next.getUTCDate())}</span>
        </div>
      </Chip>
      <Meta>
        <b>{shopsReported} / {SHOP_NAMES.length}</b> shops reported this cycle &middot; <b>{guildsReported} / {GUILD_NAMES.length * 3}</b> guilds
        {latest && <> &middot; last report {formatTimeAgo(latest.reportedAt)}{latest.reporterName ? ` by ${latest.reporterName}` : ''}</>}
      </Meta>
    </Bar>
  );
};
