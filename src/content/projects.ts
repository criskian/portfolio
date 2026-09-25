import type { Locale } from "@/i18n/types";

type Localized = Record<Locale, string>;

export type CoverVariant =
  "lakehouse" | "document" | "graph" | "cloud" | "stream" | "vision" | "forecast" | "agents";

export interface ProjectImage {
  /** Largest file; `srcSet` lists every generated width. */
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: Localized;
}

export interface Project {
  slug: string;
  title: string;
  tagline: Localized;
  summary: Localized;
  role: Localized;
  /** One headline result — the "loss" this project reduced. */
  impact: Localized;
  /** Two or three key figures, shown on large cards. */
  metrics?: { value: string; label: Localized }[];
  stack: string[];
  /** Start year; omitted when not relevant. */
  year?: number;
  /** Still running / maintained — shown as "2025 → now". */
  ongoing?: boolean;
  /** Bento size: `lg` spans two columns, `wide` spans the full row on desktop. */
  size: "lg" | "md" | "wide";
  featured?: boolean;
  /** Placeholder project, flagged on its card until replaced by a real one. */
  mock?: boolean;
  /** Procedural cover (also the card's category label). Hidden when `image` is set. */
  cover: CoverVariant;
  image?: ProjectImage;
  links: { demo?: string; case?: string; repo?: string };
}

const projectImage = (name: string, alt: Localized): ProjectImage => ({
  src: `/images/projects/${name}-1280.webp`,
  srcSet: [640, 960, 1280].map((w) => `/images/projects/${name}-${w}.webp ${w}w`).join(", "),
  width: 1280,
  height: 720,
  alt,
});

/**
 * Display order = grid order. On desktop (3 columns) sizes are paired so every
 * row fills up: lg + md · wide · lg + md. See docs/CONTENT.md.
 */
export const PROJECTS: Project[] = [
  {
    slug: "retail-transactions-lakehouse",
    title: "Retail Transactions Lakehouse",
    tagline: {
      en: "Medallion lakehouse on 1.1M real supermarket baskets",
      es: "Lakehouse medallion sobre 1,1 M de canastas reales",
    },
    summary: {
      en: "Six months of baskets from four stores — no prices, quantities or transaction IDs — turned into a reproducible PySpark lakehouse, customer segments and product recommendations. Heavy compute runs in CI; the dashboard only reads a 24 MB DuckDB file, so it deploys for free.",
      es: "Seis meses de canastas de cuatro tiendas —sin precios, cantidades ni IDs de transacción— convertidos en un lakehouse reproducible con PySpark, segmentos de clientes y recomendaciones de productos. El cómputo pesado corre en CI; el dashboard solo lee un DuckDB de 24 MB, así que se despliega gratis.",
    },
    role: { en: "Data & ML engineer", es: "Ingeniero de datos y ML" },
    impact: {
      en: "Free deploy: compute split from serving",
      es: "Despliegue gratis: cómputo separado del serving",
    },
    metrics: [
      {
        value: "10.6M",
        label: { en: "rows from 1.1M baskets", es: "filas desde 1,1 M de canastas" },
      },
      {
        value: "131K",
        label: { en: "customers with a top-10", es: "clientes con top-10" },
      },
      { value: "26", label: { en: "data contracts", es: "contratos de datos" } },
    ],
    stack: ["PySpark", "Spark MLlib", "DuckDB", "Streamlit", "pandera", "GitHub Actions"],
    year: 2026,
    size: "lg",
    featured: true,
    cover: "lakehouse",
    image: projectImage("retail-lakehouse", {
      en: "Retail Lakehouse dashboard: executive summary with sales KPIs, daily transactions and top products",
      es: "Dashboard Retail Lakehouse: resumen ejecutivo con KPIs de ventas, transacciones diarias y productos más vendidos",
    }),
    links: {
      demo: "https://retail-transactions-lakehouse.streamlit.app/",
      repo: "https://github.com/criskian/retail-transactions-lakehouse",
    },
  },
  {
    slug: "almia-aws",
    title: "Almia on AWS",
    tagline: {
      en: "Well-Architected target architecture, in production",
      es: "Arquitectura objetivo Well-Architected, en producción",
    },
    summary: {
      en: "Moved the main API from Render to ECS Fargate behind a WAF-protected load balancer, with a least-privilege role per service, Secrets Manager, OIDC deploys, autoscaling and alarms. I keep the ecosystem running: deploys, rollbacks, incidents and vulnerabilities.",
      es: "Migré la API principal de Render a ECS Fargate detrás de un balanceador con WAF, con un rol de mínimo privilegio por servicio, Secrets Manager, despliegues OIDC, autoscaling y alarmas. Mantengo el ecosistema en producción: despliegues, rollbacks, incidentes y vulnerabilidades.",
    },
    role: { en: "Cloud architecture & operations", es: "Arquitectura cloud y operaciones" },
    impact: {
      en: "Render → ECS Fargate, no stored keys",
      es: "Render → ECS Fargate, sin llaves guardadas",
    },
    stack: ["ECS Fargate", "AWS WAF", "Route 53", "Secrets Manager", "CloudWatch", "Bedrock"],
    ongoing: true,
    size: "md",
    cover: "cloud",
    links: {},
  },
  {
    slug: "cio",
    title: "CIO",
    tagline: {
      en: "AI job hunter on WhatsApp · built end to end",
      es: "Cazador de empleo con IA en WhatsApp · de principio a fin",
    },
    summary: {
      en: "Job seekers tell CIO what they want in their own words; it finds live vacancies, sends the best match and then daily alerts at the hour they choose. A state machine with fast validators calls the LLM only when it adds value, so the chat feels natural and costs little. Users see a real vacancy before signing up, and paid plans activate inside the chat.",
      es: "La persona le dice a CIO con sus palabras qué empleo busca; CIO encuentra vacantes reales, envía la mejor y luego alertas diarias a la hora que elija. Una máquina de estados con validadores rápidos llama al LLM solo cuando aporta, así el chat se siente natural y cuesta poco. Se ve una vacante real antes de registrarse, y los planes pagos se activan dentro del chat.",
    },
    role: {
      en: "Designed, built & maintained end to end",
      es: "Diseño, desarrollo y mantenimiento de principio a fin",
    },
    impact: {
      en: "Value first: a real vacancy before sign-up",
      es: "Valor primero: una vacante real antes del registro",
    },
    metrics: [
      { value: "2,400+", label: { en: "registered users", es: "usuarios registrados" } },
      {
        value: "#1",
        label: { en: "acquisition channel at Almia", es: "canal de adquisición de Almia" },
      },
      {
        value: "0",
        label: { en: "stored cloud keys (OIDC)", es: "llaves cloud guardadas (OIDC)" },
      },
    ],
    stack: [
      "NestJS",
      "TypeScript",
      "PostgreSQL",
      "OpenAI",
      "WhatsApp Cloud API",
      "SerpApi",
      "Wompi",
      "AWS",
    ],
    year: 2025,
    ongoing: true,
    size: "wide",
    featured: true,
    cover: "agents",
    image: projectImage("cio", {
      en: "CIO landing page: “The largest job-offer hunter in LATAM”, with WhatsApp on a phone",
      es: "Página de CIO: “El cazador de ofertas de empleo más grande de LATAM”, con WhatsApp en un celular",
    }),
    links: { demo: "https://cio.almia.com.co/" },
  },
  {
    slug: "almia-platform",
    title: "Almia Platform",
    tagline: {
      en: "Inclusive hiring platform · Companies & People suites",
      es: "Plataforma de empleo inclusivo · suites Empresas y Personas",
    },
    summary: {
      en: "Core backend and both suites of a platform that connects people with disabilities with employers. Companies get an AI recruiting agent that streams candidates live and searches Almia's own talent bank through a RAG pool, plus a CRM pipeline, interview scheduling and a legal hiring-quota dashboard. People get an AI interview coach, a LinkedIn optimizer and a CV editor.",
      es: "Backend central y las dos suites de una plataforma que conecta a personas con discapacidad con empresas. Las empresas tienen un agente de reclutamiento con IA que entrega candidatos en vivo y busca en el banco de talento propio con un pool RAG, además de CRM, agenda de entrevistas y un tablero de cuota legal. Las personas tienen coach de entrevistas con IA, optimizador de LinkedIn y editor de CV.",
    },
    role: {
      en: "Primary contributor · most of 350+ commits",
      es: "Contribuidor principal · la mayoría de 350+ commits",
    },
    impact: {
      en: "RAG talent pool live for every company",
      es: "Talent pool RAG activo para todas las empresas",
    },
    metrics: [
      {
        value: "1,344",
        label: { en: "profiles in the RAG talent pool", es: "perfiles en el pool RAG" },
      },
      {
        value: "149",
        label: { en: "anonymized inclusive resumes", es: "hojas de vida inclusivas anónimas" },
      },
      {
        value: "350+",
        label: { en: "commits, most of them mine", es: "commits, la mayoría míos" },
      },
    ],
    stack: ["Amazon Bedrock", "pgvector", "SQS", "Fargate Spot", "Wompi", "Playwright"],
    ongoing: true,
    size: "lg",
    cover: "graph",
    image: projectImage("almia-platform", {
      en: "Almia home page: “Talent without barriers, employment for everyone”",
      es: "Página de inicio de Almia: “Talento sin barreras, empleo para todos”",
    }),
    links: { demo: "https://www.almia.com.co/" },
  },
  {
    slug: "cv-creator",
    title: "CV Creator",
    tagline: {
      en: "From form builder to AI document editor",
      es: "De formulario a editor de documentos con IA",
    },
    summary: {
      en: "The whole CV became one document you click to edit, with autosave and AI suggestions you accept or reject one by one. A rules engine plus Claude on Bedrock, with a vision fallback for scanned PDFs and guardrails so the AI never invents dates.",
      es: "La hoja de vida pasó a ser un solo documento que se edita con un clic, con guardado automático y sugerencias de IA que se aceptan o rechazan una a una. Motor de reglas más Claude en Bedrock, con lectura por visión de PDFs escaneados y guardrails para que la IA nunca invente fechas.",
    },
    role: {
      en: "Co-developer · led the restructure",
      es: "Co-desarrollador · lideré la reestructuración",
    },
    impact: {
      en: "PDF & Word export that matches the editor",
      es: "Exporta a PDF y Word igual al editor",
    },
    stack: ["Amazon Bedrock", "Claude Haiku 4.5", "Rules engine", "PDF/DOCX"],
    size: "md",
    cover: "document",
    image: projectImage("cv-creator", {
      en: "CV Creator editor: the CV document next to a panel of AI suggestions to review",
      es: "Editor del Creador de hojas de vida: el documento junto a un panel de sugerencias de IA por revisar",
    }),
    links: { demo: "https://staging.creatorhv.almia.com.co/" },
  },
];

export const HAS_MOCK_PROJECTS = PROJECTS.some((p) => p.mock);
