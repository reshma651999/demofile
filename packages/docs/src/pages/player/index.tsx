import React from "react";
import Layout from "@theme/Layout";
import { LandingHeader } from "../../../components/Player/LandingHeader";
import { PlayerFeatures } from "../../../components/Player/features";
import { PoweredByRemotion } from "../../../components/Player/PoweredByRemotion";
import { PlayerPageFooter } from "../../../components/Player/Footer";
import { WrappedBanner } from "../../../components/Player/Wrapped";
import Head from "@docusaurus/Head";

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  paddingLeft: 16,
  paddingRight: 16,
};

export default () => {
  return (
    <Layout
      title="@remotion/player"
      description="Embed videos that are written in React, and change them at runtime. Connect it to server-side rendering to turn them into real MP4 videos."
    >
      <Head>
        <meta name="og:image" content="/img/player-og.png" />
        <meta name="twitter:image" content="/img/player-og.png" />
        <meta property="og:image" content="/img/player-og.png" />
        <meta property="twitter:image" content="/img/player-og.png" />
      </Head>
      <div style={container}>
        <LandingHeader />
      </div>
      <PoweredByRemotion />
      <div style={container}>
        <PlayerFeatures />
      </div>
      <WrappedBanner />
      <PlayerPageFooter />
    </Layout>
  );
};
