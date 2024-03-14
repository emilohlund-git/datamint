import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import Logo from "./components/Logo";

const config: DocsThemeConfig = {
  logo: <Logo />,
  project: {
    link: "https://github.com/emilohlund-git/datamint",
  },
  docsRepositoryBase: "https://github.com/emilohlund-git/datamint",
  footer: {
    text: <Logo />,
  },
};

export default config;
