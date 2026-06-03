// src/i18n/translations.ts

export const languages = {
  en: "English",
  es: "Español",
}

export const defaultLang = "en"

export const ui = {
  en: {
    // Nav
    "nav.blog": "blog",
    "nav.projects": "projects",
    "nav.cv": "cv",
    "nav.search": "Search",

    // Home
    "home.title": "Home",
    "home.description": "Data Engineer specialized in pipeline optimization, data modeling and BI integration.",
    "home.tagline": "Data Engineer · Power Platform App Maker",
    "home.bio.1": "Data engineer and IT developer focused on automation, system integration and process optimization. I build practical, scalable solutions that bridge technology and business efficiently.",
    "home.bio.2": "My core stack includes Python, SQL, Apache Airflow, Amazon Redshift and Microsoft Power Platform. I develop data pipelines, ETL processes, automations and applications oriented towards improving productivity and decision-making.",
    "home.bio.3": "I have worked on projects involving data transformation, business workflow automation and internal tooling — connecting data backends to final consumers via Power BI and Power Apps. Currently deepening my expertise in cloud data engineering and scalable architectures.",
    "home.stack": "Stack & Tools",
    "home.projects.title": "Recent projects",
    "home.projects.seeall": "See all projects",
    "home.projects.empty": "Projects coming soon.",
    "home.blog.title": "Latest posts",
    "home.blog.seeall": "See all posts",
    "home.blog.empty": "Articles coming soon.",
    "home.connect.title": "Let's Connect",
    "home.connect.text": "Open to new opportunities, collaborations and technical conversations. Feel free to reach out.",

    // CV
    "cv.title": "CV",
    "cv.description": "Work experience, education and certifications of Eduardo Saldaña — Data Engineer & Power Platform Developer.",
    "cv.experience": "Work Experience",
    "cv.education": "Education",
    "cv.certifications": "Certifications",
    "cv.languages": "Languages",
    "cv.lang.spanish": "Spanish",
    "cv.lang.spanish.level": "Native",
    "cv.lang.english": "English",
    "cv.lang.english.level": "Full professional proficiency",

    // Projects
    "projects.title": "Projects",
    "projects.description": "A collection of my data engineering projects with links to source code and live demos.",

    // Blog
    "blog.title": "Blog",
    "blog.description": "Technical articles on data engineering, Python and automation.",

    // Legal
    "legal.title": "Legal Notice",
    "legal.description": "Legal information for e-saldanaf.github.io",

    // Footer
    "footer.legal": "Legal",
  },

  es: {
    // Nav
    "nav.blog": "blog",
    "nav.projects": "proyectos",
    "nav.cv": "cv",
    "nav.search": "Buscar",

    // Home
    "home.title": "Inicio",
    "home.description": "Ingeniero de datos especializado en optimización de pipelines, modelado de datos e integración con BI.",
    "home.tagline": "Ingeniero de Datos · Power Platform App Maker",
    "home.bio.1": "Ingeniero de datos y desarrollador IT enfocado en automatización, integración de sistemas y optimización de procesos. Construyo soluciones prácticas y escalables que conectan tecnología y negocio de forma eficiente.",
    "home.bio.2": "Mi stack principal incluye Python, SQL, Apache Airflow, Amazon Redshift y Microsoft Power Platform. Desarrollo pipelines de datos, procesos ETL, automatizaciones y aplicaciones orientadas a mejorar la productividad y la toma de decisiones.",
    "home.bio.3": "He trabajado en proyectos relacionados con transformación de datos, automatización de flujos empresariales y desarrollo de herramientas internas — conectando el backend de datos con el consumo final mediante Power BI y Power Apps. Actualmente profundizando en ingeniería de datos cloud y arquitecturas escalables.",
    "home.stack": "Stack & Herramientas",
    "home.projects.title": "Proyectos recientes",
    "home.projects.seeall": "Ver todos los proyectos",
    "home.projects.empty": "Proyectos próximamente.",
    "home.blog.title": "Últimas publicaciones",
    "home.blog.seeall": "Ver todas las publicaciones",
    "home.blog.empty": "Artículos próximamente.",
    "home.connect.title": "Contacto",
    "home.connect.text": "Abierto a nuevas oportunidades, colaboraciones y conversaciones técnicas. No dudes en escribirme.",

    // CV
    "cv.title": "CV",
    "cv.description": "Experiencia laboral, formación y certificaciones de Eduardo Saldaña — Ingeniero de Datos y desarrollador Power Platform.",
    "cv.experience": "Experiencia Laboral",
    "cv.education": "Formación",
    "cv.certifications": "Certificaciones",
    "cv.languages": "Idiomas",
    "cv.lang.spanish": "Español",
    "cv.lang.spanish.level": "Nativo",
    "cv.lang.english": "Inglés",
    "cv.lang.english.level": "Competencia profesional completa",

    // Projects
    "projects.title": "Proyectos",
    "projects.description": "Una selección de mis proyectos de ingeniería de datos con enlaces al código fuente y demos en vivo.",

    // Blog
    "blog.title": "Blog",
    "blog.description": "Artículos técnicos sobre ingeniería de datos, Python y automatización.",

    // Legal
    "legal.title": "Aviso Legal",
    "legal.description": "Información legal de e-saldanaf.github.io",

    // Footer
    "footer.legal": "Legal",
  },
} as const

export type Lang = keyof typeof ui

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/")
  if (lang in ui) return lang as Lang
  return defaultLang
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key]
  }
}

export function getLocalePath(lang: Lang, path: string): string {
  if (lang === defaultLang) return path
  return `/es${path}`
}