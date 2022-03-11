import React from "react";
import { BlueButton } from "../layout/Button";
import styles from "./landing.module.css";
import useThemeContext from "@theme/hooks/useThemeContext";

export const LandingHeader: React.FC = () => {
  const { isDarkTheme } = useThemeContext();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Dynamic embedded
        <br />
        videos in React.
      </h1>
      <div
        style={{
          width: "100%",
          aspectRatio: String(16 / 9),
        }}
      >
        <video
          src={isDarkTheme ? "/img/player-dark.mp4" : "/img/player-light.mp4"}
          playsInline
          muted
          autoPlay
          loop
          style={{
            display: "inline",
          }}
        />
      </div>

      <br />
      <br />
      <p className={styles.p}>
        With the Remotion Player, you can embed videos that are written in
        React, and change them at runtime. Connect it to server-side rendering
        to turn them into real MP4 videos.
      </p>
      <a className={styles.a} href="/docs/player">
        <BlueButton size="sm" loading={false} fullWidth={false}>
          Documentation
        </BlueButton>
      </a>
      <br />
      <br />
    </div>
  );
};
