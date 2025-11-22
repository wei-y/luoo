# Luoo MP3 Player

![Luoo Player Demo](docs/demo.gif)

A modern, minimalist web-based music player inspired by Luoo.net. for browsing and listening to Luoo music journals. Built with React (Vite) and Node.js (Express).

## Features

-   **Journal Browsing**: Browse music journals with pagination and tag filtering.
-   **Music Playback**: Continuous playback with a persistent player bar.
-   **Volume Details**: View detailed information about each journal, including cover art, description, and tracklist.
-   **Tag System**: Filter journals by genres, moods, and other tags.
-   **Responsive Design**: Modern, dark-themed UI with a responsive layout.

## Tech Stack

-   **Frontend**: React, Vite, React Router, Axios
-   **Backend**: Node.js, Express
-   **Database**: SQLite3

## Prerequisites

-   Node.js (v14+ recommended)
-   npm

## Installation

The project is divided into `client` and `server` directories. You need to set up both.

### 1. Server Setup

```bash
cd server
npm install
```

### 2. Client Setup

```bash
cd client
npm install
```

### 3. Data Setup

The application requires a `data` directory in the project root containing the music files and images. This should be a symbolic link to your actual data source.

```bash
# Replace /path/to/your/real/data with the actual path
ln -s /path/to/your/real/data ./data
```

### 3.1 Running with Test Data (Stub)

If you don't have access to the real data, you can generate a set of test data (stub) to run the application in demo mode.

1.  **Generate Test Data**:
    ```bash
    npm run generate-data
    ```
    This will create a `test-data` directory with a sample database and dummy MP3 files.

2.  **Link Test Data**:
    ```bash
    ln -s $(pwd)/test-data ./data
    ```
    *Note: If a `data` folder already exists, rename or remove it first.*

## Running the Application

You need to run both the backend server and the frontend development server.

### Start the Backend

In a terminal:

```bash
cd server
node index.js
```
The server will start on `http://localhost:3001`.

### Start the Frontend

In a separate terminal:

```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173` (or another available port).

## Project Structure

-   **/client**: React frontend application.
    -   `src/components`: UI components (TagList, VolumeDetail, Player, etc.).
    -   `src/api.js`: API integration functions.
-   **/server**: Node.js backend application.
    -   `index.js`: Express server and API routes.
    -   `db.js`: Database connection and query logic.
    -   `luoo.db`: SQLite database file (ensure this exists or is generated).
-   **/data**: Directory containing volume data (mp3s, images) - *Note: This is expected to be mapped or present for the app to function fully.*

## API Endpoints

-   `GET /api/journals`: Get paginated journals.
-   `GET /api/journals/:id`: Get details for a specific journal.
-   `GET /api/journals/:id/songs`: Get songs for a specific journal.
-   `GET /api/tags`: Get all tags.
-   `GET /api/tags/:id/journals`: Get journals filtered by a tag.

## Testing

This project uses [Playwright](https://playwright.dev/) for End-to-End (E2E) and API testing.

### Running Tests

1.  **Install Dependencies** (if not already done):
    ```bash
    npx playwright install --with-deps
    ```

2.  **Run All Tests**:
    ```bash
    npx playwright test
    ```
    This will run all tests on Chromium, Firefox, and WebKit in headless mode.

3.  **Run Specific Tests**:
    ```bash
    npx playwright test tests/e2e/navigation.spec.js
    ```

4.  **View Report**:
    ```bash
    npx playwright show-report
    ```

### Test Structure

-   `tests/api/`: API tests for backend endpoints.
-   `tests/e2e/`: UI tests for user flows (Navigation, Player, Filtering).
-   `tests/pages/`: Page Object Models (POM) for maintainable test code.
