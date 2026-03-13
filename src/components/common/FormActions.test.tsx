import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormActions } from '@/components/common/FormActions';

describe('FormActions', () => {
  const defaultProps = {
    isDirty: true,
    saving: false,
    error: null,
    onSave: vi.fn(),
    onDiscard: vi.fn(),
  };

  it('is hidden when not dirty', () => {
    const { container } = render(
      <FormActions {...defaultProps} isDirty={false} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows Save and Discard buttons when dirty', () => {
    render(<FormActions {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('disables Save button and shows "Saving..." while saving', () => {
    render(<FormActions {...defaultProps} saving={true} />);

    const saveBtn = screen.getByRole('button', { name: 'Saving...' });
    expect(saveBtn).toBeDisabled();
  });

  it('disables Discard button while saving', () => {
    render(<FormActions {...defaultProps} saving={true} />);

    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
  });

  it('shows error message when error is set', () => {
    render(<FormActions {...defaultProps} error="Failed to save changes" />);

    expect(screen.getByText('Failed to save changes')).toBeInTheDocument();
  });

  it('calls onSave when Save is clicked', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<FormActions {...defaultProps} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('calls onDiscard when Discard is clicked', async () => {
    const onDiscard = vi.fn();
    const user = userEvent.setup();
    render(<FormActions {...defaultProps} onDiscard={onDiscard} />);

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(onDiscard).toHaveBeenCalledOnce();
  });
});
