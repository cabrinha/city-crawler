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
export function getMoveCountdown(now = new Date()): { shops: string; guilds: string } {
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const currentDay = now.getUTCDate();

  let nextShopExpiration: Date;
  if (currentHour < 10 || (currentHour === 10 && currentMinute < 40)) {
    nextShopExpiration = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 10, 40, 0, 0));
  } else if (currentHour < 22 || (currentHour === 22 && currentMinute < 40)) {
    nextShopExpiration = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 22, 40, 0, 0));
  } else {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    nextShopExpiration = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate(), 10, 40, 0, 0));
  }

  const guildMovementDates = [1, 6, 10, 14, 19, 23, 27];
  let nextGuildExpiration: Date;
  const nextMovementDay = guildMovementDates.find(day => day > currentDay);
  if (nextMovementDay) {
    nextGuildExpiration = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), nextMovementDay, 0, 0, 0, 0));
  } else {
    const nextMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
    nextGuildExpiration = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), guildMovementDates[0], 0, 0, 0, 0));
  }

  const shopDiff = nextShopExpiration.getTime() - now.getTime();
  const guildDiff = nextGuildExpiration.getTime() - now.getTime();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h ${minutes}m ${seconds}s`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return {
    shops: shopDiff > 0 ? formatTime(shopDiff) : 'Moving now!',
    guilds: guildDiff > 0 ? formatTime(guildDiff) : 'Moving now!',
  };
}
