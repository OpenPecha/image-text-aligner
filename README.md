# TextAlign - Image-Text Alignment Tool

A React-based application for manual text transcription correction with a 3-tier QA pipeline.

## Features

- **3-Tier Quality Assurance Pipeline**

  - **Transcriber**: Receives noisy text and performs initial correction
  - **Reviewer**: Validates corrections, can approve or reject
  - **Final Reviewer**: Performs ultimate sanity check for "Gold Standard" approval
- **Role-Based Dashboards**: Dedicated views for each user type showing pending tasks, rejected items, and completion metrics
- **Editor Workspace**: Side-by-side comparison of source image (with pan/zoom) and editable text field
- **State Machine Logic**: Strict tracking of task assignments and rejections with full audit history

## Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: Zustand (UI/auth) + TanStack Query (server state)
- **Image Viewer**: react-zoom-pan-pinch

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

|  |  |  |
| - | - | - |

```
span
```

## Task State Machine

```
Pending → InProgress → AwaitingReview → InReview → AwaitingFinalReview → FinalReview → Completed
                                            ↓                                 ↓
                                        Rejected ←─────────────────────────────┘
                                            ↓
                                        InProgress (re-assigned)
```

## Keyboard Shortcuts

- `Ctrl/Cmd + +`: Zoom in image
- `Ctrl/Cmd + -`: Zoom out image
- `Ctrl/Cmd + 0`: Reset zoom
- `Ctrl/Cmd + S`: Save draft (in editor)

## License

MIT
