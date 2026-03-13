import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimestampTimeline } from '@/components/DetailPanel/TimestampTimeline';
import type { ContentTimestamps } from '@/types/content';

function makeTimestamps(overrides: Partial<ContentTimestamps> = {}): ContentTimestamps {
  return {
    created: '2024-01-01T00:00:00.000Z',
    technicallyReady: null,
    shootingScriptReady: null,
    readyToRecord: null,
    recorded: null,
    edited: null,
    published: null,
    shortsExtracted: null,
    lifetimeValueEnds: null,
    updated: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('TimestampTimeline', () => {
  it('renders the created timestamp', () => {
    render(<TimestampTimeline contentType="video" timestamps={makeTimestamps()} />);

    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
  });

  it('renders completed status timestamps', () => {
    render(
      <TimestampTimeline
        contentType="video"
        timestamps={makeTimestamps({
          technicallyReady: '2024-01-05T00:00:00.000Z',
          shootingScriptReady: '2024-01-10T00:00:00.000Z',
        })}
      />,
    );

    expect(screen.getByText('Technically Ready')).toBeInTheDocument();
    expect(screen.getByText('Shooting Script Ready')).toBeInTheDocument();
  });

  it('does not render null timestamps', () => {
    render(
      <TimestampTimeline
        contentType="video"
        timestamps={makeTimestamps({
          technicallyReady: '2024-01-05T00:00:00.000Z',
        })}
      />,
    );

    expect(screen.queryByText('Recorded')).not.toBeInTheDocument();
    expect(screen.queryByText('Published')).not.toBeInTheDocument();
  });

  it('returns null when no timestamps have values', () => {
    const timestamps: ContentTimestamps = {
      created: '',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '',
    };

    const { container } = render(<TimestampTimeline contentType="video" timestamps={timestamps} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders timestamps in lifecycle order', () => {
    render(
      <TimestampTimeline
        contentType="video"
        timestamps={makeTimestamps({
          technicallyReady: '2024-01-05T00:00:00.000Z',
          recorded: '2024-01-20T00:00:00.000Z',
          published: '2024-02-01T00:00:00.000Z',
        })}
      />,
    );

    const timeline = screen.getByTestId('timestamp-timeline');
    const labels = timeline.querySelectorAll('.font-medium');
    const labelTexts = Array.from(labels).map((el) => el.textContent);

    expect(labelTexts).toEqual([
      'Created',
      'Technically Ready',
      'Recorded',
      'Published',
    ]);
  });
});
