# MapMates

MapMates is a cross-platform geography guessing game. Players identify a country from an image while keeping track of score and streaks. The project targets iOS, Android, and the web using Expo + React Native.

## Features
- Expo-managed React Native project with TypeScript for iOS, Android, and web.
- Multiplayer rounds backed by a lightweight Node.js + Socket.IO service.
- Live guess sharing: every option shows how many teammates have locked it in, with a yellow highlight on your pending choice.
- Dynamic scoring: the first correct guess earns 10 points, later correct matches earn 9, and the scoreboard updates in real time.
- Automatic pacing: a 10-second timer starts after the first guess and evaluates the round if anyone is still thinking.
- Centralised client state with Zustand, ready-to-extend country data, and a Docker workflow for consistent tooling.

## Tech Stack
- [Expo](https://expo.dev/) + React Native 0.81
- TypeScript
- Zustand for lightweight state management
- React Navigation for navigation
- Socket.IO for multiplayer transport
- Jest + Testing Library for component/unit tests

## Project Structure
```
.
+-- App.tsx
+-- app.json
+-- babel.config.js
+-- docker-compose.yml
+-- Dockerfile
+-- server
|   +-- index.js
+-- src
|   +-- components
|   +-- context
|   +-- data
|   +-- screens
|   +-- utils
+-- tsconfig.json
```

## Getting Started
### 1. Install dependencies
```bash
npm install
```

### 2. Start the multiplayer server
```bash
cd server
npm install
npm start
```
The server listens on port `4000` by default. Environment overrides are accepted via `PORT`.

### 3. Run the client
- Native (Expo Go): `npm run start`
- Dev client: `npm run start:dev-client`
- Web only: `npm run start:web`
- Jest tests: `npm test`
- Lint/typecheck: `npm run lint` and `npm run typecheck`

### 4. Running with Docker
The repository ships with a Docker workflow for teams that prefer containerised tooling.

```bash
docker compose up --build
```

This command runs `npm install` during the first build, starts Expo inside the container, and exposes:
- `19000` - Metro/Expo bundler (native)
- `19001` - Expo WebSocket channel
- `19002` - Expo dev tools UI
- `8081` - Metro asset server / React Native web

The project folder is mounted into the container, so code changes on the host trigger hot reloads inside Expo. The container keeps its own `node_modules` to avoid polluting the host machine.

### 5. Connecting devices
- **Web**: open `http://localhost:19002` and launch the web preview.
- **Android/iOS**: attach a simulator/emulator or scan the QR from the Expo dev tools.

_Note:_ Building native binaries (Gradle/Xcode) is out of scope for this container setup. For production builds use Expo Application Services or a dedicated CI workflow.

## Extending the Game Data
The current dataset (`src/data/countries.ts`) points at a small set of image assets under `assets/countries/`. To add more countries:
1. Drop a suitably cropped image (PNG/SVG/WebP) in `assets/countries/` and name it with the ISO alpha-3 code (e.g. `BRA.png`).
2. Add an entry to the array in `src/data/countries.ts` with the code, display name, region, optional neighbour list, and `require` path to the asset.
3. Run the test suite (`npm test`) and expand the question bank as needed.

Keep file sizes low for mobile builds. Tools like ImageOptim or Squoosh help compress while retaining clarity.

## Next Steps / Ideas
- Flesh out the country list and attach additional metadata (capital, trivia hints, etc.).
- Expand timed/competitive modes with leaderboards and matchmaking.
- Track per-round analytics for difficulty tuning.
- Integrate sound effects and onboarding tutorials.
- Deploy the web build to a static host (e.g. Vercel, Netlify, GitHub Pages).

## License
Add your preferred licence here (MIT by default).

## Branding
- App icon (Expo + Play Store): assets/icon.png

## Privacy Policy
_Last updated: 26 September 2025_

This policy explains how MapMates collects, uses, and shares the information needed to power the game, including the multiplayer experience hosted on our Railway backend.

### Information We Collect
- **Player-provided data**: nicknames, optional lobby names, and region preferences that you enter when creating or joining a multiplayer game.
- **Gameplay data**: answers, scoring events, and lobby state updates required to run a round. Campaign progress is stored locally on your device so you can continue where you left off.
- **Device context**: Expo and the underlying mobile platforms supply non-identifying diagnostics (such as OS version, device model, and crash reports) to help us monitor performance and stability.

We do **not** collect government IDs, email addresses, phone numbers, advertising IDs, or precise location information inside the app.

### How We Use the Information
- Run real-time multiplayer sessions, sync guesses between players, and keep score.
- Maintain local campaign progress using Expo Secure Store so only your device can read the data.
- Diagnose stability issues, prevent abuse, and improve future updates.

### Data Sharing and Retention
- Multiplayer data is transferred over HTTPS to our Socket.IO server hosted on Railway. Game state lives in memory only and is discarded when a lobby ends or the server restarts.
- We do not sell personal data or share it with advertisers. Service providers that help us operate MapMates (Railway, Expo services, and platform app stores) may process limited information according to their own privacy practices.
- Locally stored campaign progress remains on your device until you clear the app data, uninstall the game, or use the in-app reset option.

### Children
MapMates is designed for a general audience but is not directed to children under 13. If you are under 13, please play under the supervision of a parent or guardian.

### Security
We encrypt multiplayer traffic in transit using HTTPS/WSS. While no system can guarantee absolute security, we actively review our infrastructure and minimise the data we handle.

### Contact
Questions or feedback? Reach out via the developer contact email listed on the MapMates Google Play Store page (currently [linusekvall89@gmail.com](mailto:linusekvall89@gmail.com)).
