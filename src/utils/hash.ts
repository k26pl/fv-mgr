"use client";
import { useState, useEffect } from "react";

// Util for keeping some state in hash
// Using this two times at once will likely conflict
// When using in page.tsx it has advantage of reacting to
// forward/backward buttons, however
// it should not be used inside components to prevent conflicts

export const useHash = () => {
  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : "",
  );
  useEffect(() => {
    const onHashChange = () => {
      setHash(location.hash.replace("#", ""));
    };
    setHash(location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash;
};

export const setHash = (hash: string) => {
  window.location.hash = "#" + hash;
};
