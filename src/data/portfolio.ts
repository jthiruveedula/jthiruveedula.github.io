import type { PortfolioData } from './types'

// Canonical dataset — merged from 8 resume variants + prior site content.
// Regenerate via the resume-data-extraction workflow; do not hand-edit metrics.
export const portfolio: PortfolioData = {
  "profile": {
    "name": "Jagadeesh Thiruveedula",
    "title": "Data & AI Architect | GCP · BigQuery · Vertex AI · RAG · Agents | Legacy → Cloud → Enterprise AI",
    "summary": "Data & AI Architect with 11+ years taking Fortune 500 enterprises from legacy systems through cloud modernization to production GenAI. Delivered $2M+ in cost savings, 500+ TiB of cloud migrations, and 1B+ daily events at 99.9% uptime — then shipped private LLM applications serving 50M+ documents at 95% grounded accuracy. Strong on evaluation, guardrails, and governance: the work that turns a demo into a production system.",
    "email": "jagadeeshthiruveedula77@gmail.com",
    "linkedin": "https://www.linkedin.com/in/jagadeesh-thiruveedula/",
    "github": "https://github.com/jthiruveedula",
    "location": "DFW (Dallas Fort Worth), TX · Open to relocation · 50% travel"
  },
  "skills": [
    {
      "name": "GCP",
      "domain": "Cloud Data Platforms",
      "years": 7,
      "tier": 1
    },
    {
      "name": "BigQuery",
      "domain": "Cloud Data Platforms",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Dataflow",
      "domain": "Cloud Data Platforms",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Cloud Composer",
      "domain": "Cloud Data Platforms",
      "years": 6,
      "tier": 1
    },
    {
      "name": "Dataproc",
      "domain": "Cloud Data Platforms",
      "years": 6,
      "tier": 2
    },
    {
      "name": "Data Fusion",
      "domain": "Cloud Data Platforms",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Cloud Run",
      "domain": "Cloud Data Platforms",
      "years": 3,
      "tier": 2
    },
    {
      "name": "AWS (S3, Glue, EMR, Redshift)",
      "domain": "Cloud Data Platforms",
      "years": 3,
      "tier": 2
    },
    {
      "name": "Azure",
      "domain": "Cloud Data Platforms",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Azure Data Factory",
      "domain": "Cloud Data Platforms",
      "years": 6,
      "tier": 2
    },
    {
      "name": "Synapse Analytics",
      "domain": "Cloud Data Platforms",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Microsoft Fabric",
      "domain": "Cloud Data Platforms",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Azure Data Lake Storage",
      "domain": "Cloud Data Platforms",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Databricks (Delta Lake, Unity Catalog)",
      "domain": "Cloud Data Platforms",
      "years": 2,
      "tier": 2
    },
    {
      "name": "Delta Lake",
      "domain": "Cloud Data Platforms",
      "years": 2,
      "tier": 2
    },
    {
      "name": "Unity Catalog",
      "domain": "Cloud Data Platforms",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Snowflake → BigQuery migration",
      "domain": "Cloud Data Platforms",
      "years": 1,
      "tier": 1
    },
    {
      "name": "Teradata → BigQuery migration",
      "domain": "Cloud Data Platforms",
      "years": 5,
      "tier": 1
    },
    {
      "name": "Hadoop → GCP migration",
      "domain": "Cloud Data Platforms",
      "years": 5,
      "tier": 1
    },
    {
      "name": "Couchbase → Spanner/Bigtable migration",
      "domain": "Cloud Data Platforms",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Mainframe/COBOL → PySpark modernization",
      "domain": "Cloud Data Platforms",
      "years": 2,
      "tier": 1
    },
    {
      "name": "Cross-cloud migration & ingestion (AWS↔GCP↔Azure)",
      "domain": "Cloud Data Platforms",
      "years": 2,
      "tier": 2
    },
    {
      "name": "Vertex AI",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "Vertex AI Vector Search",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "GPT-4o",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "Claude Sonnet 4",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 2
    },
    {
      "name": "Gemini 1.5 Pro",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "PaLM 2",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Llama 3",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "OpenAI API",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 2
    },
    {
      "name": "Azure OpenAI",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Azure AI Foundry",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Hugging Face",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 2
    },
    {
      "name": "Prompt architecture",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "Fine-tuning (LoRA/QLoRA)",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 2
    },
    {
      "name": "Guardrails",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "Responsible AI governance",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 2
    },
    {
      "name": "RAG",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "Pinecone",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 2
    },
    {
      "name": "Weaviate",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "pgvector",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 2
    },
    {
      "name": "FAISS",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Chroma",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Chunking & reranking strategies",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "Hybrid retrieval + cross-encoder reranking",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "Embeddings (text-embedding-gecko, OpenAI)",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 2
    },
    {
      "name": "LangChain",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "LangGraph",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "CrewAI",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "DSPy",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "MCP (servers & interoperability)",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "Tool-use chains",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "Multi-turn agents",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "Multi-agent orchestration",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "A2A (agent-to-agent) communication",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Human-in-the-loop",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 2
    },
    {
      "name": "RAGAS",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "LangSmith",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "Langfuse",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 2
    },
    {
      "name": "Arize Phoenix",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 2
    },
    {
      "name": "LLM-as-judge rubrics",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 1
    },
    {
      "name": "Hallucination/drift detection",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 2
    },
    {
      "name": "A/B prompt routing",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 2
    },
    {
      "name": "Eval harnesses",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "GenAI schema-mapping & code translation",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 1
    },
    {
      "name": "MLflow",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 2
    },
    {
      "name": "MLOps pipelines",
      "domain": "GenAI & LLM",
      "years": 3,
      "tier": 2
    },
    {
      "name": "Model serving",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 2
    },
    {
      "name": "Model registry",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 2
    },
    {
      "name": "TensorFlow",
      "domain": "GenAI & LLM",
      "years": 4,
      "tier": 2
    },
    {
      "name": "scikit-learn",
      "domain": "GenAI & LLM",
      "years": 4,
      "tier": 2
    },
    {
      "name": "PyTorch",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 3
    },
    {
      "name": "XGBoost",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 3
    },
    {
      "name": "NLP",
      "domain": "GenAI & LLM",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Computer vision",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Feature engineering",
      "domain": "GenAI & LLM",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Model training",
      "domain": "GenAI & LLM",
      "years": 3,
      "tier": 2
    },
    {
      "name": "Distributed training",
      "domain": "GenAI & LLM",
      "years": 2,
      "tier": 3
    },
    {
      "name": "GPU optimization",
      "domain": "GenAI & LLM",
      "years": 1,
      "tier": 3
    },
    {
      "name": "PySpark",
      "domain": "Data Engineering",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Spark",
      "domain": "Data Engineering",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Airflow",
      "domain": "Data Engineering",
      "years": 7,
      "tier": 1
    },
    {
      "name": "dbt",
      "domain": "Data Engineering",
      "years": 7,
      "tier": 2
    },
    {
      "name": "Talend",
      "domain": "Data Engineering",
      "years": 9,
      "tier": 1
    },
    {
      "name": "Informatica",
      "domain": "Data Engineering",
      "years": 3,
      "tier": 3
    },
    {
      "name": "IICS",
      "domain": "Data Engineering",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Qlik Replicate",
      "domain": "Data Engineering",
      "years": 3,
      "tier": 2
    },
    {
      "name": "Hadoop",
      "domain": "Data Engineering",
      "years": 5,
      "tier": 2
    },
    {
      "name": "ETL/ELT design & modernization",
      "domain": "Data Engineering",
      "years": 11,
      "tier": 1
    },
    {
      "name": "Data ingestion pipelines",
      "domain": "Data Engineering",
      "years": 11,
      "tier": 1
    },
    {
      "name": "Batch processing",
      "domain": "Data Engineering",
      "years": 11,
      "tier": 1
    },
    {
      "name": "Power BI",
      "domain": "Data Engineering",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Tableau",
      "domain": "Data Engineering",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Data analytics, dashboards & KPI reporting",
      "domain": "Data Engineering",
      "years": 6,
      "tier": 2
    },
    {
      "name": "Self-service BI & semantic models",
      "domain": "Data Engineering",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Kafka",
      "domain": "Streaming & Realtime",
      "years": 4,
      "tier": 1
    },
    {
      "name": "Pub/Sub",
      "domain": "Streaming & Realtime",
      "years": 4,
      "tier": 1
    },
    {
      "name": "Streaming pipelines",
      "domain": "Streaming & Realtime",
      "years": 7,
      "tier": 1
    },
    {
      "name": "CDC patterns",
      "domain": "Streaming & Realtime",
      "years": 7,
      "tier": 1
    },
    {
      "name": "High-throughput streaming (1B+ events/day)",
      "domain": "Streaming & Realtime",
      "years": 4,
      "tier": 1
    },
    {
      "name": "Snowflake",
      "domain": "Databases & Warehouses",
      "years": 1,
      "tier": 2
    },
    {
      "name": "Oracle",
      "domain": "Databases & Warehouses",
      "years": 8,
      "tier": 2
    },
    {
      "name": "MSSQL",
      "domain": "Databases & Warehouses",
      "years": 4,
      "tier": 3
    },
    {
      "name": "MySQL",
      "domain": "Databases & Warehouses",
      "years": 4,
      "tier": 3
    },
    {
      "name": "Teradata",
      "domain": "Databases & Warehouses",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Hive",
      "domain": "Databases & Warehouses",
      "years": 5,
      "tier": 2
    },
    {
      "name": "Postgres",
      "domain": "Databases & Warehouses",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Spanner",
      "domain": "Databases & Warehouses",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Bigtable",
      "domain": "Databases & Warehouses",
      "years": 1,
      "tier": 3
    },
    {
      "name": "Amazon Redshift",
      "domain": "Databases & Warehouses",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Azure SQL",
      "domain": "Databases & Warehouses",
      "years": 2,
      "tier": 3
    },
    {
      "name": "Enterprise warehouse design",
      "domain": "Databases & Warehouses",
      "years": 11,
      "tier": 1
    },
    {
      "name": "Dimensional modeling",
      "domain": "Databases & Warehouses",
      "years": 11,
      "tier": 1
    },
    {
      "name": "SCD2",
      "domain": "Databases & Warehouses",
      "years": 9,
      "tier": 1
    },
    {
      "name": "Medallion architecture (Bronze/Silver/Gold)",
      "domain": "Databases & Warehouses",
      "years": 2,
      "tier": 2
    },
    {
      "name": "SQL optimization",
      "domain": "Databases & Warehouses",
      "years": 11,
      "tier": 1
    },
    {
      "name": "Partitioning & clustering",
      "domain": "Databases & Warehouses",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Python",
      "domain": "Languages",
      "years": 11,
      "tier": 1
    },
    {
      "name": "SQL",
      "domain": "Languages",
      "years": 11,
      "tier": 1
    },
    {
      "name": "PL/SQL",
      "domain": "Languages",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Java",
      "domain": "Languages",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Scala",
      "domain": "Languages",
      "years": 3,
      "tier": 3
    },
    {
      "name": "Shell",
      "domain": "Languages",
      "years": 8,
      "tier": 2
    },
    {
      "name": "Terraform",
      "domain": "DevOps & IaC",
      "years": 7,
      "tier": 1
    },
    {
      "name": "GitHub Actions",
      "domain": "DevOps & IaC",
      "years": 3,
      "tier": 1
    },
    {
      "name": "Bitbucket",
      "domain": "DevOps & IaC",
      "years": 6,
      "tier": 2
    },
    {
      "name": "Bamboo",
      "domain": "DevOps & IaC",
      "years": 6,
      "tier": 2
    },
    {
      "name": "CI/CD",
      "domain": "DevOps & IaC",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Docker",
      "domain": "DevOps & IaC",
      "years": 5,
      "tier": 2
    },
    {
      "name": "Kubernetes",
      "domain": "DevOps & IaC",
      "years": 3,
      "tier": 2
    },
    {
      "name": "FinOps cost optimization",
      "domain": "DevOps & IaC",
      "years": 4,
      "tier": 1
    },
    {
      "name": "VPC-SC",
      "domain": "DevOps & IaC",
      "years": 2,
      "tier": 1
    },
    {
      "name": "CMEK",
      "domain": "DevOps & IaC",
      "years": 2,
      "tier": 2
    },
    {
      "name": "SSO/SAML",
      "domain": "DevOps & IaC",
      "years": 2,
      "tier": 2
    },
    {
      "name": "IAM",
      "domain": "DevOps & IaC",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Data governance",
      "domain": "Governance & Quality",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Data quality frameworks",
      "domain": "Governance & Quality",
      "years": 9,
      "tier": 1
    },
    {
      "name": "Data lineage",
      "domain": "Governance & Quality",
      "years": 5,
      "tier": 2
    },
    {
      "name": "Metadata management",
      "domain": "Governance & Quality",
      "years": 7,
      "tier": 2
    },
    {
      "name": "Access controls",
      "domain": "Governance & Quality",
      "years": 7,
      "tier": 2
    },
    {
      "name": "HIPAA / SOC 2 / FedRAMP compliance",
      "domain": "Governance & Quality",
      "years": 4,
      "tier": 2
    },
    {
      "name": "PI-redaction",
      "domain": "Governance & Quality",
      "years": 1,
      "tier": 2
    },
    {
      "name": "Audit logging",
      "domain": "Governance & Quality",
      "years": 4,
      "tier": 2
    },
    {
      "name": "Root cause analysis",
      "domain": "Governance & Quality",
      "years": 9,
      "tier": 2
    },
    {
      "name": "Architecture governance",
      "domain": "Governance & Quality",
      "years": 5,
      "tier": 1
    },
    {
      "name": "Design reviews",
      "domain": "Governance & Quality",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Reference architectures",
      "domain": "Governance & Quality",
      "years": 5,
      "tier": 2
    },
    {
      "name": "Platform standardization",
      "domain": "Governance & Quality",
      "years": 5,
      "tier": 1
    },
    {
      "name": "Stakeholder communication",
      "domain": "Governance & Quality",
      "years": 7,
      "tier": 1
    },
    {
      "name": "Discovery workshops",
      "domain": "Governance & Quality",
      "years": 3,
      "tier": 1
    },
    {
      "name": "Pre-sales & RFP/RFI responses",
      "domain": "Governance & Quality",
      "years": 3,
      "tier": 2
    },
    {
      "name": "Stakeholder advisory",
      "domain": "Governance & Quality",
      "years": 3,
      "tier": 2
    },
    {
      "name": "Technical presentations",
      "domain": "Governance & Quality",
      "years": 7,
      "tier": 2
    },
    {
      "name": "Cross-functional collaboration",
      "domain": "Governance & Quality",
      "years": 9,
      "tier": 2
    }
  ],
  "experience": [
    {
      "company": "John Wiley & Sons",
      "client": "Wiley CXO & platform leadership (embedded engagement, Remote)",
      "title": "Data & GenAI Architect (Forward Deployed)",
      "start": "2025-05",
      "end": "present",
      "era": "ai",
      "summary": "Embedded with Wiley leadership to ship private LLM applications end-to-end and deliver a 500+ TiB Snowflake→BigQuery modernization with GenAI-accelerated tooling.",
      "highlights": [
        "Architected production RAG over 50M+ enterprise documents (Vertex AI Vector Search + Pinecone, hybrid retrieval + cross-encoder reranking, grounded citations, multi-agent orchestration with MCP tool interoperability) — 95% answer accuracy on stratified eval (RAGAS faithfulness + human review), 3x analyst productivity, p95 <1.5s; shipped for CXO-level executive reporting.",
        "Built multi-turn customer service agent with tool-use (order lookup, policy retrieval, ticket routing), PI-redaction guardrails, and A/B routing across GPT-4o / Gemini 1.5 Pro / Claude Sonnet 4 — 60% tier-1 ticket deflection, p95 <2s, >4.3/5 CSAT; deployed in-VPC behind Wiley SSO/SAML with full audit logging.",
        "Orchestrated 500+ TiB Snowflake → BigQuery migration with GenAI-accelerated schema-mapping and SQL translation — 40% reduction in manual refactoring, zero data loss across 200+ ETL workflows on Cloud Composer + Dataflow.",
        "Built LLMOps platform: prompt versioning + eval harness (LangSmith, RAGAS, LLM-as-judge), LoRA fine-tuning for GPT-4o/Gemini/PaLM, MLflow model registry, and hallucination/drift observability (Langfuse, Arize Phoenix); enforced VPC-SC, CMEK, zero data-exfiltration on Kubernetes with GPU-accelerated compute.",
        "Redesigned dimensional model, partitioning/clustering, and SCD2 patterns for the 50M+ document corpus; standardized CDC patterns and data-quality gates delivering 99.9% uptime with audit-ready lineage.",
        "Codified reusable RAG + agent patterns adopted by 3 downstream programs; routed 2 model failure modes to the vendor roadmap; automated CI/CD via GitHub Actions; mentored 4 engineers."
      ],
      "metrics": [
        {
          "label": "Snowflake → BigQuery migrated",
          "value": "500+ TiB",
          "numeric": 500,
          "suffix": "+ TiB"
        },
        {
          "label": "Documents in production RAG",
          "value": "50M+",
          "numeric": 50,
          "suffix": "M+"
        },
        {
          "label": "Grounded answer accuracy",
          "value": "95%",
          "numeric": 95,
          "suffix": "%"
        },
        {
          "label": "Tier-1 ticket deflection",
          "value": "60%",
          "numeric": 60,
          "suffix": "%"
        },
        {
          "label": "Analyst productivity",
          "value": "3x",
          "numeric": 3,
          "suffix": "×"
        },
        {
          "label": "ETL workflows, zero data loss",
          "value": "200+",
          "numeric": 200,
          "suffix": "+"
        },
        {
          "label": "Manual refactoring cut (GenAI)",
          "value": "40%",
          "numeric": 40,
          "suffix": "%"
        },
        {
          "label": "System uptime",
          "value": "99.9%",
          "numeric": 99.9,
          "suffix": "%"
        }
      ],
      "tech": [
        "BigQuery",
        "Dataflow",
        "Cloud Composer",
        "Pub/Sub",
        "Vertex AI",
        "LangGraph",
        "LangChain",
        "MCP",
        "Pinecone",
        "RAGAS",
        "LangSmith",
        "Langfuse",
        "MLflow",
        "GPT-4o",
        "Gemini 1.5 Pro",
        "Claude Sonnet 4",
        "Databricks",
        "Kubernetes",
        "GitHub Actions",
        "Terraform",
        "VPC-SC",
        "CMEK"
      ]
    },
    {
      "company": "Definity",
      "client": "Definity mainframe operations (Remote)",
      "title": "Data & GenAI Architect",
      "start": "2024-11",
      "end": "2025-05",
      "era": "ai",
      "summary": "GenAI-powered mainframe modernization for an insurance carrier — translating COBOL-era logic into governed cloud pipelines.",
      "highlights": [
        "Ran discovery across 12 COBOL/legacy workstreams to prioritize migration sequencing by risk and value.",
        "Built GenAI code-translation pipeline (Mainframe/COBOL → BigQuery SQL + PySpark) with a semantic-fidelity eval harness; deployed into the customer's GCP VPC behind their IAM.",
        "Designed high-throughput PySpark + BigQuery + Pub/Sub pipelines for batch and real-time streaming; refactored legacy logic into modern, audit-ready, anomaly-resistant patterns with data-quality gates.",
        "Mentored the customer engineering team on AI-assisted modernization; codified 5 reusable transformation patterns into the internal platform playbook."
      ],
      "metrics": [
        {
          "label": "COBOL/legacy workstreams triaged",
          "value": "12",
          "numeric": 12,
          "suffix": ""
        },
        {
          "label": "Reusable transformation patterns codified",
          "value": "5",
          "numeric": 5,
          "suffix": ""
        }
      ],
      "tech": [
        "GCP",
        "BigQuery",
        "PySpark",
        "Pub/Sub",
        "GenAI Code Translation",
        "Mainframe/COBOL",
        "Databricks",
        "Delta Lake",
        "VPC",
        "IAM"
      ]
    },
    {
      "company": "NRG Energy",
      "client": "Energy operations analytics (Remote)",
      "title": "Cloud Data Architect",
      "start": "2024-08",
      "end": "2024-10",
      "era": "cloud",
      "summary": "Directed a cross-cloud AWS → GCP Databricks migration with a phased, near-zero-downtime cutover for energy operations analytics.",
      "highlights": [
        "Embedded with energy operations analytics; scoped the cross-cloud migration with a phased cutover plan targeting a near-zero downtime window.",
        "Directed AWS data lake (S3 + EMR) → GCP Databricks migration; built cross-cloud ingestion and transformation pipelines integrating BigQuery and Vertex AI for predictive maintenance models.",
        "Applied FinOps practices to optimize cross-cloud compute and storage spend.",
        "Delivered phased cutover with <30 min downtime; unified cost analytics pipeline (dbt) reduced energy-trading reporting latency by 40% and improved uptime SLA adherence to 99.95%."
      ],
      "metrics": [
        {
          "label": "Cutover downtime",
          "value": "<30 min",
          "numeric": 30,
          "suffix": " min"
        },
        {
          "label": "Reporting latency reduction",
          "value": "40%",
          "numeric": 40,
          "suffix": "%"
        },
        {
          "label": "Uptime SLA adherence",
          "value": "99.95%",
          "numeric": 99.95,
          "suffix": "%"
        }
      ],
      "tech": [
        "AWS",
        "GCP",
        "Databricks",
        "Delta Lake",
        "BigQuery",
        "Vertex AI",
        "dbt",
        "PySpark",
        "Cross-cloud ingestion"
      ]
    },
    {
      "company": "HCA Healthcare",
      "client": "Nashville, TN",
      "title": "Lead Data Engineer",
      "start": "2022-09",
      "end": "2024-07",
      "era": "cloud",
      "summary": "Led HIPAA-governed cloud modernization and real-time streaming at healthcare scale, seeding GenAI accelerators adopted across 10+ programs.",
      "highlights": [
        "Developed custom Generative AI accelerators automating legacy Talend ETL + SQL → PySpark conversion — 50% cut in project delivery timelines; codified as a reusable framework adopted across 10+ programs.",
        "Migrated 100+ TB of on-premise warehouses and data lakes to GCP under HIPAA compliance; reduced infrastructure costs and boosted ETL performance 30%.",
        "Architected real-time streaming with Kafka and Pub/Sub for 50+ data sources, ensuring 100% data accuracy and audit compliance under healthcare governance; built Power BI dashboards for executive reporting.",
        "Led high-level design reviews, standardized AI-assisted coding tools across the engineering team, and mentored 5 junior engineers to senior roles."
      ],
      "metrics": [
        {
          "label": "Delivery timelines cut via GenAI accelerators",
          "value": "50%",
          "numeric": 50,
          "suffix": "%"
        },
        {
          "label": "Migrated to GCP under HIPAA",
          "value": "100+ TB",
          "numeric": 100,
          "suffix": "+ TB"
        },
        {
          "label": "ETL performance boost",
          "value": "30%",
          "numeric": 30,
          "suffix": "%"
        },
        {
          "label": "Data sources on real-time streaming",
          "value": "50+",
          "numeric": 50,
          "suffix": "+"
        },
        {
          "label": "Programs adopting reusable framework",
          "value": "10+",
          "numeric": 10,
          "suffix": "+"
        },
        {
          "label": "Engineers mentored to senior roles",
          "value": "5",
          "numeric": 5,
          "suffix": ""
        }
      ],
      "tech": [
        "GCP",
        "PySpark",
        "Kafka",
        "Pub/Sub",
        "Talend",
        "GenAI Accelerators",
        "Airflow",
        "Power BI",
        "HIPAA",
        "IAM",
        "DLP"
      ]
    },
    {
      "company": "Charles Schwab",
      "client": "Austin, TX",
      "title": "Senior Data Engineer",
      "start": "2019-04",
      "end": "2022-08",
      "era": "cloud",
      "summary": "Led multi-petabyte Hadoop/Teradata → GCP migration processing 1B+ daily records with zero data loss, delivering $1M+ annual savings.",
      "highlights": [
        "Led multi-petabyte migration from legacy Hadoop/Teradata to GCP, improving system speed and operational efficiency 25%; delivered $1M+ annual infrastructure savings via FinOps cost optimization.",
        "Rewrote and optimized ETL workflows with PySpark and Talend processing 1B+ daily records with zero data loss; standardized CDC patterns cutting pipeline dev time 40%.",
        "Built high-throughput transactional framework (PySpark + Qlik Replicate) processing 30M records/day at 99.5% SLA adherence; automated monitoring cut data errors 15%.",
        "Established IaC with Terraform + Bitbucket + Bamboo for metadata-driven BigQuery deployments, cutting release cycles 50%; featured in Free Press Journal (May 2025) for cloud-native frameworks adopted across 10+ enterprise programs."
      ],
      "metrics": [
        {
          "label": "Annual infrastructure savings",
          "value": "$1M+",
          "numeric": 1,
          "suffix": "M+"
        },
        {
          "label": "Daily records, zero data loss",
          "value": "1B+",
          "numeric": 1,
          "suffix": "B+"
        },
        {
          "label": "Speed & efficiency improvement",
          "value": "25%",
          "numeric": 25,
          "suffix": "%"
        },
        {
          "label": "Transactional throughput",
          "value": "30M/day",
          "numeric": 30,
          "suffix": "M/day"
        },
        {
          "label": "SLA adherence",
          "value": "99.5%",
          "numeric": 99.5,
          "suffix": "%"
        },
        {
          "label": "Release cycles cut via IaC",
          "value": "50%",
          "numeric": 50,
          "suffix": "%"
        }
      ],
      "tech": [
        "GCP",
        "BigQuery",
        "Dataproc",
        "Data Fusion",
        "Dataflow",
        "PySpark",
        "Talend",
        "dbt",
        "Qlik Replicate",
        "Terraform",
        "Bitbucket",
        "Bamboo"
      ]
    },
    {
      "company": "DSO MCS Group",
      "client": "Mauritius",
      "title": "Data Engineer",
      "start": "2018-08",
      "end": "2019-03",
      "era": "legacy",
      "summary": "Unified Mainframe, Teradata, and NAS sources into a cloud-native mortgage recovery analytics platform.",
      "highlights": [
        "Built cloud-native mortgage recovery warehousing solution integrating Mainframe, Teradata, and NAS sources into a unified analytics platform.",
        "Developed scalable Talend Big Data streaming jobs; built reusable frameworks for file capture, SCD ingestion, snapshot ingestion, DQ checks, and Mainframe header validation adopted across the MARS team."
      ],
      "metrics": [],
      "tech": [
        "Talend Big Data",
        "Hive",
        "Java",
        "PL/SQL",
        "Mainframe",
        "Teradata"
      ]
    },
    {
      "company": "InnoMinds",
      "client": "CROMA (Hyderabad, India)",
      "title": "Data Engineer",
      "start": "2015-06",
      "end": "2018-07",
      "era": "legacy",
      "summary": "Built the ETL and dimensional-modeling foundations — 20+ warehouse pipelines processing 5M+ records/day for the CROMA retail warehouse.",
      "highlights": [
        "Designed and developed 20+ ETL pipelines for the CROMA warehouse using Talend and PL/SQL, with detailed error handling and change-request-driven job updates across fact/dimension modeling.",
        "Built fact/dimension models processing 5M+ records/day with automated data-quality checks reducing defect rates by 25%.",
        "Established reusable extraction, validation, and error-handling patterns adopted across 4 warehouse workstreams; cut new pipeline development time by 35% through framework standardization."
      ],
      "metrics": [
        {
          "label": "ETL pipelines built",
          "value": "20+",
          "numeric": 20,
          "suffix": "+"
        },
        {
          "label": "Records processed daily",
          "value": "5M+",
          "numeric": 5,
          "suffix": "M+"
        },
        {
          "label": "Defect rate reduction",
          "value": "25%",
          "numeric": 25,
          "suffix": "%"
        },
        {
          "label": "Pipeline dev time cut",
          "value": "35%",
          "numeric": 35,
          "suffix": "%"
        }
      ],
      "tech": [
        "Talend",
        "PL/SQL",
        "Java",
        "Oracle",
        "Warehouse modeling"
      ]
    }
  ],
  "featuredProjects": [
    {
      "id": "definity-cobol-translation",
      "name": "GenAI COBOL → Cloud Code Translation",
      "client": "Definity",
      "era": "legacy",
      "tagline": "Decades of mainframe business logic, translated to governed cloud pipelines by LLMs",
      "description": "GenAI-powered code-translation pipeline converting Mainframe/COBOL into BigQuery SQL and PySpark, measured by a semantic-fidelity eval harness and deployed inside the customer's GCP VPC behind their IAM. Discovery across 12 legacy workstreams sequenced the migration by risk and value.",
      "before": "12 COBOL/legacy workstreams with decades of business logic locked in mainframe code that no modern team could safely rewrite by hand.",
      "after": "Automated COBOL → BigQuery SQL + PySpark translation with semantic-fidelity evals, audit-ready refactored pipelines, and 5 reusable transformation patterns codified into the platform playbook.",
      "metrics": [
        {
          "label": "Legacy workstreams triaged",
          "value": "12",
          "numeric": 12,
          "suffix": ""
        },
        {
          "label": "Reusable patterns codified",
          "value": "5",
          "numeric": 5,
          "suffix": ""
        }
      ],
      "tech": [
        "Mainframe/COBOL",
        "GenAI Code Translation",
        "BigQuery",
        "PySpark",
        "Pub/Sub",
        "GCP VPC",
        "IAM"
      ],
      "vizType": "translation"
    },
    {
      "id": "schwab-hadoop-teradata-gcp",
      "name": "Multi-Petabyte Hadoop/Teradata → GCP Migration",
      "client": "Charles Schwab",
      "era": "cloud",
      "tagline": "1B+ daily records moved to cloud with zero data loss at a Fortune 500 brokerage",
      "description": "Led a multi-petabyte migration from legacy Hadoop/Teradata to GCP with rewritten PySpark/Talend ETL, standardized CDC patterns, a 30M records/day transactional framework, and metadata-driven IaC deployments — later featured in Free Press Journal for frameworks adopted across 10+ enterprise programs.",
      "before": "Legacy Hadoop/Teradata estate with slow, costly ETL, hand-rolled deployments, and no standardized CDC — 1B+ daily records at risk during any change.",
      "after": "25% faster and more efficient on GCP, $1M+ annual savings, zero data loss on 1B+ daily records, 99.5% SLA on 30M/day transactions, release cycles cut 50% via Terraform IaC.",
      "metrics": [
        {
          "label": "Annual infra savings",
          "value": "$1M+",
          "numeric": 1,
          "suffix": "M+"
        },
        {
          "label": "Daily records, zero loss",
          "value": "1B+",
          "numeric": 1,
          "suffix": "B+"
        },
        {
          "label": "Efficiency improvement",
          "value": "25%",
          "numeric": 25,
          "suffix": "%"
        },
        {
          "label": "Release cycles cut",
          "value": "50%",
          "numeric": 50,
          "suffix": "%"
        }
      ],
      "tech": [
        "GCP",
        "BigQuery",
        "Dataproc",
        "Dataflow",
        "PySpark",
        "Talend",
        "Qlik Replicate",
        "Terraform"
      ],
      "vizType": "migration"
    },
    {
      "id": "hca-hipaa-streaming",
      "name": "HIPAA Real-Time Streaming & GenAI Accelerators",
      "client": "HCA Healthcare",
      "era": "cloud",
      "tagline": "50+ healthcare data sources streaming in real time under full audit governance",
      "description": "Real-time Kafka + Pub/Sub streaming architecture for 50+ healthcare data sources with 100% data accuracy under HIPAA governance, alongside custom GenAI accelerators that automated Talend ETL + SQL → PySpark conversion and a 100+ TB on-prem → GCP migration.",
      "before": "Legacy Talend ETL and 100+ TB of on-prem warehouses; 50+ sources needed real-time integration under strict HIPAA audit constraints.",
      "after": "GenAI accelerators cut delivery timelines 50% and were adopted by 10+ programs; 50+ sources streaming with 100% data accuracy; ETL performance up 30% on GCP.",
      "metrics": [
        {
          "label": "Delivery timelines cut",
          "value": "50%",
          "numeric": 50,
          "suffix": "%"
        },
        {
          "label": "Migrated under HIPAA",
          "value": "100+ TB",
          "numeric": 100,
          "suffix": "+ TB"
        },
        {
          "label": "Sources streamed real-time",
          "value": "50+",
          "numeric": 50,
          "suffix": "+"
        },
        {
          "label": "Data accuracy",
          "value": "100%",
          "numeric": 100,
          "suffix": "%"
        }
      ],
      "tech": [
        "Kafka",
        "Pub/Sub",
        "GCP",
        "PySpark",
        "Talend",
        "GenAI Accelerators",
        "HIPAA",
        "DLP"
      ],
      "vizType": "streaming"
    },
    {
      "id": "nrg-cross-cloud",
      "name": "AWS → GCP Cross-Cloud Migration",
      "client": "NRG Energy",
      "era": "cloud",
      "tagline": "Phased cross-cloud cutover with under 30 minutes of downtime",
      "description": "Directed migration of an AWS data lake (S3 + EMR) to GCP Databricks with cross-cloud ingestion and transformation pipelines, integrating BigQuery and Vertex AI for predictive maintenance models, with FinOps optimization of cross-cloud spend.",
      "before": "AWS data lake siloed from GCP analytics; energy-trading reporting lagged and any cutover risked operational downtime for energy operations.",
      "after": "Phased cutover completed with <30 min downtime; energy-trading reporting latency down 40%; uptime SLA adherence at 99.95% with unified cost analytics.",
      "metrics": [
        {
          "label": "Cutover downtime",
          "value": "<30 min",
          "numeric": 30,
          "suffix": " min"
        },
        {
          "label": "Reporting latency reduction",
          "value": "40%",
          "numeric": 40,
          "suffix": "%"
        },
        {
          "label": "Uptime SLA",
          "value": "99.95%",
          "numeric": 99.95,
          "suffix": "%"
        }
      ],
      "tech": [
        "AWS",
        "GCP",
        "Databricks",
        "Delta Lake",
        "BigQuery",
        "Vertex AI",
        "dbt"
      ],
      "vizType": "crosscloud"
    },
    {
      "id": "wiley-snowflake-bigquery",
      "name": "500+ TiB Snowflake → BigQuery Modernization",
      "client": "John Wiley & Sons",
      "era": "ai",
      "tagline": "GenAI-accelerated schema mapping and SQL translation at half a petabyte scale",
      "description": "Discovery-led modernization of a 500+ TiB Snowflake estate onto BigQuery using a GenAI-accelerated schema-mapping and SQL-translation pipeline, with redesigned dimensional models, SCD2 and CDC standardization, and event-driven Pub/Sub + Dataflow telemetry pipelines.",
      "before": "500+ TiB Snowflake estate with 200+ ETL workflows facing months of manual schema and SQL refactoring, with no tolerance for data loss.",
      "after": "Manual refactoring cut 40% by GenAI tooling; zero data loss across 200+ workflows on Cloud Composer + Dataflow; 99.9% uptime with audit-ready lineage and 3x analyst throughput.",
      "metrics": [
        {
          "label": "Data migrated",
          "value": "500+ TiB",
          "numeric": 500,
          "suffix": "+ TiB"
        },
        {
          "label": "ETL workflows, zero loss",
          "value": "200+",
          "numeric": 200,
          "suffix": "+"
        },
        {
          "label": "Manual refactoring cut",
          "value": "40%",
          "numeric": 40,
          "suffix": "%"
        },
        {
          "label": "Uptime",
          "value": "99.9%",
          "numeric": 99.9,
          "suffix": "%"
        }
      ],
      "tech": [
        "Snowflake",
        "BigQuery",
        "Cloud Composer",
        "Dataflow",
        "Pub/Sub",
        "Vertex AI",
        "Terraform",
        "GitHub Actions"
      ],
      "vizType": "migration"
    },
    {
      "id": "wiley-private-llm-rag",
      "name": "Private LLM Research Assistant & Agent Platform",
      "client": "John Wiley & Sons",
      "era": "ai",
      "tagline": "RAG over 50M+ documents at 95% grounded accuracy, plus agents deflecting 60% of tier-1 tickets",
      "description": "Production RAG over 50M+ enterprise documents (Vertex AI Vector Search + Pinecone, hybrid retrieval + cross-encoder reranking, grounded citations, MCP-based multi-agent orchestration) shipped for CXO reporting — paired with a multi-turn customer service agent with PI-redaction guardrails and A/B routing across GPT-4o / Gemini 1.5 Pro / Claude Sonnet 4, all governed by an LLMOps platform (LangSmith, RAGAS, LLM-as-judge, Langfuse, Arize Phoenix) behind VPC-SC and CMEK.",
      "before": "Analysts manually searched a 50M+ document corpus and tier-1 support ran fully manual — days-long research with no verifiable citations and slow ticket resolution.",
      "after": "95% grounded answer accuracy and 3x analyst productivity at p95 <1.5s; 60% tier-1 ticket deflection at p95 <2s and >4.3/5 CSAT — in-VPC, behind SSO/SAML, with full audit logging.",
      "metrics": [
        {
          "label": "Documents in production RAG",
          "value": "50M+",
          "numeric": 50,
          "suffix": "M+"
        },
        {
          "label": "Grounded answer accuracy",
          "value": "95%",
          "numeric": 95,
          "suffix": "%"
        },
        {
          "label": "Tier-1 ticket deflection",
          "value": "60%",
          "numeric": 60,
          "suffix": "%"
        },
        {
          "label": "Analyst productivity",
          "value": "3x",
          "numeric": 3,
          "suffix": "×"
        },
        {
          "label": "p95 latency (research assistant)",
          "value": "<1.5s",
          "numeric": 1.5,
          "suffix": "s"
        },
        {
          "label": "CSAT",
          "value": ">4.3/5",
          "numeric": 4.3,
          "suffix": "/5"
        }
      ],
      "tech": [
        "Vertex AI Vector Search",
        "Pinecone",
        "LangGraph",
        "LangChain",
        "MCP",
        "GPT-4o",
        "Gemini 1.5 Pro",
        "Claude Sonnet 4",
        "RAGAS",
        "LangSmith",
        "Langfuse",
        "MLflow",
        "Kubernetes",
        "VPC-SC"
      ],
      "vizType": "rag"
    }
  ],
  "headlineMetrics": [
    {
      "label": "Cost savings delivered",
      "value": "$2M+",
      "numeric": 2,
      "prefix": "$",
      "suffix": "M+"
    },
    {
      "label": "Cloud migrations orchestrated",
      "value": "500+ TiB",
      "numeric": 500,
      "prefix": "",
      "suffix": "+ TiB"
    },
    {
      "label": "Events streamed daily",
      "value": "1B+",
      "numeric": 1,
      "prefix": "",
      "suffix": "B+"
    },
    {
      "label": "System uptime",
      "value": "99.9%",
      "numeric": 99.9,
      "prefix": "",
      "suffix": "%"
    },
    {
      "label": "Documents in production RAG",
      "value": "50M+",
      "numeric": 50,
      "prefix": "",
      "suffix": "M+"
    },
    {
      "label": "Grounded RAG accuracy",
      "value": "95%",
      "numeric": 95,
      "prefix": "",
      "suffix": "%"
    },
    {
      "label": "Tier-1 ticket deflection",
      "value": "60%",
      "numeric": 60,
      "prefix": "",
      "suffix": "%"
    },
    {
      "label": "Years across data & AI",
      "value": "11+",
      "numeric": 11,
      "prefix": "",
      "suffix": "+"
    }
  ],
  "certifications": [
    "Google Cloud Professional Data Engineer (GCP PDE)",
    "Talend Data Explorer",
    "Spark Certified Hadoop Developer"
  ],
  "education": [
    "Advanced Certificate, Blockchain & Distributed Ledger Technologies — IIIT Hyderabad, 2019–2020, Hyderabad, India",
    "Bachelor of Technology, Electrical Engineering — Jawaharlal Nehru Technological University, 2015, Hyderabad, India"
  ],
  "story": {
    "chapters": [
      {
        "id": "legacy",
        "title": "Legacy Systems",
        "blurb": "2015–2019 · Mainframe, Teradata, Oracle, and Talend. Built 20+ warehouse ETL pipelines processing 5M+ records/day for the CROMA warehouse, then unified Mainframe, Teradata, and NAS sources into a mortgage-recovery analytics platform — cutting defect rates 25% and pipeline dev time 35% with reusable frameworks. This is where the deep fluency in legacy systems began, the same fluency that later powered AI-driven COBOL translation."
      },
      {
        "id": "cloud",
        "title": "Cloud Modernization",
        "blurb": "2019–2024 · Multi-petabyte Hadoop/Teradata → GCP at Charles Schwab (1B+ daily records, zero data loss, $1M+ annual savings), 100+ TB HIPAA-governed migration and 50+ source real-time streaming at HCA Healthcare, and a <30 min downtime cross-cloud cutover at NRG Energy. $2M+ saved overall, 99.9% uptime at scale, and IaC frameworks adopted across 10+ enterprise programs."
      },
      {
        "id": "ai",
        "title": "Enterprise AI",
        "blurb": "2024–present · GenAI-powered COBOL → cloud translation at Definity, then private LLM platforms at John Wiley & Sons: production RAG over 50M+ documents at 95% grounded accuracy, multi-turn agents deflecting 60% of tier-1 tickets at <2s p95, a 500+ TiB GenAI-accelerated Snowflake → BigQuery migration, and full LLMOps — evals, guardrails, and observability — inside the customer's VPC."
      }
    ]
  }
}
