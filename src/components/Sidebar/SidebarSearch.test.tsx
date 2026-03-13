import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SidebarSearch } from '@/components/Sidebar/SidebarSearch';

describe('SidebarSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input', () => {
    render(<SidebarSearch value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: 'Search content' })).toBeInTheDocument();
  });

  it('shows placeholder text', () => {
    render(<SidebarSearch value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search content...')).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    render(<SidebarSearch value="" onChange={vi.fn()} />);
    expect(screen.queryByTestId('sidebar-search-clear')).not.toBeInTheDocument();
  });

  it('shows clear button when input has text', () => {
    render(<SidebarSearch value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: 'Search content' });

    fireEvent.change(input, { target: { value: 'react' } });

    expect(screen.getByTestId('sidebar-search-clear')).toBeInTheDocument();
  });

  it('debounces onChange by 300ms', () => {
    const onChange = vi.fn();

    render(<SidebarSearch value="" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Search content' });

    fireEvent.change(input, { target: { value: 'r' } });
    expect(onChange).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(299); });
    expect(onChange).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(onChange).toHaveBeenCalledWith('r');
  });

  it('clears input and calls onChange immediately on clear button click', () => {
    const onChange = vi.fn();

    render(<SidebarSearch value="" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Search content' });

    fireEvent.change(input, { target: { value: 'test' } });
    act(() => { vi.advanceTimersByTime(300); });
    onChange.mockClear();

    fireEvent.click(screen.getByTestId('sidebar-search-clear'));

    expect(onChange).toHaveBeenCalledWith('');
    expect(input).toHaveValue('');
  });

  it('resets debounce timer on each keystroke', () => {
    const onChange = vi.fn();

    render(<SidebarSearch value="" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Search content' });

    fireEvent.change(input, { target: { value: 'r' } });
    act(() => { vi.advanceTimersByTime(200); });

    fireEvent.change(input, { target: { value: 're' } });
    act(() => { vi.advanceTimersByTime(200); });

    expect(onChange).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(100); });
    expect(onChange).toHaveBeenCalledWith('re');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
