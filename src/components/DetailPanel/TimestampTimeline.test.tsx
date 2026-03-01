import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimestampTimeline } from '@/components/DetailPanel/TimestampTimeline';
import type { ContentTimestamps } from '@/types/content';

function createTimestamps(overrides: Partial<ContentTimestamps> = {}): ContentTimestamps {
  return {
    created: '2026-01-01T00:00:00Z',
    technicallyReady: null,
    shootingScriptReady: null,
    readyToRecord: null,
    recorded: null,
    edited: null,
    published: null,
    shortsExtracted: null,
    lifetimeValueEnds: null,
    updated: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('TimestampTimeline', () => {
  it('renders nothing when no timestamps are set', () => {
    const { container } = render(
      <TimestampTimeline timestamps={createTimestamps()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays a completed timestamp', () => {
    render(
      <TimestampTimeline
        timestamps={createTimestamps({
          technicallyReady: '2026-01-15T10:00:00Z',
        })}
      />,
    );
    expect(screen.getByText('Technically Ready')).toBeInTheDocument();
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('displays multiple completed timestamps in status order', () => {
    render(
      <TimestampTimeline
        timestamps={createTimestamps({
          technicallyReady: '2026-01-15T10:00:00Z',
          shootingScriptReady: '2026-01-20T10:00:00Z',
          readyToRecord: '2026-02-01T10:00:00Z',
        })}
      />,
    );
    expect(screen.getByText('Technically Ready')).toBeInTheDocument();
    expect(screen.getByText('Shooting Script Ready')).toBeInTheDocument();
    expect(screen.getByText('Ready to Record')).toBeInTheDocument();
  });

  it('skips timestamps with null values', () => {
    render(
      <TimestampTimeline
        timestamps={createTimestamps({
          technicallyReady: '2026-01-15T10:00:00Z',
          recorded: null,
        })}
      />,
    );
    expect(screen.getByText('Technically Ready')).toBeInTheDocument();
    expect(screen.queryByText('Recorded')).not.toBeInTheDocument();
  });
});
