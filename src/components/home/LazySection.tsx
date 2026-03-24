import { useRef, useState, useEffect, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: string;
}

export default function LazySection({ children, rootMargin = "100px", minHeight = "200px" }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={visible ? { contentVisibility: "auto" as any, containIntrinsicSize: `auto ${minHeight}` } : { minHeight, contentVisibility: "auto" as any, containIntrinsicSize: `auto ${minHeight}` }}>
      {visible ? children : null}
    </div>
  );
}
