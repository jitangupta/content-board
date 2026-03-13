export type ContentStatus =
  | 'draft'
  | 'technically-ready'
  | 'shooting-script-ready'
  | 'ready-to-record'
  | 'recorded'
  | 'edited'
  | 'published'
  | 'extracted-shorts'
  | 'lifetime-value-ends';

export type ShortStatus =
  | 'draft'
  | 'ready-to-record'
  | 'recorded'
  | 'edited'
  | 'published';

export type ContentPhase = 'pre-production' | 'production' | 'post-production';

export type ContentType = 'video' | 'short';

export type ShortPlatform =
  | 'youtube-shorts'
  | 'instagram-reels'
  | 'linkedin'
  | 'tiktok'
  | 'other';

export interface PlatformVersion {
  id: string;
  platform: ShortPlatform;
  url: string;
  published: boolean;
  notes: string;
}

export type DemoItemType =
  | 'repo'
  | 'command'
  | 'live-coding'
  | 'config-file'
  | 'tool-setup';

export interface DemoItem {
  id: string;
  type: DemoItemType;
  description: string;
  verified: boolean;
}

export type TalkingPointCategory = 'technical' | 'engagement' | 'cta';
export type TalkingPointPriority = 'must-say' | 'nice-to-have';

export interface TalkingPoint {
  id: string;
  text: string;
  category: TalkingPointCategory;
  priority: TalkingPointPriority;
  order: number;
}

export type LinkedContentPlatform = 'blog' | 'linkedin' | 'twitter' | 'canva' | 'chatgpt' | 'claude' | 'other';

export interface LinkedContent {
  id: string;
  platform: LinkedContentPlatform;
  url: string;
  label: string;
}

export interface Learning {
  id: string;
  text: string;
  dateAdded: string;
  appliedInContentId: string | null;
}

export type FeedbackSource = 'self' | 'peer' | 'family' | 'comment';

export interface Feedback {
  id: string;
  source: FeedbackSource;
  text: string;
  dateAdded: string;
}

export interface AggregatedFeedback {
  feedback: Feedback;
  contentId: string;
  contentTitle: string;
}

export interface ContentTimestamps {
  created: string;
  technicallyReady: string | null;
  shootingScriptReady: string | null;
  readyToRecord: string | null;
  recorded: string | null;
  edited: string | null;
  published: string | null;
  shortsExtracted: string | null;
  lifetimeValueEnds: string | null;
  updated: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: ContentStatus;
  phase: ContentPhase;
  order: number;
  contentType: ContentType;
  parentVideoId: string | null;
  script: string | null;
  platformVersions: PlatformVersion[];
  youtubeUrl: string | null;
  demoItems: DemoItem[];
  talkingPoints: TalkingPoint[];
  shootingScript: string | null;
  thumbnailIdeas: string | null;
  linkedContent: LinkedContent[];
  notes: string | null;
  learnings: Learning[];
  feedback: Feedback[];
  timestamps: ContentTimestamps;
}
