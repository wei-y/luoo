# Retrospective: Luoo Project (Full Lifecycle)

## Project Overview
This project involved reviving the "Luoo" music journal application using a provided SQLite database and a directory of MP3 files. The goal was to build a modern web interface (React) backed by a Node.js/Express server to browse journals and play music.

## Summary of Phases

### Phase 1: Discovery & Backend Setup
*   **Input**: Received a legacy `luoo.db` (SQLite) and a `vols` directory containing MP3s organized by journal.
*   **Analysis**: Reverse-engineered the database schema (`journal`, `song`, `tag`, `journal_tag_mapping`) to understand relationships.
*   **Implementation**:
    *   Built an Express.js server to expose API endpoints (`/api/journals`, `/api/tags`).
    *   Implemented logic to map database entries to the physical file structure for serving audio.
    *   Handled legacy data quirks (e.g., non-standard path separators, encoding issues).

### Phase 2: Frontend Development
*   **Tech Stack**: React, Vite, Vanilla CSS (custom design system).
*   **Core Features**:
    *   **Journal Grid**: Displayed journals with cover images and descriptions.
    *   **Player**: Built a persistent music player with playlist support, play/pause, and progress tracking.
    *   **Navigation**: Implemented routing for Home, Journal Details, and Tag Filtering.
*   **UI/UX**:
    *   Designed a clean, minimal interface inspired by the original aesthetic.
    *   Implemented "glassmorphism" effects and smooth transitions.
    *   Solved layout challenges like sticky sidebars and scrollable content areas.

### Phase 3: Refinement & Polish
*   **Tagging System**: Implemented a robust tagging system to filter journals by genre/mood.
*   **Performance**: Optimized image loading and asset serving.
*   **Bug Fixes**: Resolved issues with scrolling, z-index layering, and player state management.

### Phase 4: CI/CD & Reliability (Recent)
*   **Testing**: Introduced Playwright for End-to-End (E2E) and API testing.
*   **CI Pipeline**: Configured GitHub Actions to automate testing on every push.
*   **Test Data**:
    *   Created a robust test data generation script to create a self-contained environment for CI.
    *   Bundled a real, license-free MP3 sample to ensure reliable playback testing without external dependencies.
    *   Solved complex path resolution issues for cross-platform compatibility (CI vs. Local).

---

## Suggestions for Future Projects

If starting a similar project from scratch, here are key architectural and process improvements:

### 1. Data & Asset Management
*   **Decouple Storage**: Instead of relying on a local file system structure (which caused significant complexity with symlinks and paths), use an Object Store (like AWS S3) for media files. Store the *URL* in the database, not the *file path*.
*   **Database Migration**: The legacy SQLite DB was a good starting point, but for a new project, use an ORM (like Prisma or TypeORM) with a strongly typed schema. This would prevent many "magic string" issues and make refactoring safer.

### 2. Frontend Architecture
*   **State Management**: We used local React state and context. For a music player app, a dedicated state manager (like Zustand or Redux) is often better for handling complex global states (playlist, current track, playback status, volume) to avoid prop drilling and re-render issues.
*   **Component Library**: While custom CSS gave us full control, using a headless UI library (like Radix UI) for complex interactive components (sliders, modals, popovers) would save time and ensure accessibility.

### 3. Testing Strategy
*   **Test Early**: We added tests at the end. Adopting TDD (Test Driven Development) or at least writing API tests alongside endpoint creation would have caught regression bugs earlier (e.g., the API response format changes).
*   **Mocking**: For the frontend, mocking the API responses (using MSW - Mock Service Worker) allows UI development to proceed even if the backend isn't ready or data is missing.

### 4. Infrastructure
*   **Dockerization**: Containerizing the app from Day 1 is the single biggest improvement for developer experience. It ensures that the database, server, and client run in the exact same environment on every machine and in CI, eliminating the "works on my machine" class of bugs we faced with file paths.

### 5. Documentation
*   **Living Docs**: Keep a `docs/` folder with architecture diagrams and API specs (OpenAPI/Swagger). This helps when onboarding or when returning to the project after a break.
