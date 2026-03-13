import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { ContentStatus } from '@/types/content';

describe('StatusBadge', () => {
  const statusColorPairs: [ContentStatus, string][] = [
    ['draft', 'bg-blue-100'],
    ['technically-ready', 'bg-blue-100'],
    ['shooting-script-ready', 'bg-blue-200'],
    ['ready-to-record', 'bg-blue-200'],
    ['recorded', 'bg-amber-100'],
    ['edited', 'bg-amber-200'],
    ['published', 'bg-green-100'],
    ['extracted-shorts', 'bg-green-200'],
    ['lifetime-value-ends', 'bg-gray-100'],
  ];

  it.each(statusColorPairs)(
    'renders correct color class for status "%s"',
    (status, expectedClass) => {
      render(<StatusBadge status={status} />);

      const badge = screen.getByTestId('status-badge');
      expect(badge.className).toContain(expectedClass);
    },
  );

  it('renders the status label text', () => {
    render(<StatusBadge status="draft" />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders "Published" label for published status', () => {
    render(<StatusBadge status="published" />);

    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('applies additional className', () => {
    render(<StatusBadge status="draft" className="shrink-0" />);

    const badge = screen.getByTestId('status-badge');
    expect(badge.className).toContain('shrink-0');
  });

  it('sets data-status attribute', () => {
    render(<StatusBadge status="edited" />);

    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveAttribute('data-status', 'edited');
  });
});
