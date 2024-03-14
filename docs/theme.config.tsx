import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import Logo from "./components/Logo";

const config: DocsThemeConfig = {
  logo: <Logo />,
  project: {
    link: "https://github.com/emilohlund-git/datamint",
  },
  docsRepositoryBase: "https://github.com/emilohlund-git/datamint/tree/main/docs",
  footer: {
    text: <Logo />,
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s - Datamint",
    };
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Datamint" />
      <meta property="og:description" content="Simple, Available, Dockerized Database Containers" />
      <link rel="shortcut icon" href="/favicon.ico" />
    </>
  ),
  nextThemes: {
    defaultTheme: "dark"
  },
};

export default config;
