import React, { useState, useEffect } from 'react';

// Global listener for history changes
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

if (typeof window !== 'undefined') {
  const originalPushState = window.history.pushState;
  window.history.pushState = function(...args) {
    const result = originalPushState.apply(this, args);
    notify();
    return result;
  };
  window.addEventListener('popstate', notify);
}

export function useRouter() {
  return {
    push: (href: string) => {
      window.history.pushState({}, '', href);
    },
    back: () => window.history.back(),
    replace: (href: string) => window.history.replaceState({}, '', href)
  };
}

export function useSearchParams() {
  const [params, setParams] = useState(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''));

  useEffect(() => {
    const handle = () => setParams(new URLSearchParams(window.location.search));
    listeners.add(handle);
    return () => { listeners.delete(handle); };
  }, []);

  return params;
}

export const Link = ({ href, children, className, ...props }: any) => {
  const router = useRouter();
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        router.push(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
};
