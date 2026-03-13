import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatRelativeTime } from '@/utils/relativeTime';

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function setNow(isoString: string): void {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(isoString));
  }

  it('returns "just now" for times less than a minute ago', () => {
    setNow('2026-02-24T12:00:30Z');
    expect(formatRelativeTime('2026-02-24T12:00:00Z')).toBe('just now');
  });

  it('returns minutes ago for times less than an hour ago', () => {
    setNow('2026-02-24T12:05:00Z');
    expect(formatRelativeTime('2026-02-24T12:00:00Z')).toBe('5 minutes ago');
  });

  it('returns "1 minute ago" for singular minute', () => {
    setNow('2026-02-24T12:01:30Z');
    expect(formatRelativeTime('2026-02-24T12:00:00Z')).toBe('1 minute ago');
  });

  it('returns hours ago for times less than a day ago', () => {
    setNow('2026-02-24T15:00:00Z');
    expect(formatRelativeTime('2026-02-24T12:00:00Z')).toBe('3 hours ago');
  });

  it('returns "1 hour ago" for singular hour', () => {
    setNow('2026-02-24T13:00:00Z');
    expect(formatRelativeTime('2026-02-24T12:00:00Z')).toBe('1 hour ago');
  });

  it('returns days ago for times less than a week ago', () => {
    setNow('2026-02-24T12:00:00Z');
    expect(formatRelativeTime('2026-02-22T12:00:00Z')).toBe('2 days ago');
  });

  it('returns "yesterday" for 1 day ago', () => {
    setNow('2026-02-24T12:00:00Z');
    expect(formatRelativeTime('2026-02-23T12:00:00Z')).toBe('yesterday');
  });

  it('returns formatted date for times older than a week', () => {
    setNow('2026-02-24T12:00:00Z');
    const result = formatRelativeTime('2026-01-15T12:00:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });
});
