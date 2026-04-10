import { useEffect } from "react";

const useClickOutside = (containerRef, onOutsideClick, isEnabled = true) => {
  useEffect(() => {
    if (!isEnabled || !containerRef?.current || typeof onOutsideClick !== "function") {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
        onOutsideClick(event);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [containerRef, onOutsideClick, isEnabled]);
};

export default useClickOutside;
