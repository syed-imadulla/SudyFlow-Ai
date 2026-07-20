# Project Overview

## Project Vision
StudyFlow AI is an intelligent, automated study planning and tracking ecosystem designed to help users manage their academic and personal goals. It breaks down high-level goals into actionable milestones, schedules them dynamically, tracks focus, and provides analytics—all orchestrated by an AI Study Coach.

## Core Modules
1. **Goals**: High-level objectives that the user wants to achieve.
2. **Milestones**: Breakdown of goals into actionable sub-tasks.
3. **Planner**: The core scheduling engine (Daily, Weekly, Monthly views) that allocates time for milestones.
4. **Focus**: Active tracking of study sessions, timers, and distraction management.
5. **Analytics**: Insights into study habits, completion rates, and productivity metrics.
6. **AI Coach**: Intelligent assistant that analyzes deadlines, suggests schema drafts, and provides context-aware guidance.

## Technology Stack

### Frontend Stack
- **Core**: Vanilla HTML, CSS, JavaScript
- **Styling**: Tailwind CSS (via CDN/local build)
- **State Management**: Custom lightweight global store (`window.SF_STORE`)
- **Routing**: Custom modular router (`router.js`)

### Backend Stack
- **Runtime**: Node.js
- **Database**: MongoDB (Mongoose ODMs)
- **Architecture**: REST API
