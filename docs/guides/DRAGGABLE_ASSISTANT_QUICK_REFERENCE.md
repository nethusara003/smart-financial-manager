# ⚡ DraggableAssistant - Quick Customization Reference

## 🎨 Common Customizations

### 1. Change Button Color
**File:** `frontend/src/components/chatbot/DraggableAssistant.jsx`

Find the button className around line 450:
```javascript
// Current (Blue gradient)
bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600

// Examples:
bg-gradient-to-r from-purple-500 to-purple-600        // Purple
bg-gradient-to-r from-emerald-500 to-emerald-600      // Green
bg-gradient-to-r from-rose-500 to-rose-600            // Pink
bg-gradient-to-r from-amber-500 to-amber-600          // Orange
bg-gradient-to-r from-cyan-500 to-cyan-600            // Cyan (Tracksy theme!)
```

Update the focus ring color too:
```javascript
focus:ring-blue-500/50  →  focus:ring-[your-color]-500/50
```

### 2. Change Button Size
**File:** `frontend/src/components/chatbot/DraggableAssistant.jsx`

Find the BUTTON_SIZE constant (line ~55):
```javascript
const BUTTON_SIZE = 56;  // 56px (14 * 4)

// Options:
const BUTTON_SIZE = 48;  // 48px (12 * 4) - Smaller
const BUTTON_SIZE = 64;  // 64px (16 * 4) - Larger
const BUTTON_SIZE = 72;  // 72px (18 * 4) - XL
```

Also update the Tailwind classes:
```javascript
w-14 h-14  →  w-12 h-12  (for 48px)
w-14 h-14  →  w-16 h-16  (for 64px)
w-14 h-14  →  w-20 h-20  (for 72px)
```

### 3. Disable Inertia Effect
If you want the button to snap immediately without momentum:

```javascript
// In handleDragEnd function, replace:
if (Math.abs(velX) > MIN_VELOCITY || Math.abs(velY) > MIN_VELOCITY) {
  applyInertia(finalPos, velX, velY);
  return;
}

// With:
// Skip inertia - snap directly
const snappedPos = snapToEdge(finalPos);
const magneticPos = getMagneticPosition(snappedPos);
animateSnap(magneticPos);
```

### 4. Disable Magnetic Snapping
To snap directly to edges without magnetic pull:

```javascript
// Find the snapToEdge function and remove the magnetic pull:
// Comment out or remove the getMagneticPosition call

// Current (line ~419):
animateSnap(magneticPos);

// Change to:
animateSnap(snappedPos);  // Skip magnetic positioning
```

### 5. Snap to All 4 Corners
**File:** `frontend/src/components/chatbot/DraggableAssistant.jsx`

Replace the `snapToEdge` function (around line 200):

```javascript
/**
 * Snap to nearest corner instead of edge
 */
const snapToCorner = useCallback((pos) => {
  if (!pos) return null;

  const corners = [
    { x: PADDING, y: PADDING },                                    // Top-left
    { x: window.innerWidth - BUTTON_SIZE - PADDING, y: PADDING }, // Top-right
    { x: PADDING, y: window.innerHeight - BUTTON_SIZE - PADDING - BOTTOM_RESTRICTED_ZONE },                         // Bottom-left
    { x: window.innerWidth - BUTTON_SIZE - PADDING, y: window.innerHeight - BUTTON_SIZE - PADDING - BOTTOM_RESTRICTED_ZONE }, // Bottom-right
  ];

  // Find closest corner
  let closestCorner = corners[0];
  let minDistance = Infinity;

  corners.forEach(corner => {
    const dx = pos.x - corner.x;
    const dy = pos.y - corner.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      minDistance = distance;
      closestCorner = corner;
    }
  });

  return closestCorner;
}, []);
```

Then in `handleDragEnd`, change:
```javascript
// From:
const snappedPos = snapToEdge(finalPos);

// To:
const snappedPos = snapToCorner(finalPos);
```

### 6. Disable Position Persistence
Don't save position to localStorage:

```javascript
// Comment out the savePosition call in animateSnap (line ~410):
// savePosition(targetPos);

// Also remove the localStorage loading in useEffect (line ~155)
// Or just skip the localStorage.setItem call
```

### 7. Always Snap to Right Side
**File:** `frontend/src/components/chatbot/DraggableAssistant.jsx`

Modify the `snapToEdge` function:

```javascript
const snapToEdge = useCallback((pos) => {
  if (!pos) return null;
  
  // Always snap to right
  const snappedX = window.innerWidth - BUTTON_SIZE - PADDING;

  return {
    x: snappedX,
    y: pos.y,
  };
}, []);
```

### 8. Slower Snap Animation
Increase the snap duration:

```javascript
const SNAP_DURATION = 200;  →  const SNAP_DURATION = 500; // 500ms
```

### 9. Tighter Boundary Constraints
Reduce padding from edges:

```javascript
const PADDING = 10;  →  const PADDING = 2;  // Edge-hugging
```

### 10. Wider Bottom Restricted Zone
If your navbar is taller:

```javascript
const BOTTOM_RESTRICTED_ZONE = 120;  →  const BOTTOM_RESTRICTED_ZONE = 180;
```

---

## 🔧 Advanced Customizations

### Custom Snap Target Function
```javascript
/**
 * Snap to a specific position or fixed grid
 */
const snapToGrid = useCallback((pos, gridSize = 50) => {
  return {
    x: Math.round(pos.x / gridSize) * gridSize,
    y: Math.round(pos.y / gridSize) * gridSize,
  };
}, []);
```

### Add Drag Handle Region
Only allow dragging from a specific area:

```javascript
// In handleMouseDown, add a check:
const dragHandle = containerRef.current;
const rect = dragHandle.getBoundingClientRect();
const isInDragHandle = 
  e.clientX >= rect.left && 
  e.clientX <= rect.right && 
  e.clientY >= rect.top && 
  e.clientY <= rect.bottom;

if (!isInDragHandle) return;
handleDragStart(e);
```

### Add Drag Delay (Requires longer press to drag)
```javascript
// In handleMouseDown:
const dragDelay = 300; // 300ms before dragging starts
let dragTimeoutId = setTimeout(() => {
  handleDragStart(e);
}, dragDelay);

const handleMove = () => {
  clearTimeout(dragTimeoutId);
  hasMoved = true;
};
```

### Disable Dragging on Mobile
```javascript
const handleMouseDown = useCallback((e) => {
  if (window.innerWidth < 768) return; // Disable on mobile
  // ... rest of code
}, []);
```

### Add Haptic Feedback (Mobile)
```javascript
const handleDragEnd = useCallback((e) => {
  // ... existing code
  
  // Haptic feedback on mobile
  if (navigator.vibrate) {
    navigator.vibrate(10); // 10ms vibration
  }
}, []);
```

---

## 🎨 Visual Customizations

### Change Icon
Replace the SVG icon (around line 490):

```javascript
// Current chat icon - replace with your own SVG:
<svg
  className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>
  {/* Your custom SVG path here */}
</svg>
```

Or use lucide-react icons:
```javascript
import { MessageCircle } from 'lucide-react';

<MessageCircle size={24} />
```

### Add Badge/Counter
Add a message counter to the button:

```javascript
{/* In the icon container, add: */}
{hasNewMessage && (
  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
    3  {/* message count */}
  </span>
)}
```

### Pulse Animation on New Messages
```javascript
// Add to button className:
${hasNewMessage ? 'animate-pulse' : ''}
```

### Add Label Text
```javascript
// After the icon, add text:
<span className="ml-2 text-sm font-semibold">Chat</span>
```

---

## 📊 Configuration Presets

### Mobile-Optimized
```javascript
const BUTTON_SIZE = 64;          // Bigger for touch
const SNAP_THRESHOLD = 50;       // Easier to snap
const PADDING = 5;               // Tight edges
const SNAP_DURATION = 150;       // Faster feedback
const INERTIA_DAMPING = 0.88;    // More momentum
```

### Conservative (Minimal Movement)
```javascript
const PADDING = 20;              // Wide safety zone
const SNAP_THRESHOLD = 10;       // Tight snapping
const SNAP_DURATION = 300;       // Slow animation
const INERTIA_DAMPING = 0.99;    // Almost no momentum
```

### Playful (Bouncy)
```javascript
const SNAP_THRESHOLD = 80;       // Strong magnetic pull
const SNAP_DURATION = 100;       // Quick snap
const INERTIA_DAMPING = 0.90;    // More bounce
```

### Gaming-Style (Fast & Responsive)
```javascript
const BUTTON_SIZE = 64;
const PADDING = 5;
const SNAP_DURATION = 80;
const INERTIA_DAMPING = 0.85;    // Lots of momentum
const MIN_VELOCITY = 0.05;       // Easy inertia trigger
```

---

## 🧪 Testing Your Changes

### Test Dragging Works
1. Open the app
2. Find the floating button (bottom-right by default)
3. Click and drag it around
4. Release to watch it snap

### Test Persistence
1. Drag button to a new position
2. Refresh the page (`F5`)
3. Button should be in the same position

### Test Mobile
1. Open DevTools (`F12`)
2. Toggle device toolbar (mobile view)
3. Touch and drag the button
4. Should work smoothly

### Test Boundaries
1. Try to drag beyond viewport edges
2. Button should stop at padding boundary
3. Try dragging to bottom - should avoid restricted zone

---

## 📝 Code Snippets for Common Tasks

### Get Current Button Position (in browser console)
```javascript
const saved = localStorage.getItem('ai-assistant-position');
console.log(JSON.parse(saved));
```

### Programmatically Set Position
```javascript
// In your code:
const newPosition = { x: 100, y: 200 };
localStorage.setItem('ai-assistant-position', JSON.stringify(newPosition));
location.reload();
```

### Disable All Animations
```javascript
// In DraggableAssistant.jsx, remove transition classes:
// From: transition-all duration-200
// To: (remove it)
```

### Add Zoom Effect on Drag Start
```javascript
// In handleDragStart:
if (containerRef.current) {
  containerRef.current.style.transform = 'scale(1.1)';
}
```

---

## 🚀 Performance Tips

1. **Reduce Animation Duration** for mobile
   ```javascript
   const SNAP_DURATION = 100; // Faster on mobile
   ```

2. **Disable Inertia** on low-end devices
   ```javascript
   if (navigator.deviceMemory < 4) {
     // Disable inertia
   }
   ```

3. **Throttle Touch Events** more aggressively
   ```javascript
   // In handleDragMove, reduce RAF frequency
   ```

---

## 📞 Need Help?

Refer to the main guide: `DRAGGABLE_ASSISTANT_GUIDE.md`

Key sections:
- **Troubleshooting** - Common issues
- **Feature Overview** - What it does
- **Customization Guide** - Detailed explanations
