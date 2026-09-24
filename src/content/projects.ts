import type { Locale } from "@/i18n/types";

type Localized = Record<Locale, string>;

export type CoverVariant =
  "lakehouse" | "graph" | "cloud" | "stream" | "vision" | "forecast" | "agents";

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
  /** Up to three key figures, shown on large cards. */
  metrics?: { value: string; label: Localized }[];
  stack: string[];
  year: number;
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

/** See docs/CONTENT.md to add or replace projects. */
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
    slug: "stratus",
    title: "Stratus",
    tagline: { en: "Multi-account cloud landing zone", es: "Landing zone cloud multicuenta" },
    summary: {
      en: "Infrastructure as code for 30+ AWS accounts: guardrails, networking and cost controls shipped through a single pipeline.",
      es: "Infraestructura como código para más de 30 cuentas de AWS: guardrails, redes y control de costos desde un solo pipeline.",
    },
    role: { en: "Cloud architect", es: "Arquitecto cloud" },
    impact: { en: "−32% monthly cloud spend", es: "−32% gasto cloud mensual" },
    stack: ["Terraform", "AWS Organizations", "GitHub Actions", "OPA"],
    year: 2025,
    size: "md",
    mock: true,
    cover: "cloud",
    links: { repo: "https://github.com/criskian" },
  },
  {
    slug: "synapse",
    title: "Synapse",
    tagline: { en: "Enterprise RAG assistant", es: "Asistente RAG empresarial" },
    summary: {
      en: "A retrieval-augmented assistant that turns 40,000 scattered internal documents into grounded, cited answers in seconds.",
      es: "Un asistente con recuperación aumentada que convierte 40.000 documentos internos dispersos en respuestas citadas y confiables en segundos.",
    },
    role: { en: "Lead engineer", es: "Ingeniero líder" },
    impact: { en: "−62% time-to-answer", es: "−62% tiempo de respuesta" },
    stack: ["Python", "FastAPI", "LangGraph", "pgvector", "AWS Bedrock"],
    year: 2026,
    size: "md",
    mock: true,
    cover: "graph",
    links: { repo: "https://github.com/criskian" },
  },
  {
    slug: "sentinel",
    title: "Sentinel Vision",
    tagline: { en: "Edge defect detection", es: "Detección de defectos en el edge" },
    summary: {
      en: "Computer-vision models optimised for edge devices that flag manufacturing defects before they leave the line.",
      es: "Modelos de visión por computador optimizados para el edge que detectan defectos de fabricación antes de salir de la línea.",
    },
    role: { en: "ML engineer", es: "Ingeniero de ML" },
    impact: { en: "97.4% precision in production", es: "97,4% de precisión en producción" },
    stack: ["PyTorch", "ONNX Runtime", "Jetson", "MLflow"],
    year: 2024,
    size: "md",
    mock: true,
    cover: "vision",
    links: { repo: "https://github.com/criskian" },
  },
  {
    slug: "horizon",
    title: "Horizon",
    tagline: { en: "Demand forecasting platform", es: "Plataforma de pronóstico de demanda" },
    summary: {
      en: "Feature store, training and batch inference for thousands of SKU-level forecasts, retrained automatically every week.",
      es: "Feature store, entrenamiento e inferencia batch para miles de pronósticos por SKU, reentrenados automáticamente cada semana.",
    },
    role: { en: "ML & data engineer", es: "Ingeniero de ML y datos" },
    impact: { en: "+18% forecast accuracy", es: "+18% precisión del pronóstico" },
    stack: ["Vertex AI", "BigQuery", "dbt", "Python"],
    year: 2024,
    size: "md",
    mock: true,
    cover: "forecast",
    links: { repo: "https://github.com/criskian" },
  },
  {
    slug: "relay",
    title: "Relay",
    tagline: { en: "Agentic incident triage", es: "Triaje de incidentes con agentes" },
    summary: {
      en: "LLM agents with tool access that read alerts, correlate logs and runbooks, and resolve the routine incidents on their own.",
      es: "Agentes LLM con acceso a herramientas que leen alertas, correlacionan logs y runbooks, y resuelven solos los incidentes rutinarios.",
    },
    role: { en: "AI engineer", es: "Ingeniero de IA" },
    impact: { en: "58% of tickets auto-resolved", es: "58% de tickets resueltos solos" },
    stack: ["TypeScript", "LLM agents", "MCP", "Kubernetes", "Grafana"],
    year: 2026,
    size: "wide",
    mock: true,
    cover: "agents",
    links: { repo: "https://github.com/criskian" },
  },
];

export const HAS_MOCK_PROJECTS = PROJECTS.some((p) => p.mock);
