/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, react-hooks/immutability */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { Overlay } from '../ui';
import ChatWindow from './ChatWindow';

/**
 * DraggableAssistant - Premium production-grade draggable widget
 * 
 * Features:
 * - Smooth mouse and touch drag support
 * - Viewport boundary constraints with 10px padding
 * - Automatic snapping to nearest screen edge (left/right)
 * - Position persistence via localStorage
 * - Automatic avoidance of bottom UI zones (bottom 120px)
 * - Performance optimized with useRef for drag state
 * - Premium visual design with hover scale and smooth transitions
 * - Full accessibility support
 * - Bonus: Magnetic edge snapping and subtle inertia effects
 * - Integrated with ChatContext for seamless state management
 */
const DraggableAssistant = () => {
  // ==================== CONTEXT ====================
  const { isOpen, openChat, closeChat, assistantName } = useChat();
  
  // ==================== STATE ====================
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  // Position state - stored as {x, y} representing bottom-right position
  const [position, setPosition] = useState(null);
  const [isSnapping, setIsSnapping] = useState(false);

  // ==================== REFS ====================
  const containerRef = useRef(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  });
  const rafRef = useRef(null);
  const inertiaRafRef = useRef(null);

  // ==================== CONSTANTS ====================
  const PADDING = 10; // Edge padding in pixels
  const BUTTON_SIZE = 56; // 14 * 4 = 56px (w-14 h-14)
  const BOTTOM_RESTRICTED_ZONE = 120; // Bottom 120px restricted for navbars/buttons
  const SNAP_THRESHOLD = 30; // Distance from edge to trigger magnetic snap
  const SNAP_DURATION = 200; // Duration of snap animation in ms
  const INERTIA_DAMPING = 0.95; // Friction coefficient for inertia
  const MIN_VELOCITY = 0.1; // Minimum velocity for inertia to apply

  // ==================== STORAGE ====================
  const STORAGE_KEY = 'ai-assistant-position';

  // ==================== INITIALIZATION ====================
  // Load position from localStorage or use default (bottom-right)
  useEffect(() => {
    const loadSavedPosition = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setPosition(parsed);
          return;
        }
      } catch (error) {
        console.warn('Failed to load saved position:', error);
      }
      
      // Default position: bottom-right with padding
      setPosition({
        x: window.innerWidth - BUTTON_SIZE - PADDING,
        y: window.innerHeight - BUTTON_SIZE - PADDING,
      });
    };

    loadSavedPosition();

    // Handle window resize to keep button within bounds
    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return prev;
        return constrainPosition(prev);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==================== CORE FUNCTIONS ====================

  /**
   * Constrain position to viewport bounds
   * Includes padding and bottom restricted zone
   */
  const constrainPosition = useCallback((pos) => {
    if (!pos) return null;

    const maxX = window.innerWidth - BUTTON_SIZE - PADDING;
    const maxY = window.innerHeight - BUTTON_SIZE - PADDING - BOTTOM_RESTRICTED_ZONE;

    return {
      x: Math.max(PADDING, Math.min(pos.x, maxX)),
      y: Math.max(PADDING, Math.min(pos.y, maxY)),
    };
  }, []);

  /**
   * Save position to localStorage
   */
  const savePosition = useCallback((pos) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch (error) {
      console.warn('Failed to save position:', error);
    }
  }, []);

  /**
   * Snap to nearest edge (left or right) with smooth animation
   */
  const snapToEdge = useCallback((pos) => {
    if (!pos) return null;

    const buttonCenterX = pos.x + BUTTON_SIZE / 2;
    const viewportCenterX = window.innerWidth / 2;

    // Determine which edge is closer
    const snappedX = buttonCenterX < viewportCenterX
      ? PADDING // Snap to left
      : window.innerWidth - BUTTON_SIZE - PADDING; // Snap to right

    return {
      x: snappedX,
      y: pos.y,
    };
  }, []);

  /**
   * Apply magnetic edge snapping (bonus feature)
   * Pulls button towards edge when within threshold
   */
  const getMagneticPosition = useCallback((pos) => {
    if (!pos) return null;

    const distToLeftEdge = pos.x - PADDING;
    const distToRightEdge = window.innerWidth - BUTTON_SIZE - PADDING - pos.x;

    // If close to left edge, attract left
    if (distToLeftEdge >= 0 && distToLeftEdge < SNAP_THRESHOLD) {
      return { ...pos, x: PADDING };
    }

    // If close to right edge, attract right
    if (distToRightEdge >= 0 && distToRightEdge < SNAP_THRESHOLD) {
      return { ...pos, x: window.innerWidth - BUTTON_SIZE - PADDING };
    }

    return pos;
  }, []);

  /**
   * Handle drag start - both mouse and touch
   */
  const handleDragStart = useCallback((e) => {
    // Distinguish between click and drag
    // Only start drag if we're not already dragging
    const isTouch = e.touches !== undefined;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    dragStateRef.current.isDragging = true;
    dragStateRef.current.startX = clientX;
    dragStateRef.current.startY = clientY;
    dragStateRef.current.offsetX = clientX - position.x;
    dragStateRef.current.offsetY = clientY - position.y;
    dragStateRef.current.lastX = clientX;
    dragStateRef.current.lastY = clientY;

    // Set cursor to grabbing
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }

    // Prevent text selection during drag
    if (isTouch) {
      e.preventDefault();
    }

    // Add event listeners for move and end
    if (isTouch) {
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    } else {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }
  }, [position]);

  /**
   * Handle drag move - throttled with requestAnimationFrame
   */
  const handleDragMove = useCallback((e) => {
    if (!dragStateRef.current.isDragging) return;

    const isTouch = e.touches !== undefined;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Calculate velocity for inertia effect
    dragStateRef.current.velocityX = clientX - dragStateRef.current.lastX;
    dragStateRef.current.velocityY = clientY - dragStateRef.current.lastY;
    dragStateRef.current.lastX = clientX;
    dragStateRef.current.lastY = clientY;

    // Use RAF for smooth movement
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const newX = clientX - dragStateRef.current.offsetX;
      const newY = clientY - dragStateRef.current.offsetY;

      const constrained = constrainPosition({ x: newX, y: newY });
      if (constrained) {
        dragStateRef.current.currentX = constrained.x;
        dragStateRef.current.currentY = constrained.y;
        setPosition(constrained);
      }
    });
  }, [constrainPosition]);

  /**
   * Handle drag end - snap to edge and optionally apply inertia
   */
  const handleDragEnd = useCallback((e) => {
    if (!dragStateRef.current.isDragging) return;

    dragStateRef.current.isDragging = false;

    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }

    // Remove event listeners
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);

    // Get current position
    let finalPos = { ...position };

    // Apply inertia effect (subtle momentum)
    const velX = dragStateRef.current.velocityX;
    const velY = dragStateRef.current.velocityY;

    if (Math.abs(velX) > MIN_VELOCITY || Math.abs(velY) > MIN_VELOCITY) {
      applyInertia(finalPos, velX, velY);
      return; // applyInertia will call snap at the end
    }

    // Snap to edge and apply magnetic snap
    const snappedPos = snapToEdge(finalPos);
    const magneticPos = getMagneticPosition(snappedPos);

    // Start snap animation
    animateSnap(magneticPos);
  }, [position, snapToEdge, getMagneticPosition, constrainPosition, handleDragMove]);

  /**
   * Apply inertia effect with friction (bonus feature)
   */
  const applyInertia = useCallback((startPos, velX, velY) => {
    let currentPos = { ...startPos };
    let currentVelX = velX;
    let currentVelY = velY;

    const updateInertia = () => {
      // Apply friction
      currentVelX *= INERTIA_DAMPING;
      currentVelY *= INERTIA_DAMPING;

      // Update position
      currentPos.x += currentVelX;
      currentPos.y += currentVelY;

      // Constrain to bounds
      currentPos = constrainPosition(currentPos);

      setPosition(currentPos);

      // Continue if velocity is significant
      if (Math.abs(currentVelX) > MIN_VELOCITY || Math.abs(currentVelY) > MIN_VELOCITY) {
        inertiaRafRef.current = requestAnimationFrame(updateInertia);
      } else {
        // Finish inertia and snap to edge
        const snappedPos = snapToEdge(currentPos);
        const magneticPos = getMagneticPosition(snappedPos);
        animateSnap(magneticPos);
      }
    };

    updateInertia();
  }, [constrainPosition, snapToEdge, getMagneticPosition]);

  /**
   * Animate smooth snapping to edge
   */
  const animateSnap = useCallback((targetPos) => {
    setIsSnapping(true);

    const startPos = { ...position };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SNAP_DURATION, 1);

      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentPos = {
        x: startPos.x + (targetPos.x - startPos.x) * easeProgress,
        y: startPos.y + (targetPos.y - startPos.y) * easeProgress,
      };

      setPosition(currentPos);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsSnapping(false);
        savePosition(targetPos);
      }
    };

    animate();
  }, [position, savePosition]);

  /**
   * Distinguish between click and drag
   * Only toggle if drag distance is minimal
   */
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;

    const handleMove = () => {
      hasMoved = true;
      document.removeEventListener('mousemove', handleMove);
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);

      // Only toggle if it wasn't a drag
      if (!hasMoved) {
        handleToggle();
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);

    // Start drag
    handleDragStart(e);
  }, [handleDragStart]);

  /**
   * Handle touch start - better for mobile
   */
  const handleTouchStart = useCallback((e) => {
    // Start drag immediately for touch
    handleDragStart(e);

    // Add a timeout to distinguish tap from long press
    const tapTimeoutId = setTimeout(() => {
      // If still touching after timeout, consider it a drag start
    }, 100);

    return tapTimeoutId;
  }, [handleDragStart]);

  // ==================== EVENT HANDLERS ====================

  const handleToggle = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, openChat, closeChat]);

  const handleClose = useCallback(() => {
    closeChat();
  }, [closeChat]);

  // ==================== RENDER ====================

  if (!position) {
    return null; // Wait for position to load
  }

  return (
    <>
      {/* Chat Window Overlay */}
      {isOpen && (
        <Overlay
          isOpen={isOpen}
          onClose={handleClose}
          containerClassName="items-end justify-end p-4 pb-20 md:pb-4"
          panelClassName="max-w-full md:max-w-[400px]"
          backdropClassName="bg-black/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
          ariaLabelledBy="chat-widget-title"
        >
          <div className="w-full md:w-[400px] h-[600px] max-h-[calc(100vh-100px)] md:max-h-[600px] animate-in slide-in-from-bottom-8 fade-in duration-300">
            <h2 id="chat-widget-title" className="sr-only">Financial Assistant chat</h2>
            <ChatWindow onClose={handleClose} onMinimize={handleToggle} />
          </div>
        </Overlay>
      )}

      {/* Draggable Button */}
      <button
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => {
          // Fallback click handler
          if (!dragStateRef.current.isDragging) {
            handleToggle();
          }
        }}
        className={`
          fixed z-50
          w-14 h-14
          bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600
          text-white rounded-full
          shadow-lg hover:shadow-xl dark:shadow-glow-blue
          focus:outline-none focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-500/50
          transition-all
          flex items-center justify-center group
          cursor-grab active:cursor-grabbing
          ${isSnapping ? 'transition-all duration-200' : 'transition-[transform,box-shadow]'}
          hover:scale-110
          dark:hover:shadow-lg
          before:absolute before:inset-0 before:bg-white/10 before:rounded-full before:opacity-0 before:hover:opacity-100 before:transition-opacity
        `}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          backfaceVisibility: 'hidden',
          willChange: dragStateRef.current.isDragging ? 'transform' : 'auto',
        }}
        aria-label={`Open ${assistantName || 'AI Assistant'}`}
        aria-pressed={isOpen}
      >
        {/* Icon Container */}
        <div className="relative w-6 h-6 flex items-center justify-center">
          {isOpen ? (
            // Close icon
            <svg
              className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <>
              {/* Chat icon */}
              <svg
                className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>

              {/* Notification Badge */}
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping absolute"></span>
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </span>
              )}
            </>
          )}
        </div>

        {/* Premium Glass Effect Overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </button>
    </>
  );
};

export default DraggableAssistant;
