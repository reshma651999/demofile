module.exports = {
  title: "Remotion",
  tagline: "Create motion graphics in React",
  url: "https://remotion.dev",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/logo-small.png",
  organizationName: "JonnyBurger", // Usually your GitHub org/user name.
  projectName: "remotion", // Usually your repo name.
  themeConfig: {
    algolia: {
      apiKey: "f63f08c037745da5269569bfbd91cd59",
      indexName: "remotion",
      contextualSearch: false,
    },
    image: "img/social-preview.png",
    navbar: {
      title: "Remotion",
      logo: {
        alt: "Remotion logo",
        src: "img/logo-small.png",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        { to: "blog", label: "Blog", position: "left" },
        { to: "showcase", label: "Showcase", position: "left" },
        { to: "/docs/license", label: "Licensing", position: "left" },
        {
          href: "https://discord.gg/6VzzNDwUwV",
          label: "Discord",
          position: "right",
          "data-splitbee-event": "External Link",
          "data-splitbee-event-target": "Discord",
        },
        {
          href: "https://github.com/remotion-dev/remotion",
          label: "GitHub",
          position: "right",
          "data-splitbee-event": "External Link",
          "data-splitbee-event-target": "Github",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Remotion",
          items: [
            {
              label: "Getting started",
              to: "/docs/",
            },
            {
              label: "API Reference",
              to: "/docs/cli",
            },
            {
              label: "Player",
              to: "/player",
            },
            {
              label: "Changelog",
              href: "https://github.com/remotion-dev/remotion/releases",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Showcase",
              to: "showcase",
            },
            {
              label: "GitHub Issues",
              href: "https://github.com/remotion-dev/remotion/issues",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Github",
            },
            {
              label: "Discord",
              href: "https://discord.gg/6VzzNDwUwV",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Discord",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/remotion_dev",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Twitter",
            },
            {
              label: "Instagram",
              href: "https://instagram.com/remotion.dev",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Instagram",
            },
            {
              label: "TikTok",
              href: "https://www.tiktok.com/@remotion.dev",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "TikTok",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "Success Stories",
              to: "success-stories",
            },
            {
              label: "GitHub",
              href: "https://github.com/remotion-dev/remotion",
            },
            {
              label: "For companies",
              href: "https://companies.remotion.dev",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} remotion.dev. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/remotion-dev/remotion/edit/main/packages/docs/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/remotion-dev/remotion/edit/main/packages/docs/blog/",
        },
        theme: {
          customCss: [require.resolve("./src/css/custom.css")],
        },
      },
    ],
    [
      "@jonny/docusaurus-preset-shiki-twoslash",
      {
        themes: ["github-light", "github-dark"],
        defaultCompilerOptions: {
          types: ["node"],
        },
      },
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-content-blog",
      {
        /**
         * Required for any multi-instance plugin
         */
        id: "success-stories",
        /**
         * URL route for the blog section of your site.
         * *DO NOT* include a trailing slash.
         */
        routeBasePath: "success-stories",
        /**
         * Path to data on filesystem relative to site dir.
         */
        path: "./success-stories",
        blogSidebarTitle: "Success stories",
      },
    ],
  ],
};
