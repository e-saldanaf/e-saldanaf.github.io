import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Eduardo Saldaña",
  DESCRIPTION: "Data Engineer | Python · SQL · Airflow · Redshift",
  EMAIL: "esaldanaf@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Data Engineer specialized in pipeline optimization, data modeling and BI integration.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "Technical articles on data engineering, Python and automation.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my data engineering projects with links to source code and live demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/e-saldanaf",
  },
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/esaldanaf/",
  },
];