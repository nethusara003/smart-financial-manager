# Overlay Component Standard

## Purpose
Defines the shared interaction contract for modal and popover-like UI layers, aligned with PROJECT_REVIEW.md Phase 3.1.

## Canonical Primitive
- Primary primitive: `frontend/src/components/ui/Overlay.jsx`.
- Required behavior built into Overlay:
  - Focus trap inside active layer.
  - Escape-to-close support.
  - Backdrop close support.
  - Body scroll lock while open.
  - Focus restore to the previously focused element when closed.

## Usage Rules
1. Use `Overlay` for modal/dialog and panel surfaces that block page interaction.
2. For anchored menus/dropdowns, use shared dismissal behavior:
   - Click-outside close via `frontend/src/hooks/useClickOutside.js`.
   - Escape-to-close behavior in component keyboard handling.
3. Do not add new custom fixed backdrops for menus if click-outside is sufficient.
4. Ensure every overlay/menu is keyboard dismissible.

## Migrated Consumers
- Modal consumers moved to shared Overlay include loan forms/modals, transfer PIN modal, budget modal flows, logout modal, and chatbot widget.
- Anchored menu residuals standardized to shared click-outside + Escape behavior:
  - `frontend/src/components/CurrencySelector.jsx`
  - `frontend/src/components/layout/UserDropdown.jsx`
  - `frontend/src/components/chatbot/ChatHeader.jsx`

## Accessibility Contract
- Dismiss with Escape.
- Focus remains constrained for modal/dialog overlays.
- Focus returns to trigger on close for Overlay-based surfaces.
- Click-outside closes anchored menus without introducing full-screen visual backdrops.

## Validation
```bash
cd frontend
npm run lint
npm run test:run
```
