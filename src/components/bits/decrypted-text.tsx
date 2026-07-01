"use client";

import { useEffect, useState, useRef } from "react";

const chars = "!<>-_\\/[]{}—=+*^?#________";

export function DecryptedText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    frameRef.current = 0;
    const totalFrames = 8;

    intervalRef.current = setInterval(() => {
      if (!mounted) return;
      frameRef.current++;

      const newText = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (frameRef.current > totalFrames + i * 0.5) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      setDisplayText(newText);

      if (frameRef.current >= totalFrames + text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
      }
    }, 40);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return <span className={className}>{displayText}</span>;
}
