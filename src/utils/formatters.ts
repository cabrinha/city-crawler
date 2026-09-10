/**
 * Format reporter names for display in the UI
 * Handles single reporters, multiple reporters, and fallbacks
 */
export function formatReporters(allReporters?: string[], fallbackReporter?: string): string {
  // Use allReporters if available and not empty
  if (allReporters && allReporters.length > 0) {
    if (allReporters.length === 1) {
      return allReporters[0];
    } else if (allReporters.length === 2) {
      return `${allReporters[0]} & ${allReporters[1]}`;
    } else {
      return `${allReporters[0]} & ${allReporters.length - 1} others`;
    }
  }

  // Fall back to the single reporter name
  return fallbackReporter || 'Unknown';
}

/**
 * Format reporter names for tooltips where we want to show all names
 */
export function formatReportersTooltip(allReporters?: string[], fallbackReporter?: string): string {
  // Use allReporters if available and not empty
  if (allReporters && allReporters.length > 0) {
    return allReporters.join(', ');
  }

  // Fall back to the single reporter name
  return fallbackReporter || 'Unknown';
}

/**
 * Format time ago display
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
}

/**
 * Pure countdown computation for shop/guild moves (extracted from LocationReportsPage).
 */
export interface MoveCycle { prev: Date; next: Date }

/** Shops move at 10:40 and 22:40 UTC; guilds at 00:00 UTC on the 1st, 6th, 10th, 14th, 19th, 23rd, 27th. */
export function getMoveCycle(now = new Date()): { shops: MoveCycle; guilds: MoveCycle } {
  const dayUTC = (d: Date, dayOffset: number, h: number, m: number) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + dayOffset, h, m, 0, 0));
  const shopTimes = [dayUTC(now, -1, 22, 40), dayUTC(now, 0, 10, 40), dayUTC(now, 0, 22, 40), dayUTC(now, 1, 10, 40)];
  const shopNextIdx = shopTimes.findIndex(t => t.getTime() > now.getTime());
  const shops = { prev: shopTimes[shopNextIdx - 1], next: shopTimes[shopNextIdx] };

  const days = [1, 6, 10, 14, 19, 23, 27];
  const monthUTC = (monthOffset: number, day: number) =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, day, 0, 0, 0, 0));
  const guildTimes = [monthUTC(-1, days[days.length - 1]), ...days.map(d => monthUTC(0, d)), monthUTC(1, days[0])];
  const guildNextIdx = guildTimes.findIndex(t => t.getTime() > now.getTime());
  const guilds = { prev: guildTimes[guildNextIdx - 1], next: guildTimes[guildNextIdx] };

  return { shops, guilds };
}

export function formatDuration(ms: number, withSeconds = true): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const s = withSeconds ? ` ${seconds}s` : '';
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h ${minutes}m${s}`;
  return `${hours}h ${minutes}m${s}`;
}

export function getMoveCountdown(now = new Date()): { shops: string; guilds: string } {
  const c = getMoveCycle(now);
  const fmt = (next: Date) => (next.getTime() > now.getTime() ? formatDuration(next.getTime() - now.getTime()) : 'Moving now!');
  return { shops: fmt(c.shops.next), guilds: fmt(c.guilds.next) };
}
