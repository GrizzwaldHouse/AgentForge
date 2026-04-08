import type { ResumeVariant } from "./types";

export interface ResumeData {
  name: string;
  contact: {
    email: string;
    github: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    organization: string;
    period: string;
    highlights: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    tech: string[];
    highlights: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    period: string;
  }>;
}

const BASE_INFO = {
  name: "Marcus Daley",
  email: "marcusldaley@gmail.com",
  github: "github.com/GrizzwaldHouse",
};

const BASE_EXPERIENCE = [
  {
    title: "Submarine Operations Specialist",
    organization: "United States Navy",
    period: "2012-2021",
    highlights: [
      "9 years of submarine service with focus on systems operations and technical problem-solving",
      "Led technical teams in high-pressure, mission-critical environments",
      "Developed systematic debugging and troubleshooting methodologies",
    ],
  },
];

const BASE_EDUCATION = [
  {
    degree: "Bachelor of Science in Game Development",
    institution: "Full Sail University",
    period: "Expected February 2026",
  },
];

const CORE_SKILLS = ["Unreal Engine 5", "C++", "TypeScript", "React", "Node.js", "Python", "Git", "AI/ML"];

const PROJECTS_BY_VARIANT: Record<ResumeVariant, Array<{
  name: string;
  description: string;
  tech: string[];
  highlights: string[];
}>> = {
  "game-dev": [
    {
      name: "DeepCommand",
      description: "Naval strategy game inspired by submarine operations experience",
      tech: ["Unreal Engine 5", "C++", "Blueprint"],
      highlights: [
        "Real-time tactical gameplay with submarine systems simulation",
        "Custom AI behavior trees for enemy submarines",
        "Mission-critical decision making under pressure mechanics",
      ],
    },
    {
      name: "WizardJam 2.0",
      description: "Magic-based action game developed during game jam",
      tech: ["Unreal Engine 5", "C++", "Blueprint", "Niagara VFX"],
      highlights: [
        "Modular spell system with component-based architecture",
        "Custom animation montage system for spell casting",
        "Procedural VFX generation using Niagara particles",
      ],
    },
    {
      name: "IslandEscape (Capstone)",
      description: "Survival adventure game as Full Sail capstone project",
      tech: ["Unreal Engine 5", "C++", "Blueprint", "Git LFS"],
      highlights: [
        "Open world environment with dynamic weather system",
        "Resource management and crafting mechanics",
        "AI-driven wildlife behavior using behavior trees",
      ],
    },
    {
      name: "StructuredLogging Plugin",
      description: "Developer productivity tool for Unreal Engine 5",
      tech: ["C++", "Unreal Engine 5 Plugin API"],
      highlights: [
        "Structured log output with categorization and filtering",
        "Editor integration with visual log browser",
        "Performance profiling with minimal runtime overhead",
      ],
    },
    {
      name: "DeveloperProductivityTracker Plugin",
      description: "Time tracking and analytics tool for UE5 developers",
      tech: ["C++", "Unreal Engine 5 Plugin API", "JSON"],
      highlights: [
        "Automatic tracking of editor sessions and asset modifications",
        "Visual dashboard with productivity metrics",
        "Export capabilities for project management tools",
      ],
    },
  ],
  "full-stack": [
    {
      name: "HoneyBadgerVault",
      description: "Secure personal knowledge management system with AI integration",
      tech: ["React", "Express", "SQLite", "Node.js", "TypeScript"],
      highlights: [
        "Consent-gated AI with user control over data sharing",
        "Event-driven architecture with SSE for real-time updates",
        "Drizzle ORM with type-safe database operations",
      ],
    },
    {
      name: "Portfolio Website",
      description: "Personal portfolio showcasing projects and technical writing",
      tech: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Netlify"],
      highlights: [
        "Server components with optimized performance",
        "Dynamic project showcase with filtering and search",
        "Integrated blog with MDX support",
      ],
    },
    {
      name: "Fraud-Guard-Sentinel",
      description: "Real-time fraud detection system using machine learning",
      tech: ["React", "Node.js", "Python", "scikit-learn", "PostgreSQL"],
      highlights: [
        "ML pipeline with feature engineering and model training",
        "Real-time transaction scoring with sub-100ms latency",
        "Dashboard for fraud analysts with alert management",
      ],
    },
  ],
  "ai-ml": [
    {
      name: "AgentForge",
      description: "Multi-agent orchestration system with autonomous task execution",
      tech: ["TypeScript", "Node.js", "Next.js", "React", "AI/ML"],
      highlights: [
        "Agent lifecycle management with state persistence",
        "Task queue with priority scheduling and parallel execution",
        "Real-time observability dashboard with event streaming",
      ],
    },
    {
      name: "BrightForge",
      description: "AI-powered coding assistant with context-aware suggestions",
      tech: ["TypeScript", "Node.js", "LLM APIs", "VSCode Extension API"],
      highlights: [
        "Multi-provider LLM integration with fallback chain",
        "Code analysis with AST parsing and pattern detection",
        "Cost optimization with intelligent provider selection",
      ],
    },
    {
      name: "Bob-AICompanion",
      description: "Automated job search and application management system",
      tech: ["Node.js", "TypeScript", "GitHub Actions", "LLM APIs"],
      highlights: [
        "Daily automation with serverless execution",
        "Multi-provider LLM strategy prioritizing free tiers",
        "Discord webhook integration for notifications",
      ],
    },
    {
      name: "Fraud-Guard-Sentinel",
      description: "ML-based fraud detection with real-time scoring",
      tech: ["Python", "scikit-learn", "Node.js", "PostgreSQL"],
      highlights: [
        "Feature engineering pipeline with domain-specific knowledge",
        "Model training with cross-validation and hyperparameter tuning",
        "Production deployment with monitoring and retraining",
      ],
    },
  ],
  "tools": [
    {
      name: "StructuredLogging Plugin",
      description: "Developer productivity tool for Unreal Engine 5",
      tech: ["C++", "Unreal Engine 5 Plugin API"],
      highlights: [
        "Structured log output with categorization and filtering",
        "Editor integration with visual log browser",
        "Performance profiling with minimal runtime overhead",
      ],
    },
    {
      name: "DeveloperProductivityTracker Plugin",
      description: "Time tracking and analytics for UE5 developers",
      tech: ["C++", "Unreal Engine 5 Plugin API", "JSON"],
      highlights: [
        "Automatic tracking of editor sessions and asset modifications",
        "Visual dashboard with productivity metrics",
        "Export capabilities for project management tools",
      ],
    },
    {
      name: "BrightForge",
      description: "AI-powered coding assistant with context-aware suggestions",
      tech: ["TypeScript", "Node.js", "LLM APIs", "VSCode Extension API"],
      highlights: [
        "Multi-provider LLM integration with fallback chain",
        "Code analysis with AST parsing and pattern detection",
        "Cost optimization with intelligent provider selection",
      ],
    },
    {
      name: "AgentForge",
      description: "Multi-agent orchestration system with autonomous task execution",
      tech: ["TypeScript", "Node.js", "Next.js", "React", "AI/ML"],
      highlights: [
        "Agent lifecycle management with state persistence",
        "Task queue with priority scheduling and parallel execution",
        "Real-time observability dashboard with event streaming",
      ],
    },
  ],
};

const SUMMARIES_BY_VARIANT: Record<ResumeVariant, string> = {
  "game-dev": "Full Sail game development student (graduating Feb 2026) with 9 years of Navy submarine experience. Specialized in Unreal Engine 5 development, with expertise in C++ programming, gameplay systems, and AI behavior trees. Proven ability to deliver complex technical projects under pressure, with focus on modular architecture and developer tools.",
  "full-stack": "Full-stack developer with Navy background in systematic problem-solving. Proficient in modern web technologies including React, Node.js, and TypeScript. Experience building scalable web applications with focus on type safety, real-time features, and secure architecture. Strong emphasis on user-centric design and performance optimization.",
  "ai-ml": "AI/ML developer with focus on LLM integration and multi-agent systems. Experienced in building production AI applications with cost optimization and robust fallback strategies. Background in systematic debugging from 9 years of Navy submarine operations. Skilled in Python, TypeScript, and modern ML frameworks with emphasis on practical deployment.",
  "tools": "Developer tools specialist with focus on productivity enhancement and workflow automation. Experienced in building Unreal Engine 5 plugins, VSCode extensions, and CLI tools. Strong emphasis on developer experience, performance optimization, and seamless integration. Background in systematic problem-solving from Navy submarine operations.",
};

function extractKeywords(jobDescription: string): string[] {
  const keywords: string[] = [];
  const lowerDesc = jobDescription.toLowerCase();

  // Common skill keywords
  const skillPatterns = [
    "unreal engine", "unity", "c++", "c#", "python", "typescript", "javascript", "react", "node.js",
    "next.js", "vue", "angular", "git", "docker", "kubernetes", "aws", "azure", "gcp",
    "ai", "ml", "machine learning", "llm", "neural network", "tensorflow", "pytorch",
    "rest api", "graphql", "sql", "nosql", "mongodb", "postgresql", "redis",
    "agile", "scrum", "ci/cd", "devops", "microservices", "serverless",
  ];

  for (const pattern of skillPatterns) {
    if (lowerDesc.includes(pattern)) {
      keywords.push(pattern);
    }
  }

  return keywords;
}

export function generateResume(variant: ResumeVariant, jobDescription?: string): ResumeData {
  let skills = [...CORE_SKILLS];
  let projects = [...PROJECTS_BY_VARIANT[variant]];

  // If job description provided, emphasize matching skills
  if (jobDescription) {
    const keywords = extractKeywords(jobDescription);

    // Add variant-specific skills based on keywords
    if (variant === "game-dev" && keywords.some(k => k.includes("unreal"))) {
      skills.unshift("Blueprint Visual Scripting", "Gameplay Framework");
    }
    if (variant === "full-stack" && keywords.some(k => k.includes("react"))) {
      skills.unshift("Next.js", "React Hooks", "Server Components");
    }
    if (variant === "ai-ml" && keywords.some(k => k.includes("llm") || k.includes("ai"))) {
      skills.unshift("LLM Integration", "Multi-Agent Systems", "Prompt Engineering");
    }
    if (variant === "tools" && keywords.some(k => k.includes("plugin") || k.includes("extension"))) {
      skills.unshift("Plugin Architecture", "API Design", "Developer Experience");
    }

    // Sort projects by keyword matches
    projects.sort((a, b) => {
      const aMatches = keywords.filter(k =>
        a.description.toLowerCase().includes(k) ||
        a.tech.some(t => t.toLowerCase().includes(k))
      ).length;
      const bMatches = keywords.filter(k =>
        b.description.toLowerCase().includes(k) ||
        b.tech.some(t => t.toLowerCase().includes(k))
      ).length;
      return bMatches - aMatches;
    });
  }

  return {
    name: BASE_INFO.name,
    contact: {
      email: BASE_INFO.email,
      github: BASE_INFO.github,
    },
    summary: SUMMARIES_BY_VARIANT[variant],
    skills,
    experience: BASE_EXPERIENCE,
    projects: projects.slice(0, 4), // Top 4 most relevant
    education: BASE_EDUCATION,
  };
}
