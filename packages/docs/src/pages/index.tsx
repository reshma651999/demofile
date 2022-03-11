import splitbee from "@splitbee/web";
import Layout from "@theme/Layout";
import React from "react";
import { LightningFastEditor } from "../../components/LandingPage/editor";
import { FreePricing } from "../../components/LandingPage/FreePricing";
import { IfYouKnowReact } from "../../components/LandingPage/if-you-know-react";
import { Parametrize } from "../../components/LandingPage/parametrize";
import { RealMP4Videos } from "../../components/LandingPage/real-mp4-videos";
import { SuccessFeatures } from "../../components/LandingPage/SuccessFeatures";
import { WriteInReact } from "../../components/LandingPage/WriteInReact";
import styles from "./landing.module.css";

setTimeout(() => {
  splitbee.init();
}, 100);

const NewLanding: React.FC = () => {
  return (
    <Layout
      title="Write videos in React"
      description="Create MP4 motion graphics in React. Leverage CSS, SVG, WebGL and more technologies to render videos programmatically!"
    >
      <div className={styles.content}>
        <WriteInReact />
        <br />
        <br />
        <br />
        <br />
        <br />
        <IfYouKnowReact />
        <br />
        <br />
        <br />
        <br />
        <br />
        <RealMP4Videos />
        <br />
        <br />
        <br />
        <br />
        <LightningFastEditor />
        <br />
        <br />
        <br />
        <br />
        <Parametrize />
        <br />
        <br />
        <br />
        <br />
        <FreePricing />
        <SuccessFeatures />
        <br />
        <br />
      </div>
    </Layout>
  );
};

export default NewLanding;
