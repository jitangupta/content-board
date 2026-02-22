# Content Board

> Personal YouTube content management system for tracking ideas, capturing learnings, and collecting feedback.

---

## Overview

Content Board is a personalized app designed to manage YouTube content from idea to publication. Built as a learning artifact that demonstrates "vibe coding" with modern tools, this project serves dual purposes: improving content workflow and becoming teachable content itself.

**Creator:** Jitan Gupta  
**Website:** jitangupta.com  
**Focus:** Learn Cloud, Kubernetes & AI — From Someone Who's Built It

---

## Problem Statement

As a content creator building a YouTube channel focused on teaching engineers, I need a system that:

- Captures video ideas quickly, including from mobile
- Tracks content through its full lifecycle (draft → technically ready → shooting script ready → ready to record → recorded → edited → published on YouTube → extracted shorts → lifetime value ends)
- Preserves learnings from each video and ensures they're applied in future content
- Collects feedback from multiple sources (self-reflection, peers, family, comments)
- Links related content across platforms (YouTube, blog, LinkedIn)
- Provides version-controlled, secure access to my content pipeline

Existing tools like Notion or Trello are generic. A custom solution aligns with my teaching mission—the build process itself becomes content.

---

## Tech Stack

| Layer         | Technology                     | Rationale                                      |
|---------------|--------------------------------|------------------------------------------------|
| Frontend      | React                          | Familiar, teachable, component-based           |
| Database      | Firebase Firestore             | Real-time sync, no commit friction, JSON-like  |
| Auth          | Firebase Auth (Google sign-in) | Simple, secure, single-user access             |
| Hosting       | Firebase Hosting               | Free tier, integrated with Firebase ecosystem  |

---

## Features

### Core Features (v1)

**Content Management**
- Create, edit, and delete video content items
- Track content through full lifecycle stages grouped in 3 phases:
  - **Pre-Production:** Draft → Technically Ready → Shooting Script Ready → Ready to Record
  - **Production:** Recorded → Edited
  - **Post-Production:** Published on YouTube → Extracted Shorts → Lifetime Value Ends
- Drag-to-reorder priority within Pre-Production stages
- Add YouTube URL once published
- Link related content (blog posts, LinkedIn posts) to each video

**Content Details (Four-Tab Interface)**
- **Content Tab:** Title, description, tags, status, notes, YouTube URL, linked content
- **Production Tab:** Demo items (what to use for demo/technical example), talking points (important things to mention in video), shooting script outline, thumbnail ideas
- **Learn Tab:** Capture learnings, link learnings to future videos where applied
- **Feedback Tab:** Collect feedback with source tagging (self, peer, family, comment)

**Organization & Discovery**
- Filter content by status or phase (Pre-Production, Production, Post-Production)
- Search by title and tags
- Visual status indicators in the sidebar
- Collapsible phase groups in sidebar

**Timestamps & Tracking**
- Created date
- Technically Ready date
- Shooting Script Ready date
- Ready to Record date
- Recorded date
- Edited date
- Published date
- Shorts Extracted date
- Lifetime Value Ends date
- Last updated date

**Access & Security**
- Google sign-in authentication
- Single-user access (owner only)
- Mobile-friendly for capturing ideas on the go

### Future Enhancements (Parked)

- "Unapplied learnings" suggestions when creating new content
- Offline support and sync
- Analytics dashboard for content velocity tracking
- YouTube API integration for automatic publish detection

---

## User Interface

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Navbar                                          [Profile]  │
│  Content Board                            [+ New Content]   │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│  Sidebar       │  Detail Panel                              │
│                │                                            │
│  [Search...]   │  ┌─────────┬────────────┬───────┬──────────┐│
│                │  │ Content │ Production │ Learn │ Feedback ││
│  ▼ PRE-PROD    │  └─────────┴────────────┴───────┴──────────┘│
│  ○ Draft idea  │                                            │
│  ○ Tech ready  │  [Selected tab content displayed here]     │
│  ○ Script rdy  │                                            │
│  ○ Rec ready   │                                            │
│                │                                            │
│  ▼ PRODUCTION  │                                            │
│  ● Recorded    │                                            │
│  ● In editing  │                                            │
│                │                                            │
│  ▼ POST-PROD   │                                            │
│  ◉ Published   │                                            │
│  ◉ Shorts done │                                            │
│  ◎ Archived    │                                            │
│                │                                            │
│  [Filter ▼]    │                                            │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

### Navbar
- App name: "Content Board"
- Quick-add button for new content
- User profile with sign-out option

### Left Sidebar
- Search box (searches title and tags)
- Content list grouped by phase (Pre-Production, Production, Post-Production)
- Collapsible phase groups with visual status indicators (icons or color dots)
- Visual status indicators per item showing current lifecycle stage
- Drag-to-reorder within Pre-Production stages
- Filter dropdown (All, Pre-Production, Production, Post-Production, or individual statuses)

### Detail Panel

#### Content Tab
| Field          | Type                | Description                              |
|----------------|---------------------|------------------------------------------|
| Title          | Text input          | Video title                              |
| Description    | Textarea/Markdown   | Video description for YouTube            |
| Tags           | Chip input          | Topic-specific tags for organization     |
| Status         | Dropdown            | Draft, Ready, Published                  |
| YouTube URL    | URL input           | Added once published                     |
| Linked Content | List                | Related blog/LinkedIn URLs with labels   |
| Notes          | Textarea            | Freeform notes, script ideas, etc.       |

#### Production Tab
| Field               | Type              | Description                                                  |
|---------------------|-------------------|--------------------------------------------------------------|
| Demo Items          | List              | What to use for demo / technical example (repo, command, live-coding scenario, config file) |
| Talking Points      | Ordered List      | Important things to mention in video, with optional priority flag |
| Shooting Script     | Textarea/Markdown | Outline of the shooting script — scene-by-scene flow         |
| Thumbnail Ideas     | Textarea          | Visual concepts for the video thumbnail                      |

**Demo Items Structure:** Each item has a type (repo, command, live-coding, config-file, tool-setup) and a description. Can be marked as "verified" once tested.

**Talking Points Structure:** Ordered list with optional category tags (technical, engagement, CTA). Priority flags: must-say, nice-to-have.

**Interaction:** Add new demo item / talking point buttons, drag to reorder talking points, checkbox to mark demo items as verified.

#### Learn Tab
| Field            | Type              | Description                                    |
|------------------|-------------------|------------------------------------------------|
| Learning text    | Textarea          | What was learned while creating this video     |
| Date added       | Auto-timestamp    | When the learning was captured                 |
| Applied in       | Dropdown/Link     | Reference to future video where applied        |

**Interaction:** Add new learning button, list of existing learnings with edit/delete options.

#### Feedback Tab
| Field          | Type              | Description                              |
|----------------|-------------------|------------------------------------------|
| Source         | Dropdown          | Self, Peer, Family, Comment              |
| Feedback text  | Textarea          | The feedback content                     |
| Date added     | Auto-timestamp    | When feedback was captured               |

**Interaction:** Add new feedback button, list of existing feedback with edit/delete options.

---

## Data Model

### Firestore Collection: `contents`

```json
{
  "id": "auto-generated",
  "title": "Getting Started with Claude Code",
  "description": "A beginner-friendly guide to...",
  "tags": ["claude-code", "ai", "tutorial"],
  "status": "draft",
  "phase": "pre-production",
  "order": 1,
  "youtubeUrl": null,
  "demoItems": [
    {
      "id": "demo-1",
      "type": "live-coding",
      "description": "Show CLAUDE.md before/after output comparison",
      "verified": false
    }
  ],
  "talkingPoints": [
    {
      "id": "tp-1",
      "text": "Explain the difference between project-level and global CLAUDE.md",
      "category": "technical",
      "priority": "must-say",
      "order": 1
    }
  ],
  "shootingScript": null,
  "thumbnailIdeas": null,
  "linkedContent": [
    {
      "id": "lc-1",
      "platform": "blog",
      "url": "https://jitangupta.com/...",
      "label": "Blog post"
    }
  ],
  "notes": "Remember to show the terminal setup first...",
  "learnings": [
    {
      "id": "learn-1",
      "text": "Screen recording works better at 1080p",
      "dateAdded": "2025-01-15T10:30:00Z",
      "appliedInContentId": null
    }
  ],
  "feedback": [
    {
      "id": "fb-1",
      "source": "self",
      "text": "Pacing was too fast in the middle section",
      "dateAdded": "2025-01-20T14:00:00Z"
    }
  ],
  "timestamps": {
    "created": "2025-01-10T08:00:00Z",
    "technicallyReady": null,
    "shootingScriptReady": null,
    "readyToRecord": null,
    "recorded": null,
    "edited": null,
    "published": null,
    "shortsExtracted": null,
    "lifetimeValueEnds": null,
    "updated": "2025-01-20T14:00:00Z"
  }
}
```

### Status Enum (grouped by phase)

**Pre-Production Phase:**
- `draft` — Initial idea, work in progress
- `technically-ready` — Demos verified, technical examples prepared
- `shooting-script-ready` — Script outline complete, talking points finalized
- `ready-to-record` — Everything prepared, ready to hit record

**Production Phase:**
- `recorded` — Video footage captured
- `edited` — Post-production editing complete

**Post-Production Phase:**
- `published` — Live on YouTube
- `extracted-shorts` — Short-form clips extracted and published
- `lifetime-value-ends` — Content archived, no longer actively promoted

### Phase Enum
- `pre-production` — Planning and preparation stages
- `production` — Recording and editing stages
- `post-production` — Publishing and distribution stages

### Indexes Required
- `phase` + `status` + `order` (for sorted queries within phase/status groups)
- `tags` (array-contains for filtering)
- `title` (for search, may need additional search solution for full-text)
- `demoItems.verified` (for filtering unverified demos in pre-production)

---

## Application Flow

### Authentication Flow
1. User opens app → Firebase Auth checks session
2. If not authenticated → Show Google sign-in button
3. On sign-in → Verify user is authorized (whitelist check)
4. If authorized → Load dashboard
5. If not authorized → Show "Access denied" message

### Content Creation Flow
1. User clicks "+ New Content" in navbar
2. New content item created with status "Draft" and default order (top of draft list)
3. Detail panel opens with Content tab active
4. User fills in title, description, tags, notes
5. Auto-save on field blur or after typing pause

### Content Lifecycle Flow

**Pre-Production Phase:**
1. **Draft:** Idea captured, being developed — title, description, tags, notes
2. User prepares demo items and verifies them → moves to "Technically Ready" → `timestamps.technicallyReady` recorded
3. **Technically Ready:** All demos work, technical examples prepared
4. User writes shooting script and finalizes talking points → moves to "Shooting Script Ready" → `timestamps.shootingScriptReady` recorded
5. **Shooting Script Ready:** Script and talking points complete
6. User reviews everything, confirms setup → moves to "Ready to Record" → `timestamps.readyToRecord` recorded

**Production Phase:**
7. **Ready to Record:** Everything prepared, waiting to record
8. User records video → moves to "Recorded" → `timestamps.recorded` recorded
9. **Recorded:** Raw footage captured, awaiting editing
10. User completes editing → moves to "Edited" → `timestamps.edited` recorded

**Post-Production Phase:**
11. **Edited:** Video ready for upload
12. User uploads to YouTube, adds YouTube URL → moves to "Published" → `timestamps.published` recorded
13. **Published:** Content is live, learnings and feedback collected
14. User extracts short-form clips → moves to "Extracted Shorts" → `timestamps.shortsExtracted` recorded
15. **Extracted Shorts:** All derivative content created
16. Content eventually moves to "Lifetime Value Ends" → `timestamps.lifetimeValueEnds` recorded — content archived

### Learning Capture Flow
1. User selects a video (any status)
2. Opens Learn tab
3. Clicks "Add Learning"
4. Enters learning text → auto-saves with timestamp
5. Later, when creating new content, user can link learning via "Applied in" field

### Feedback Capture Flow
1. User selects a video (typically Published)
2. Opens Feedback tab
3. Clicks "Add Feedback"
4. Selects source (Self, Peer, Family, Comment)
5. Enters feedback text → auto-saves with timestamp

---

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated owner can read/write
    match /contents/{contentId} {
      allow read, write: if request.auth != null 
        && request.auth.token.email == 'YOUR_EMAIL@gmail.com';
    }
  }
}
```

---

## Project Milestones

### Phase 1: Foundation
- [ ] Firebase project setup
- [ ] Authentication with Google sign-in
- [ ] Basic React app structure
- [ ] Firestore integration

### Phase 2: Core UI
- [ ] Dashboard layout (navbar, sidebar, detail panel)
- [ ] Content list in sidebar with status grouping
- [ ] Content tab with all fields
- [ ] Create, edit, delete content

### Phase 3: Learning & Feedback
- [ ] Learn tab implementation
- [ ] Feedback tab implementation
- [ ] Linking learnings to future content

### Phase 4: Organization
- [ ] Drag-to-reorder for Draft and Ready
- [ ] Filter by status
- [ ] Search by title and tags

### Phase 5: Polish
- [ ] Mobile responsive design
- [ ] Timestamp tracking and display
- [ ] Status transition animations
- [ ] Error handling and loading states

### Phase 6: Content Creation (Meta)
- [ ] Document the build process
- [ ] Create YouTube video: "Building a Personalized Content Board with Claude Code"

---

## Content Opportunity

This project itself is content. The app manages the videos about the tools used to build it.

### Initial Video Series: Claude Code for Production Engineering

| # | Title | Hindi Subtitle | Status |
|---|-------|----------------|--------|
| 4 | Skills + Code Generation Guardrails + Code Review Policy | Claude Code ke output ko control karna — production-grade code kaise nikaalein | Draft |
| 5 | AI-Assisted Development Flow | Mera actual daily workflow — kab trust karna hai, kab override karna hai | Draft |
| 6 | Multi-Agent Parallel Development with Git Worktrees | Ek saath 3-4 Claude agents chalao alag alag branches pe — real parallel coding | Draft |
| 7 | Claude Code + GitHub Actions — AI in CI/CD Pipeline | @claude mention karo PR mein — automated code review, security scan, release notes | Draft |
| 8 | Custom Slash Commands, Hooks, and Subagents | Claude Code ko apna engineering toolkit banao — /deploy-check, auto-lint, custom agents | Draft |

See `content/video-list.md` for detailed production plans per video.

---

## Open Questions

1. **Full-text search:** Firestore doesn't support full-text search natively. Options: Algolia integration, client-side filtering for v1, or Firebase Extensions.

2. **Backup strategy:** Periodic Firestore exports? Manual JSON downloads?

3. **Mobile app vs PWA:** Start with responsive web (PWA-capable) or native mobile later?

---

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

*Document created: January 31, 2025*  
*Last updated: January 31, 2025*
