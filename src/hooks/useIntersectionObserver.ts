import { useEffect, useRef, useState, RefObject } from "react";

/**
 * Custom hook to track intersection states using standard browser IntersectionObserver.
 * @param options - IntersectionObserver configurations (rootMargin, threshold).
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    const el = ref.current;
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
}
export default useIntersectionObserver;
