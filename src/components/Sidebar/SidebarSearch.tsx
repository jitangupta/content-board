import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const DEBOUNCE_MS = 300;

export function SidebarSearch({ value, onChange }: SidebarSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedChange = useCallback(
    (next: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        onChange(next);
      }, DEBOUNCE_MS);
    },
    [onChange],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const next = e.target.value;
    setLocalValue(next);
    debouncedChange(next);
  }

  function handleClear(): void {
    setLocalValue('');
    onChange('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }

  return (
    <div className="relative" data-testid="sidebar-search">
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="Search content..."
        value={localValue}
        onChange={handleChange}
        className="pl-8 pr-8 h-8 text-sm"
        aria-label="Search content"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
          data-testid="sidebar-search-clear"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
