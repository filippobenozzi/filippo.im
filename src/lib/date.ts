export function formatDate(date: string, includeRelative = false): string {
  const currentDate = new Date();
  const targetDate = new Date(date);

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (!includeRelative) {
    return fullDate;
  }

  const diffMs = currentDate.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  let relativeDate = 'Today';

  if (diffDays >= 365) {
    relativeDate = `${Math.floor(diffDays / 365)}y ago`;
  } else if (diffDays >= 30) {
    relativeDate = `${Math.floor(diffDays / 30)}mo ago`;
  } else if (diffDays > 0) {
    relativeDate = `${diffDays}d ago`;
  }

  return `${fullDate} (${relativeDate})`;
}
