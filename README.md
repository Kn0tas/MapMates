# MapMates

MapMates is a cross-platform geography guessing game. Players identify a country from a highlighted map that also shows its neighbouring nations. The project targets iOS, Android, and the web using Expo + React Native.

## Features
- Expo-managed React Native project with TypeScript for iOS/Android/web.
- Centralised state management with Zustand and an extendable country data model.
- SVG-based map renderer that highlights the target country and its neighbours.
- Basic scoring, streak tracking, and round history scaffolding ready for extension.
- Docker development workflow for consistent tooling across contributors.

## Tech Stack
- [Expo](https://expo.dev/) + React Native 0.74
- TypeScript
- Zustand for lightweight state management
- React Navigation for screen management
- React Native SVG for country silhouettes
- Jest + Testing Library for component/unit tests

## Project Structure
```
.
+-- App.tsx
+-- app.json
+-- babel.config.js
+-- docker-compose.yml
+-- Dockerfile
+-- src
¦   +-- components
¦   +-- context
¦   +-- data
¦   +-- screens
¦   +-- utils
+-- tsconfig.json
```

## Getting Started
### 1. Clone and install
```bash
npm install
```

### 2. Run the app
- Native (Expo Go): `npm run start`
- Dev client: `npm run start:dev-client`
- Web only: `npm run start:web`
- Jest tests: `npm test`
- Lint/typecheck: `npm run lint` and `npm run typecheck`

### 3. Running with Docker
The repository ships with a Docker workflow for teams that prefer containerised tooling.

```bash
docker compose up --build
```

This command runs `npm install` during the first build, starts Expo inside the container, and exposes the following ports:
- `19000` – Metro/Expo bundler (native)
- `19001` – Expo WebSocket channel
- `19002` – Expo dev tools UI
- `8081` – Metro asset server / React Native web

The project folder is mounted into the container, so code changes on the host trigger hot reloads inside Expo. The container keeps its own `node_modules` to avoid polluting the host machine.

### 4. Connecting devices
- **Web**: open `http://localhost:19002` and launch the web preview.
- **Android/iOS**: attach a simulator/emulator or scan the QR from the Expo dev tools.

_Note:_ Building native binaries (Gradle/Xcode) is out of scope for this container setup. For production builds use Expo Application Services or a dedicated CI workflow.

## Extending the Game Data
The current dataset (`src/data/countries.ts`) includes simplified silhouettes for a small subset of European countries to demonstrate the rendering pipeline. To expand:
1. Replace the placeholder SVG paths with simplified GeoJSON ? SVG exports (e.g. mapshaper + svg-path tools).
2. Add neighbours to `CountryGeometry.neighbors` so the UI can render their outlines and display badges.
3. Update tests or add new ones to cover scoring, timing, or additional game modes.

Consider splitting large datasets into lazy-loaded chunks or requesting them from a backend once the list grows.

## Next Steps / Ideas
- Import real geography data (TopoJSON/GeoJSON) and convert at build time.
- Add timed and streak-based game modes with leaderboards.
- Track per-round analytics for difficulty tuning.
- Integrate sound effects and onboarding tutorials.
- Deploy the web build to a static host (e.g. Vercel, Netlify, GitHub Pages).

## License
Add your preferred licence here (MIT by default).