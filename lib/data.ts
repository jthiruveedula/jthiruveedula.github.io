export interface Project {
  id: string;
  title: string;
  category: string;
  kicker: string;
  summary: string;
  detail: string;
  stack: string[];
  metric: string;
  metricLabel: string;
  role: string;
  challenge: string;
  solution: string;
  outcome: string[];
  githubUrl?: string;
}

export interface SkillCategory {
  category: string;
  icon: string;
  skills: { name: string; level: number }[];
}

export interface Service {
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  rating: number;
}

export interface Certification {
  name: string;
  issuer: string;
}

export interface TeamRole {
  company: string;
  period: string;
  title: string;
  subtitle: string;
  tags: string[];
  milestone: string;
  details: string[];
  highlight: string;
}

export interface PipelineStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  icon: string;
}

export interface Metric {
  value: string;
  label: string;
  suffix: string;
}

export const siteConfig = {
  name: "Jagadeesh Thiruveedula",
  role: "Data Architect & Senior Data Engineer",
  tagline: "Private LLM applications, enterprise-grade RAG pipelines, and governed agentic workflows on GCP",
  location: "Corinth, Texas (DFW)",
  email: "jagadeesh.thiruveedula@gmail.com",
  github: "https://github.com/jthiruveedula",
  linkedin: "https://www.linkedin.com/in/jagadeesh-thiruveedula/",
  bio: [
    "I design and build enterprise-scale data systems and private LLM applications on Google Cloud — from BigQuery warehouses to production RAG pipelines.",
    "I work across the full stack: Airflow pipelines, SQL optimization, agentic workflows, prompt engineering, and quantitative trading systems.",
  ],
};

export const skillCategories: SkillCategory[] = [
  {
    category: "Cloud",
    icon: "cloud",
    skills: [
      { name: "Google Cloud Platform", level: 95 },
      { name: "BigQuery", level: 95 },
      { name: "Dataflow", level: 85 },
      { name: "Cloud Composer", level: 85 },
      { name: "Cloud Run", level: 80 },
    ],
  },
  {
    category: "Data Engineering",
    icon: "database",
    skills: [
      { name: "Apache Airflow", level: 90 },
      { name: "SQL Stored Procedures", level: 95 },
      { name: "Data Transformations", level: 90 },
      { name: "SCD2 Patterns", level: 85 },
      { name: "Warehouse Design", level: 90 },
    ],
  },
  {
    category: "AI/ML",
    icon: "brain",
    skills: [
      { name: "Generative AI", level: 90 },
      { name: "Prompt Engineering", level: 90 },
      { name: "Agentic Frameworks", level: 85 },
      { name: "MCP Protocol", level: 80 },
      { name: "LLM Evaluation", level: 80 },
    ],
  },
  {
    category: "Development",
    icon: "code",
    skills: [
      { name: "Python", level: 90 },
      { name: "SQL", level: 95 },
      { name: "Bash", level: 80 },
      { name: "YAML", level: 85 },
      { name: "Full-Stack Web", level: 75 },
    ],
  },
  {
    category: "Finance",
    icon: "trending-up",
    skills: [
      { name: "Trading Algorithms", level: 80 },
      { name: "Market Analysis", level: 75 },
      { name: "Portfolio Optimization", level: 80 },
      { name: "Risk Modeling", level: 70 },
      { name: "Quantitative Research", level: 75 },
    ],
  },
];

export const projects: Project[] = [
  {
    id: "dual-agent-platform",
    title: "Dual-Agent Platform",
    category: "AI",
    kicker: "Agentic Orchestration",
    summary: "Planner + executor agents with shared memory, tool routing, and guardrails for enterprise SOP automation.",
    detail: "A dual-agent architecture where a planner agent decomposes complex requests into sub-tasks and an executor agent routes them to specialized tools. Features shared context memory, role-based access controls, and comprehensive guardrails for enterprise compliance.",
    stack: ["Vertex AI", "Gemini", "Cloud Run", "Firestore"],
    metric: "63%",
    metricLabel: "fewer tokens vs single-agent baseline",
    role: "Lead Architect & Developer",
    challenge: "Single-agent LLM systems struggled with complex enterprise SOPs, consuming excessive tokens and losing context across multi-step workflows.",
    solution: "Designed a planner-executor pattern with shared memory, dynamic tool routing, and token-budgeted context windows that reduced per-task token consumption.",
    outcome: [
      "63% reduction in token consumption per task",
      "Zero context-loss incidents across 500+ test runs",
      "Sub-2s response time for 90% of requests",
    ],
  },
  {
    id: "rag-pipeline-gcp-vertexai",
    title: "RAG Pipeline — GCP / Vertex AI",
    category: "AI",
    kicker: "Enterprise RAG",
    summary: "Ingestion, chunking, hybrid retrieval, and evaluation harness on private Vertex embeddings governed by IAM and VPC-SC.",
    detail: "End-to-end RAG pipeline processing 12M+ document chunks with hybrid dense-sparse retrieval. Features chunking strategies, cross-encoder re-ranking, and a comprehensive evaluation harness for precision measurement.",
    stack: ["Vertex AI", "BigQuery", "Cloud Storage", "Matching Engine"],
    metric: "<380ms",
    metricLabel: "p95 retrieval over 12M chunks",
    role: "ML Engineer & Architect",
    challenge: "Enterprise document retrieval required sub-second latency over millions of chunks with strict data governance boundaries.",
    solution: "Implemented hybrid retrieval combining Vertex AI embeddings with BigQuery metadata filtering, plus cross-encoder re-ranking for precision.",
    outcome: [
      "p95 retrieval latency under 380ms",
      "92% top-5 recall on golden QA set",
      "Zero data boundary violations across IAM audits",
    ],
  },
  {
    id: "intraday-ops-intelligence",
    title: "Intraday Ops Intelligence",
    category: "Data Engineering",
    kicker: "Streaming + LLM",
    summary: "Streaming features into a reasoning layer that narrates anomalies with grounded evidence and recommended actions.",
    detail: "Real-time operational intelligence platform that ingests streaming data via Pub/Sub, processes with Dataflow, enriches in BigQuery, and uses Gemini for narrative anomaly detection with recommended actions.",
    stack: ["Pub/Sub", "Dataflow", "BigQuery", "Gemini"],
    metric: "95s",
    metricLabel: "MTTD down from 14 minutes",
    role: "Data Architect",
    challenge: "Operations teams faced 14-minute mean-time-to-detection for critical anomalies, causing revenue-impacting delays.",
    solution: "Architected a streaming pipeline with LLM-powered anomaly narration that reduced detection latency by 88%.",
    outcome: [
      "MTTD reduced from 14 minutes to 95 seconds",
      "89% anomaly classification accuracy",
      "Automated runbook generation for top 10 incident types",
    ],
  },
  {
    id: "policy-sop-assistant",
    title: "Policy & SOP Assistant",
    category: "AI",
    kicker: "Private LLM App",
    summary: "Citation-first assistant grounded on policy corpora with refusal logic and reviewer-in-the-loop feedback.",
    detail: "Private LLM application serving enterprise policy and SOP queries with strict citation requirements. Features refusal logic for out-of-scope queries, reviewer feedback loop for continuous improvement, and comprehensive audit logging.",
    stack: ["Gemma", "LangGraph", "Cloud Run", "Postgres"],
    metric: "92%",
    metricLabel: "citation precision on golden set",
    role: "Full-Stack AI Developer",
    challenge: "Policy lookup was manual and error-prone, with no audit trail or citation tracking for compliance requirements.",
    solution: "Built a citation-first RAG system with refusal logic, reviewer feedback capture, and a full audit trail.",
    outcome: [
      "92% citation precision on held-out test set",
      "Zero out-of-scope answers after refusal tuning",
      "4.5/5 user satisfaction score in pilot",
    ],
  },
  {
    id: "gdrive-rag-assistant",
    title: "Drive-Grounded RAG Assistant",
    category: "Data Engineering",
    kicker: "Knowledge Surfaces",
    summary: "Incremental Drive sync with ACL-aware retrieval and per-user grounding that respects permission boundaries.",
    detail: "Knowledge retrieval system that indexes Google Drive content with full ACL awareness. Incremental sync keeps indices current while per-user grounding ensures users only retrieve documents they have permission to access.",
    stack: ["Drive API", "Vertex AI", "Cloud Functions"],
    metric: "0",
    metricLabel: "ACL violations across 4 audits",
    role: "Architect & Developer",
    challenge: "Enterprise knowledge in Google Drive was inaccessible to LLM applications while maintaining document-level access controls.",
    solution: "Designed ACL-aware indexing with incremental Drive sync and per-user retrieval filtering that respects permission boundaries.",
    outcome: [
      "Zero ACL violations across 4 security audits",
      "500+ users onboarded with personalized grounding",
      "99.9% index freshness for actively edited documents",
    ],
  },
  {
    id: "openclaw-gemma-pro",
    title: "OpenClaw / Gemma Pro",
    category: "Development",
    kicker: "Open-Source GenAI",
    summary: "Self-hosted Gemma stack with fine-tuned adapters, evaluation harness, and a thin API for internal teams.",
    detail: "Open-source infrastructure for self-hosted Gemma models with fine-tuned LoRA adapters, automated evaluation pipelines, and a lightweight REST API for internal team consumption.",
    stack: ["Gemma", "vLLM", "GKE", "PEFT"],
    metric: "4.2×",
    metricLabel: "throughput vs vanilla HF serve",
    role: "Infrastructure & ML Engineer",
    challenge: "Internal teams needed self-hosted LLM inference but vanilla Hugging Face serving couldn't meet throughput requirements.",
    solution: "Deployed Gemma with vLLM on GKE, fine-tuned with PEFT adapters, and built an evaluation harness for quality gates.",
    outcome: [
      "4.2x throughput improvement over vanilla HF serving",
      "6 fine-tuned adapters for domain-specific tasks",
      "Automatic rollback on quality regression",
    ],
  },
];

export const caseStudies = [
  {
    title: "BigQuery Cost Optimization & Performance Tuning",
    subtitle: "Reduced query costs by 60% while improving execution speed 3.2x",
    content: [
      {
        heading: "Background",
        text: "A financial services client was spending $45K/month on BigQuery with queries frequently timing out during peak trading hours. The existing schema used wide tables with excessive JOINs and no partitioning strategy.",
      },
      {
        heading: "My Approach",
        text: "Conducted a full audit of query patterns, slot utilization, and storage costs. Redesigned the warehouse with date-partitioned clustering, materialized aggregate tables, and rewritten SQL stored procedures that eliminated self-joins.",
      },
      {
        heading: "Architecture Changes",
        text: "Implemented a tiered data architecture: raw → staging → curated → aggregates. Used BigQuery auto-scaling slots with baseline reservations for critical trading windows. Built Airflow DAGs for incremental refresh.",
      },
      {
        heading: "Results",
        text: "Monthly costs dropped to $18K (60% reduction), query execution improved 3.2x, and the 10 most expensive queries went from 45s average to under 3s.",
      },
    ],
    metrics: [
      { value: "60", suffix: "%", label: "Cost Reduction" },
      { value: "3.2", suffix: "×", label: "Speed Improvement" },
      { value: "45", prefix: "$", suffix: "K/mo → $18K", label: "Query Spend" },
    ],
    stack: ["BigQuery", "Airflow", "Dataform", "Cloud Monitoring"],
  },
  {
    title: "Data Warehouse Modernization for Real-Time Analytics",
    subtitle: "Migrated from batch to streaming, cutting data latency from 24h to 30s",
    content: [
      {
        heading: "Background",
        text: "A retail analytics platform relied on nightly batch loads, giving business users 24-hour-old data. They needed real-time inventory and sales insights to compete with faster-moving competitors.",
      },
      {
        heading: "My Approach",
        text: "Designed a lambda architecture with Dataflow for streaming ingestion and BigQuery for storage/query. Built CDC pipelines from operational databases and implemented SCD2 patterns for historical tracking.",
      },
      {
        heading: "Architecture Changes",
        text: "Pub/Sub → Dataflow → BigQuery streaming pipeline replaced nightly batch. Added Cloud Composer for orchestration with real-time monitoring dashboards. Implemented exactly-once semantics for financial accuracy.",
      },
      {
        heading: "Results",
        text: "Data latency dropped from 24 hours to under 30 seconds. Real-time dashboards enabled same-day inventory optimization, reducing stockouts by 35%.",
      },
    ],
    metrics: [
      { value: "24", suffix: "h → 30s", label: "Data Latency" },
      { value: "35", suffix: "%", label: "Fewer Stockouts" },
      { value: "99.99", suffix: "%", label: "Pipeline Uptime" },
    ],
    stack: ["Pub/Sub", "Dataflow", "BigQuery", "Cloud Composer", "Looker"],
  },
];

export const services: Service[] = [
  {
    title: "GCP Data Architecture",
    description: "End-to-end data platform design on Google Cloud — from ingestion to analytics — built for scale, governance, and cost efficiency.",
    icon: "cloud",
  },
  {
    title: "BigQuery Optimization",
    description: "Query performance tuning, schema redesign, slot management, and cost reduction strategies that deliver measurable savings.",
    icon: "database",
  },
  {
    title: "Generative AI Applications",
    description: "Custom LLM applications with RAG, agentic workflows, prompt engineering, and MCP integration for enterprise use cases.",
    icon: "brain",
  },
  {
    title: "Cloud Cost Optimization",
    description: "Comprehensive GCP cost analysis — reserved instances, committed use discounts, storage tiering, and query optimization.",
    icon: "trending-up",
  },
  {
    title: "Trading Bot Implementation",
    description: "Algorithmic trading systems with market data pipelines, strategy backtesting, risk management, and live execution on GCP.",
    icon: "code",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "Jagadeesh transformed our BigQuery infrastructure. What was a $45K/month bottleneck became a competitive advantage. His architectural clarity and execution speed are exceptional.",
    name: "Sarah Chen",
    title: "VP of Data Engineering, FinTech Corp",
    rating: 5,
  },
  {
    quote: "Working with Jagadeesh on our RAG pipeline was a masterclass in production AI. He doesn't just build demos — he builds systems that operate reliably at scale.",
    name: "Michael Okonkwo",
    title: "CTO, DataSphere Analytics",
    rating: 5,
  },
  {
    quote: "Jagadeesh's ability to bridge data engineering and AI is rare. He optimized our Airflow DAGs and delivered a GenAI assistant in the same quarter. Truly full-stack data architect.",
    name: "Priya Patel",
    title: "Director of Data, HealthTech Solutions",
    rating: 5,
  },
];

export const certifications: Certification[] = [
  { name: "Google Cloud Professional Data Engineer", issuer: "Google Cloud" },
  { name: "Google Cloud Professional Cloud Architect", issuer: "Google Cloud" },
  { name: "Google Cloud Professional Machine Learning Engineer", issuer: "Google Cloud" },
  { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services" },
];

export const experience: TeamRole[] = [
  {
    company: "Quantiphi",
    period: "Sep 2022 – Present",
    title: "Data Architect",
    subtitle: "GCP modernization, RAG platforms, evaluation harnesses, and secure enterprise AI delivery.",
    tags: ["GCP", "GenAI", "RAG", "IAM"],
    milestone: "3 production GenAI systems",
    details: [
      "Designed and deployed end-to-end RAG platform on Vertex AI with hybrid retrieval",
      "Built evaluation harness for LLM outputs with 92%+ citation precision",
      "Implemented IAM-governed access controls across all GenAI services",
      "Architected agentic orchestration layer with LangGraph for SOP automation",
    ],
    highlight: "Production",
  },
  {
    company: "Charles Schwab",
    period: "Nov 2021 – Sep 2022",
    title: "Senior Data Engineer",
    subtitle: "Migrated warehouse workloads to GCP and stabilized CI/CD, observability, and performance at scale.",
    tags: ["BigQuery", "PySpark", "Terraform", "DevOps"],
    milestone: "$MM cloud migration programs",
    details: [
      "Led migration of on-premise data warehouse to BigQuery, reducing query latency by 60%",
      "Implemented automated CI/CD pipelines with Terraform for infrastructure provisioning",
      "Built real-time observability dashboards for pipeline health and cost tracking",
      "Optimized PySpark jobs for 40% reduction in compute costs",
    ],
    highlight: "Enterprise",
  },
  {
    company: "Wiley Publications",
    period: "Mar 2019 – Nov 2021",
    title: "Data Engineer",
    subtitle: "Built ETL pipelines, data integration layers, and analytics workflows for publishing platforms.",
    tags: ["ETL", "Data Pipelines", "Analytics"],
    milestone: "12+ enterprise pipelines",
    details: [
      "Designed and maintained 12+ production ETL pipelines serving analytics teams",
      "Developed data quality framework with automated validation and alerting",
      "Migrated legacy SSIS packages to cloud-native data integration workflows",
      "Built reporting layer for business intelligence dashboards used by 50+ stakeholders",
    ],
    highlight: "Pipeline",
  },
  {
    company: "DSOgroup TEOTYS",
    period: "Aug 2018 – Mar 2019",
    title: "Software Engineer",
    subtitle: "Talend streaming jobs, CDC pipelines, and DR-ready data frameworks.",
    tags: ["Talend", "ETL", "CDC"],
    milestone: "Real-time CDC pipelines",
    details: [
      "Architected real-time CDC pipeline using Talend streaming jobs for sub-minute latency",
      "Implemented disaster recovery framework with automated failover and data consistency checks",
      "Built monitoring dashboards for pipeline health and SLA tracking",
      "Reduced data freshness from hourly to near-real-time for critical business reports",
    ],
    highlight: "Real-time",
  },
  {
    company: "Innominds",
    period: "Jun 2015 – Jul 2018",
    title: "Software Engineer",
    subtitle: "Warehouse and ETL design with reusable business logic and reliability improvements.",
    tags: ["ETL", "Talend", "Data Quality"],
    milestone: "50+ data warehouse ETLs",
    details: [
      "Developed 50+ ETL mappings for enterprise data warehouse modernization initiatives",
      "Created reusable business logic library reducing development time by 30%",
      "Implemented data lineage and impact analysis for regulatory compliance",
      "Established code review and testing best practices for the data engineering team",
    ],
    highlight: "Enterprise",
  },
  {
    company: "Vizag Steel Plant",
    period: "Jan 2015 – Mar 2015",
    title: "Intern",
    subtitle: "SCADA and automation work for monitoring and operational troubleshooting.",
    tags: ["IoT", "Automation", "Monitoring"],
    milestone: "SCADA industrial automation",
    details: [
      "Developed SCADA monitoring dashboards for production line metrics and alerts",
      "Assisted in troubleshooting automation control systems for industrial equipment",
      "Created documentation and runbooks for operational procedures",
      "Contributed to IoT data collection pipeline for sensor telemetry",
    ],
    highlight: "SCADA",
  },
];

export const archPipeline: PipelineStep[] = [
  {
    step: 1,
    title: "Ingest",
    subtitle: "Structured + unstructured data acquisition with schema validation.",
    description: "Acquire data from diverse sources with schema validation, quality checks, and automated retry logic.",
    tags: ["BigQuery", "GCS", "Composer"],
    icon: "database",
  },
  {
    step: 2,
    title: "Embed",
    subtitle: "Semantic encoding via domain-tuned foundation models on Vertex AI.",
    description: "Transform raw data into high-dimensional vectors using fine-tuned embedding models for domain-specific understanding.",
    tags: ["Vertex AI", "Gemini"],
    icon: "brain",
  },
  {
    step: 3,
    title: "Retrieve",
    subtitle: "Hybrid dense + sparse retrieval with cross-encoder re-ranking.",
    description: "Combine semantic and keyword search with cross-encoder re-ranking for maximum precision in result sets.",
    tags: ["Matching Engine", "pgvector"],
    icon: "code",
  },
  {
    step: 4,
    title: "Govern",
    subtitle: "Lineage tracking, evaluation harness, and rollback capability.",
    description: "Full data lineage, automated evaluation pipelines, and instant rollback for production confidence.",
    tags: ["IAM", "VPC-SC", "Dataplex"],
    icon: "trending-up",
  },
  {
    step: 5,
    title: "Serve",
    subtitle: "Low-latency inference with policy-aware grounding and guardrails.",
    description: "Production inference with policy-aware response generation, guardrails, and comprehensive observability.",
    tags: ["Cloud Run", "CDN"],
    icon: "cloud",
  },
];

export const metrics: Metric[] = [
  { value: "24+", label: "Production Deployments", suffix: "deployments" },
  { value: "12+", label: "Enterprise Clients", suffix: "clients" },
  { value: "15+", label: "RAG Pipelines", suffix: "pipelines" },
  { value: "8+", label: "Agentic Workflows", suffix: "workflows" },
];

export const categoryIcons: Record<string, string> = {
  AI: "bot",
  "Data Engineering": "database",
  Development: "code",
  Trading: "trending-up",
};

export const filterCategories = ["All", "AI", "Data Engineering", "Development", "Trading"] as const;
