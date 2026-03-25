"use client";

import { useEffect } from "react";

export function IframeResizer() {
  useEffect(() => {
    if (window.self === window.top) return; // Not in an iframe

    function postHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "kyr-resize", height }, "*");
    }

    // Post height on load, resize, and DOM changes
    postHeight();
    window.addEventListener("resize", postHeight);

    const observer = new MutationObserver(postHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("resize", postHeight);
      observer.disconnect();
    };
  }, []);

  return null;
}
