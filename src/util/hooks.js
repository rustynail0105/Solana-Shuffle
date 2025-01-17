import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export function useIsInViewport(ref) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIsIntersecting(entry.isIntersecting)
      ),
    []
  );

  useEffect(() => {
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isIntersecting;
}

export function useLocalStorage(key) {
  const [value, setValue] = useState(localStorage.getItem(key));

  const eventName = `localStorage-${key}`;

  const setLocalStorage = (value) => {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event(eventName));
  };

  window.addEventListener(eventName, () => {
    setValue(localStorage.getItem(key));
  });

  return [value, setLocalStorage];
}

export const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const resetCopy = useRef();

  const onCopy = useCallback(() => {
    navigator.clipboard
      .writeText(ref.current.innerText)
      .then(() => setCopied(true));
  }, [ref]);

  useEffect(() => {
    if (copied) {
      resetCopy.current = setTimeout(() => setCopied(false), 3000);
    }

    return () => {
      clearTimeout(resetCopy.current);
    };
  }, [copied]);

  return { copied, ref, onCopy };
};
