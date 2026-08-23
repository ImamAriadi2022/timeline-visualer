# Timeline Visualizer

A minimal, local-first web application to turn Google Maps Timeline exports into interactive route visualizations and MP4 videos.

## 🚀 Live Demo

- **Vercel Production**: [https://timeline-visualer.vercel.app/](https://timeline-visualer.vercel.app/)
- **Local Dev Server**: [http://localhost:3000](http://localhost:3000)

---

## 🧭 Features

- **Local-First & Private**: GPS and location history are processed and stored exclusively in your browser via IndexedDB. No location data is sent to external servers.
- **Universal Timeline Parser**: Supports Google Maps modern `Linimasa.json` export (`semanticSegments`, `timelinePath`, `visit`, `activity`, `rawSignals`), Google Takeout `timelineObjects`, and `locations` history files.
- **4 Visual Storytelling Styles**:
  - **Normal**: Clean minimalist polyline route tracing.
  - **Travel**: Cinematic path glow with waypoint reveals.
  - **Transport**: High-contrast electric styling for transit modes.
  - **Vehicle**: Direction-aligned vehicle tracer following the movement trajectory.
- **Video Export (MP4)**:
  - Formats: 9:16 Vertical, 1:1 Square, 16:9 Landscape.
  - Configurable duration between 5 to 90 seconds.
- **Follow Proof Unlock Gate**: AI-powered screenshot follow verification for `@timelinevisualizer`.

---

## 🛠️ Getting Started Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   AI_API_KEY=your_openrouter_api_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
