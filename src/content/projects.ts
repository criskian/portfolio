import type { Locale } from "@/i18n/types";

type Localized = Record<Locale, string>;

export type CoverVariant = "graph" | "cloud" | "stream" | "vision" | "forecast" | "agents";

export interface Project {
  slug: string;
  title: string;
  tagline: Localized;
  summary: Localized;
  role: Localized;
  /** One headline metric — the "loss" this project reduced. */
  impact: Localized;
  stack: string[];
  year: number;
  /** Bento size: `lg` spans two columns, `wide` spans the full row on desktop. */
  size: "lg" | "md" | "wide";
  featured?: boolean;
  cover: CoverVariant;
  /** Optional screenshot (16:10) in /public; the generated cover is used otherwise. */
  image?: string;
  links: { case?: string; repo?: string };
}

/**
 * MOCK DATA — placeholder projects that match the profile (AI, cloud, data).
 * Replace them with real case studies; see docs/CONTENT.md.
 */
export const PROJECTS_ARE_MOCKS = true;

export const PROJECTS: Project[] = [
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
    size: "lg",
    featured: true,
    cover: "graph",
    links: { case: "https://github.com/criskian", repo: "https://github.com/criskian" },
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
    cover: "cloud",
    links: { repo: "https://github.com/criskian" },
  },
  {
    slug: "riverflow",
    title: "Riverflow",
    tagline: { en: "Real-time data pipeline", es: "Pipeline de datos en tiempo real" },
    summary: {
      en: "Streaming platform that ingests, validates and serves product events to analytics and ML features in near real time.",
      es: "Plataforma de streaming que ingiere, valida y sirve eventos de producto para analítica y features de ML casi en tiempo real.",
    },
    role: { en: "Data engineer", es: "Ingeniero de datos" },
    impact: { en: "2M events/min · p95 < 3 s", es: "2M eventos/min · p95 < 3 s" },
    stack: ["Kafka", "Spark Streaming", "Delta Lake", "Airflow"],
    year: 2025,
    size: "md",
    cover: "stream",
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
    cover: "agents",
    links: { case: "https://github.com/criskian", repo: "https://github.com/criskian" },
  },
];
