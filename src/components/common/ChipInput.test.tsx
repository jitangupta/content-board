import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChipInput } from '@/components/common/ChipInput';

describe('ChipInput', () => {
  it('renders existing chips', () => {
    render(<ChipInput values={['react', 'typescript']} onChange={vi.fn()} />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('adds a chip on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipInput values={[]} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'newchip{Enter}');

    expect(onChange).toHaveBeenCalledWith(['newchip']);
  });

  it('clears input after adding a chip', async () => {
    const user = userEvent.setup();
    render(<ChipInput values={[]} onChange={vi.fn()} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'newchip{Enter}');

    expect(input).toHaveValue('');
  });

  it('does not add duplicate chips', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipInput values={['existing']} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'existing{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not add empty chips', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipInput values={[]} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '   {Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a chip when X is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChipInput values={['react', 'typescript']} onChange={onChange} />);

    const removeButton = screen.getByRole('button', { name: 'Remove react' });
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(['typescript']);
  });

  it('shows placeholder when no chips', () => {
    render(<ChipInput values={[]} onChange={vi.fn()} placeholder="Add tags" />);

    expect(screen.getByPlaceholderText('Add tags')).toBeInTheDocument();
  });

  it('hides placeholder when chips exist', () => {
    render(
      <ChipInput
        values={['react']}
        onChange={vi.fn()}
        placeholder="Add tags"
      />,
    );

    expect(screen.queryByPlaceholderText('Add tags')).not.toBeInTheDocument();
  });
});
