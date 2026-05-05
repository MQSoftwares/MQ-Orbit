# PWA component checklist

Every new component added to MQOrbit should be ready for browser, Android PWA, and iOS PWA use.

- Keep touch targets large enough for mobile use, especially for primary actions and icon buttons.
- Respect safe areas on notched devices by avoiding hard-coded edge-to-edge spacing.
- Do not rely on hover-only behavior for essential actions.
- Keep keyboard navigation and visible focus states intact.
- Prefer `dvh`-aware layouts for full-height surfaces and mobile shells.
- Handle empty, loading, error, and offline states when the component depends on remote data.
- Avoid browser-only assumptions when storing state or session data.
- Use the existing form abstraction for any input flow.
- Keep text hardcoded inside the component when content is part of the UI.
- Stay within the MQ palette and the existing typography already configured in the app.
