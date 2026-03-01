import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { ContentStatus } from '@/types/content';

describe('StatusBadge', () => {
  const statuses: ContentStatus[] = [
    'draft',
    'technically-ready',
    'shooting-script-ready',
    'ready-to-record',
    'recorded',
    'edited',
    'published',
    'extracted-shorts',
    'lifetime-value-ends',
  ];

  it.each(statuses)('renders label for status "%s"', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(/./)).toBeInTheDocument();
  });

  it('renders "Draft" for draft status', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders "Published" for published status', () => {
    render(<StatusBadge status="published" />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('applies blue color classes for pre-production statuses', () => {
    const { container } = render(<StatusBadge status="draft" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-blue');
  });

  it('applies amber color classes for production statuses', () => {
    const { container } = render(<StatusBadge status="recorded" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-amber');
  });

  it('applies green color classes for post-production statuses', () => {
    const { container } = render(<StatusBadge status="published" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-green');
  });

  it('applies gray color classes for lifetime-value-ends', () => {
    const { container } = render(<StatusBadge status="lifetime-value-ends" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-gray');
  });

  it('merges additional className', () => {
    const { container } = render(
      <StatusBadge status="draft" className="ml-2" />,
    );
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('ml-2');
  });
});
