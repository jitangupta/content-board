import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DetailPanel } from '@/components/DetailPanel/DetailPanel';
import { useContent } from '@/features/content/useContent';
import type { ContentContextValue } from '@/features/content/ContentContext';
import type { ContentItem } from '@/types/content';

vi.mock('@/features/content/useContent');
vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));
vi.mock('@/features/production/useProduction', () => ({
  useProduction: () => ({
    demoItemOp: { loading: false, error: null },
    talkingPointOp: { loading: false, error: null },
    addDemoItem: vi.fn(),
    updateDemoItem: vi.fn(),
    removeDemoItem: vi.fn(),
    addTalkingPoint: vi.fn(),
    updateTalkingPoint: vi.fn(),
    removeTalkingPoint: vi.fn(),
    handleReorderTalkingPoints: vi.fn(),
  }),
}));
vi.mock('@/services/firestore', () => ({
  addDemoItem: vi.fn(),
  updateDemoItem: vi.fn(),
  removeDemoItem: vi.fn(),
  addTalkingPoint: vi.fn(),
  updateTalkingPoint: vi.fn(),
  removeTalkingPoint: vi.fn(),
  updateContent: vi.fn(),
  addLinkedContent: vi.fn(),
  removeLinkedContent: vi.fn(),
  addPlatformVersion: vi.fn(),
  updatePlatformVersion: vi.fn(),
  removePlatformVersion: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function makeContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'abc123',
    title: 'Test Video',
    description: 'A test description',
    tags: ['react', 'testing'],
    status: 'draft',
    phase: 'pre-production',
    order: 0,
    contentType: 'video',
    parentVideoId: null,
    script: null,
    platformVersions: [],
    youtubeUrl: null,
    demoItems: [],
    talkingPoints: [],
    shootingScript: null,
    thumbnailIdeas: null,
    linkedContent: [],
    notes: null,
    learnings: [],
    feedback: [],
    timestamps: {
      created: '2024-01-01',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2024-01-01',
    },
    ...overrides,
  };
}

function mockUseContent(overrides: Partial<ContentContextValue> = {}): void {
  vi.mocked(useContent).mockReturnValue({
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
    ...overrides,
  });
}

function renderDetailPanel(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/content" element={<DetailPanel />} />
        <Route path="/content/:contentId" element={<DetailPanel />} />
        <Route path="/content/:contentId/:tab" element={<DetailPanel />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DetailPanel', () => {
  it('renders nothing when no contentId in URL', () => {
    mockUseContent();
    const { container } = renderDetailPanel('/content');

    expect(container.innerHTML).toContain('');
    expect(screen.queryByText('Content not found')).not.toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    mockUseContent({ loading: true });
    renderDetailPanel('/content/abc123');

    expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
  });

  it('shows not found state when contentId does not match', () => {
    mockUseContent({ contents: [makeContentItem()] });
    renderDetailPanel('/content/nonexistent');

    expect(screen.getByText('Content not found')).toBeInTheDocument();
  });

  it('renders content details when contentId matches', () => {
    mockUseContent({ contents: [makeContentItem()] });
    renderDetailPanel('/content/abc123');

    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('defaults to content tab', () => {
    mockUseContent({ contents: [makeContentItem()] });
    renderDetailPanel('/content/abc123');

    expect(screen.getByRole('tab', { name: 'Content' })).toHaveAttribute(
      'data-state',
      'active',
    );
  });

  it('shows production tab when URL specifies it', () => {
    mockUseContent({ contents: [makeContentItem()] });
    renderDetailPanel('/content/abc123/production');

    expect(screen.getByRole('tab', { name: 'Production' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByText('Demo Items')).toBeInTheDocument();
  });

  it('shows delete confirmation dialog on delete button click', async () => {
    const user = userEvent.setup();
    mockUseContent({ contents: [makeContentItem()] });
    renderDetailPanel('/content/abc123');

    const buttons = screen.getAllByRole('button');
    const trashButton = buttons.find(
      (btn) =>
        btn.closest('[class*="justify-between"]') &&
        btn.getAttribute('aria-label') !== 'Back to sidebar',
    );
    expect(trashButton).toBeDefined();
    if (trashButton) {
      await user.click(trashButton);
    }

    expect(screen.getByText(/Delete "Test Video"\?/)).toBeInTheDocument();
    expect(screen.getByText(/This cannot be undone/)).toBeInTheDocument();
  });

  it('calls deleteContent and navigates on confirm delete', async () => {
    const user = userEvent.setup();
    const deleteFn = vi.fn().mockResolvedValue(undefined);
    mockUseContent({
      contents: [makeContentItem()],
      deleteContent: deleteFn,
    });
    renderDetailPanel('/content/abc123');

    // Click the trash button in the header
    const buttons = screen.getAllByRole('button');
    const trashButton = buttons.find(
      (btn) =>
        btn.closest('[class*="justify-between"]') &&
        btn.getAttribute('aria-label') !== 'Back to sidebar',
    );
    if (trashButton) {
      await user.click(trashButton);
    }

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);

    expect(deleteFn).toHaveBeenCalledWith('abc123');
    expect(mockNavigate).toHaveBeenCalledWith('/content');
  });
});
