import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { useCallback } from "react";
import { Player, PlayerRef } from "@remotion/player";
import React from "react";
import { ColorDemo } from "./ColorDemo";
import "./input-fields.css";

export const PlayerExample: React.FC<{
  name: string;
  color: string;
  autoPlayOnFocus?: boolean;
}> = ({ name, color }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<PlayerRef>(null);

  const [isIntersecting, setIsIntersecting] = useState(false);
  const callback: IntersectionObserverCallback = useCallback(
    (newData) => {
      setIsIntersecting(newData[0].isIntersecting);
      if (isIntersecting) {
        playerRef.current?.play();
      } else {
        playerRef.current?.pause();
      }
    },
    [isIntersecting]
  );
  useEffect(() => {
    const { current } = containerRef;
    if (!current) {
      return;
    }

    const observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 1,
    });
    observer.observe(current);

    return () => observer.unobserve(current);
  }, [callback]);

  return (
    <div ref={containerRef}>
      <Player
        ref={playerRef}
        component={ColorDemo}
        compositionWidth={1280}
        compositionHeight={720}
        controls
        spaceKeyToPlayOrPause={false}
        durationInFrames={350}
        fps={30}
        inputProps={{
          name,
          color,
        }}
        style={{
          width: "100%",
        }}
        loop
      />
    </div>
  );
};
