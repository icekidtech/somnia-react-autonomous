import { defineConfig } from "vitepress";

export default defineConfig({
  title: "@somnia-react/autonomous",
  description: "Battle-tested library for Somnia reactive handlers",
  lang: "en-US",

  head: [
    ["meta", { name: "theme-color", content: "#3c3c3d" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "en" }],
  ],

  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    lineNumbers: true,
  },

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/getting-started" },
      { text: "API", link: "/api-reference" },
      { text: "GitHub", link: "https://github.com/somnia-react/autonomous" },
    ],

    sidebar: {
      "/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/getting-started" },
            { text: "Installation", link: "/installation" },
            { text: "Your First Handler", link: "/first-handler" },
          ],
        },
        {
          text: "Guides",
          items: [
            { text: "Auto Compound", link: "/guides/auto-compound" },
            { text: "Liquidation Guardian", link: "/guides/liquidation-guardian" },
            { text: "Cron Scheduler", link: "/guides/cron-scheduler" },
            { text: "Event Throttle", link: "/guides/event-throttle" },
            { text: "Cross Call Orchestrator", link: "/guides/cross-call-orchestrator" },
          ],
        },
        {
          text: "Learn",
          items: [
            { text: "Security Best Practices", link: "/security" },
            { text: "Gas Optimization", link: "/gas-optimization" },
            { text: "Testing Handlers", link: "/testing" },
          ],
        },
        {
          text: "Reference",
          items: [
            { text: "API Reference", link: "/api-reference" },
            { text: "Examples", link: "/examples" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/somnia-react/autonomous" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 Somnia React",
    },
  },
});
