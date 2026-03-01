import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChipInput } from '@/components/common/ChipInput';

describe('ChipInput', () => {
  it('renders existing chips', () => {
    render(<ChipInput value={['react', 'typescript']} onChange={vi.fn()} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('adds a chip on Enter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ChipInput value={[]} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'newtag{Enter}');

    expect(onChange).toHaveBeenCalledWith(['newtag']);
  });

  it('does not add duplicate chips', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ChipInput value={['existing']} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'existing{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not add empty chips', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ChipInput value={[]} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '   {Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a chip when X is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ChipInput value={['react', 'vue']} onChange={onChange} />);

    await user.click(screen.getByLabelText('Remove react'));

    expect(onChange).toHaveBeenCalledWith(['vue']);
  });

  it('removes last chip on Backspace when input is empty', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ChipInput value={['react', 'vue']} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('shows placeholder when no chips', () => {
    render(<ChipInput value={[]} onChange={vi.fn()} placeholder="Add tag..." />);
    expect(screen.getByPlaceholderText('Add tag...')).toBeInTheDocument();
  });

  it('hides placeholder when chips exist', () => {
    render(<ChipInput value={['react']} onChange={vi.fn()} placeholder="Add tag..." />);
    expect(screen.queryByPlaceholderText('Add tag...')).not.toBeInTheDocument();
  });
});
