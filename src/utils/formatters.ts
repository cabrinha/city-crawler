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