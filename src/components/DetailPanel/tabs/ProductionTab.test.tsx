import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductionTab } from '@/components/DetailPanel/tabs/ProductionTab';
import type { ContentItem } from '@/types/content';

const updateContentMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/features/content/useContent', () => ({
  useContent: () => ({
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: updateContentMock,
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
  }),
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

vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));

function makeContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'abc123',
    title: 'Test Video',
    description: 'A test description',
    tags: [],
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

describe('ProductionTab', () => {
  beforeEach(() => {
    updateContentMock.mockClear();
  });

  it('renders all four sections', () => {
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    expect(screen.getByText('Demo Items')).toBeInTheDocument();
    expect(screen.getByText('Talking Points')).toBeInTheDocument();
    expect(screen.getByLabelText('Shooting Script')).toBeInTheDocument();
    expect(screen.getByLabelText('Thumbnail Ideas')).toBeInTheDocument();
  });

  it('renders empty states for demo items and talking points', () => {
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    expect(screen.getByText(/No demo items yet/)).toBeInTheDocument();
    expect(screen.getByText(/No talking points yet/)).toBeInTheDocument();
  });

  it('renders shooting script with existing value', () => {
    const content = makeContentItem({
      shootingScript: 'Scene 1: Intro',
    });
    render(<ProductionTab content={content} />);

    expect(screen.getByLabelText('Shooting Script')).toHaveValue(
      'Scene 1: Intro',
    );
  });

  it('renders thumbnail ideas with existing value', () => {
    const content = makeContentItem({
      thumbnailIdeas: 'Close-up of code editor',
    });
    render(<ProductionTab content={content} />);

    expect(screen.getByLabelText('Thumbnail Ideas')).toHaveValue(
      'Close-up of code editor',
    );
  });

  it('renders shooting script placeholder text', () => {
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    expect(
      screen.getByPlaceholderText('Outline your scene-by-scene flow...'),
    ).toBeInTheDocument();
  });

  it('renders thumbnail ideas placeholder text', () => {
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    expect(
      screen.getByPlaceholderText(
        'Describe visual concepts for your thumbnail...',
      ),
    ).toBeInTheDocument();
  });

  it('renders demo items when present', () => {
    const content = makeContentItem({
      demoItems: [
        {
          id: 'd1',
          type: 'repo',
          description: 'Example repo',
          verified: false,
        },
      ],
    });
    render(<ProductionTab content={content} />);

    expect(screen.getByText('Example repo')).toBeInTheDocument();
    expect(screen.getByText('Repo')).toBeInTheDocument();
  });

  it('renders talking points when present', () => {
    const content = makeContentItem({
      talkingPoints: [
        {
          id: 'tp1',
          text: 'Explain hooks',
          category: 'technical',
          priority: 'must-say',
          order: 0,
        },
      ],
    });
    render(<ProductionTab content={content} />);

    expect(screen.getByText('Explain hooks')).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
  });

  it('does not show Save/Discard when no changes are made', () => {
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
  });

  it('shows Save/Discard when shooting script is edited', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    await user.type(screen.getByLabelText('Shooting Script'), 'Scene 1');

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('saves shooting script on Save click', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    await user.type(screen.getByLabelText('Shooting Script'), 'Scene 1');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateContentMock).toHaveBeenCalledWith('abc123', {
      shootingScript: 'Scene 1',
    });
  });

  it('saves thumbnail ideas on Save click', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    await user.type(screen.getByLabelText('Thumbnail Ideas'), 'Big text overlay');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateContentMock).toHaveBeenCalledWith('abc123', {
      thumbnailIdeas: 'Big text overlay',
    });
  });

  it('discards changes when Discard is clicked', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    render(<ProductionTab content={content} />);

    await user.type(screen.getByLabelText('Shooting Script'), 'Scene 1');
    await user.click(screen.getByRole('button', { name: 'Discard' }));

    expect(screen.getByLabelText('Shooting Script')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(updateContentMock).not.toHaveBeenCalled();
  });
});
