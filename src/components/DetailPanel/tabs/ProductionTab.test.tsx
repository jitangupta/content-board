import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  ContentContext,
  type ContentContextValue,
} from '@/features/content/ContentProvider';
import { ProductionTab } from './ProductionTab';
import type { ContentItem } from '@/types/content';

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('@/services/firestore', () => ({
  addDemoItem: vi.fn().mockResolvedValue(undefined),
  updateDemoItem: vi.fn().mockResolvedValue(undefined),
  removeDemoItem: vi.fn().mockResolvedValue(undefined),
  addTalkingPoint: vi.fn().mockResolvedValue(undefined),
  removeTalkingPoint: vi.fn().mockResolvedValue(undefined),
  updateContent: vi.fn().mockResolvedValue(undefined),
}));

function createMockItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'item-1',
    title: 'Test Video',
    description: 'A test description',
    tags: ['react'],
    status: 'draft',
    phase: 'pre-production',
    order: 0,
    youtubeUrl: null,
    demoItems: [],
    talkingPoints: [],
    shootingScript: '',
    thumbnailIdeas: [],
    linkedContent: [],
    notes: '',
    learnings: [],
    feedback: [],
    timestamps: {
      created: '2026-01-01',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2026-01-01',
    },
    ...overrides,
  };
}

function renderProductionTab(
  item: ContentItem,
  contextOverrides: Partial<ContentContextValue> = {},
): ReturnType<typeof render> {
  const defaultContext: ContentContextValue = {
    contents: [item],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn().mockResolvedValue(undefined),
    deleteContent: vi.fn().mockResolvedValue(undefined),
    updateStatus: vi.fn(),
    ...contextOverrides,
  };

  return render(
    <ContentContext.Provider value={defaultContext}>
      <MemoryRouter>
        <ProductionTab item={item} />
      </MemoryRouter>
    </ContentContext.Provider>,
  );
}

describe('ProductionTab', () => {
  it('renders all four sections', () => {
    renderProductionTab(createMockItem());

    expect(screen.getByText('Demo Items')).toBeInTheDocument();
    expect(screen.getByText('Talking Points')).toBeInTheDocument();
    expect(screen.getByText('Shooting Script')).toBeInTheDocument();
    expect(screen.getByText('Thumbnail Ideas')).toBeInTheDocument();
  });

  it('renders empty states for demo items and talking points', () => {
    renderProductionTab(createMockItem());

    expect(screen.getByText(/No demo items yet/)).toBeInTheDocument();
    expect(screen.getByText(/No talking points yet/)).toBeInTheDocument();
  });

  it('renders shooting script textarea with placeholder', () => {
    renderProductionTab(createMockItem());
    expect(screen.getByPlaceholderText('Outline your scene-by-scene flow...')).toBeInTheDocument();
  });

  it('renders thumbnail ideas textarea with placeholder', () => {
    renderProductionTab(createMockItem());
    expect(screen.getByPlaceholderText(/visual concepts/)).toBeInTheDocument();
  });

  it('renders existing shooting script content', () => {
    renderProductionTab(createMockItem({ shootingScript: 'Scene 1: Intro' }));
    expect(screen.getByDisplayValue('Scene 1: Intro')).toBeInTheDocument();
  });

  it('renders existing thumbnail ideas', () => {
    renderProductionTab(createMockItem({ thumbnailIdeas: ['Red background', 'Code on screen'] }));
    const textarea = screen.getByPlaceholderText(/visual concepts/) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Red background\nCode on screen');
  });

  it('renders existing demo items', () => {
    renderProductionTab(createMockItem({
      demoItems: [
        { id: '1', type: 'repo', description: 'Sample repo', verified: false },
      ],
    }));
    expect(screen.getByText('Sample repo')).toBeInTheDocument();
    expect(screen.getByText('Repo')).toBeInTheDocument();
  });

  it('renders existing talking points with order numbers', () => {
    renderProductionTab(createMockItem({
      talkingPoints: [
        { id: '1', text: 'First point', category: 'technical', priority: 'must-say', order: 0 },
        { id: '2', text: 'Second point', category: 'engagement', priority: 'nice-to-have', order: 1 },
      ],
    }));
    expect(screen.getByText('First point')).toBeInTheDocument();
    expect(screen.getByText('Second point')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders Add Demo Item button', () => {
    renderProductionTab(createMockItem());
    expect(screen.getByText('Add Demo Item')).toBeInTheDocument();
  });

  it('renders Add Talking Point button', () => {
    renderProductionTab(createMockItem());
    expect(screen.getByText('Add Talking Point')).toBeInTheDocument();
  });
});
