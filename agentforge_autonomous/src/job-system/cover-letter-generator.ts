import type { ResumeVariant } from "./types";

const BASE_INFO = {
  name: "Marcus Daley",
  email: "marcusldaley@gmail.com",
  github: "github.com/GrizzwaldHouse",
};

const EXPERIENCE_BY_VARIANT: Record<ResumeVariant, string[]> = {
  "game-dev": [
    "developing gameplay systems in Unreal Engine 5 with C++ and Blueprint",
    "building modular component architectures for reusable game mechanics",
    "implementing AI behavior trees and custom animation systems",
    "creating developer tools and editor plugins to improve team workflows",
  ],
  "full-stack": [
    "building full-stack web applications with React, Node.js, and TypeScript",
    "implementing real-time features using Server-Sent Events and WebSockets",
    "designing type-safe APIs with robust error handling and validation",
    "deploying scalable applications with focus on performance and security",
  ],
  "ai-ml": [
    "integrating LLM APIs with intelligent fallback strategies and cost optimization",
    "designing multi-agent systems with autonomous task execution",
    "building AI-powered tools with practical focus on deployment and reliability",
    "implementing ML pipelines with feature engineering and model training",
  ],
  "tools": [
    "creating developer productivity tools for Unreal Engine 5 and VSCode",
    "designing intuitive APIs with focus on developer experience",
    "building automation systems with GitHub Actions and serverless architectures",
    "implementing performance monitoring and analytics for development workflows",
  ],
};

const PROJECTS_BY_VARIANT: Record<ResumeVariant, Array<{ name: string; context: string }>> = {
  "game-dev": [
    { name: "DeepCommand", context: "a naval strategy game leveraging my submarine operations experience to create authentic tactical gameplay" },
    { name: "WizardJam 2.0", context: "a magic-based action game with modular spell systems and procedural VFX" },
    { name: "IslandEscape", context: "my Full Sail capstone project featuring open-world survival mechanics and dynamic AI" },
    { name: "StructuredLogging Plugin", context: "a developer productivity tool for UE5 that improved debugging workflows" },
  ],
  "full-stack": [
    { name: "HoneyBadgerVault", context: "a personal knowledge management system with consent-gated AI and event-driven architecture" },
    { name: "Portfolio Website", context: "a Next.js 15 application showcasing modern React Server Components" },
    { name: "Fraud-Guard-Sentinel", context: "a real-time fraud detection system combining React frontend with ML-powered backend" },
  ],
  "ai-ml": [
    { name: "AgentForge", context: "a multi-agent orchestration system with autonomous task execution and real-time observability" },
    { name: "BrightForge", context: "an AI-powered coding assistant with multi-provider LLM integration" },
    { name: "Bob-AICompanion", context: "an automated job search system using serverless LLM automation" },
  ],
  "tools": [
    { name: "StructuredLogging Plugin", context: "a UE5 developer tool with visual log browser and performance profiling" },
    { name: "DeveloperProductivityTracker", context: "a time tracking plugin for UE5 with automatic session tracking" },
    { name: "BrightForge", context: "a VSCode-integrated coding assistant with context-aware suggestions" },
  ],
};

function selectRelevantProjects(variant: ResumeVariant, jobDescription: string, count: number = 2): Array<{ name: string; context: string }> {
  const projects = PROJECTS_BY_VARIANT[variant];
  const lowerDesc = jobDescription.toLowerCase();

  // Score projects by keyword matches
  const scored = projects.map(p => {
    const nameMatches = lowerDesc.includes(p.name.toLowerCase()) ? 10 : 0;
    const contextWords = p.context.toLowerCase().split(" ");
    const contextMatches = contextWords.filter(w => lowerDesc.includes(w)).length;
    return { project: p, score: nameMatches + contextMatches };
  });

  // Sort by score and return top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.project);
}

export function generateCoverLetter(
  company: string,
  role: string,
  jobDescription: string,
  variant: ResumeVariant
): string {
  const experiences = EXPERIENCE_BY_VARIANT[variant];
  const relevantProjects = selectRelevantProjects(variant, jobDescription, 2);

  const intro = `Dear Hiring Manager,

I am writing to express my interest in the ${role} position at ${company}. As a Full Sail University student graduating in February 2026 with a background in Navy submarine operations, I bring a unique combination of systematic problem-solving, technical expertise, and the ability to deliver under pressure.`;

  const experiencePara = `My experience includes ${experiences[0]}, ${experiences[1]}, and ${experiences[2]}. During my time at Full Sail and in personal projects, I have demonstrated the ability to take ownership of complex technical challenges and deliver maintainable, well-architected solutions.`;

  const projectsPara = `Notable projects include ${relevantProjects[0].name}, ${relevantProjects[0].context}, and ${relevantProjects[1].name}, ${relevantProjects[1].context}. These projects showcase my ability to work across the full development lifecycle, from initial architecture through deployment and maintenance.`;

  const whyCompany = `I am particularly drawn to ${company} because of your commitment to technical excellence and innovation. The ${role} position aligns perfectly with my background and career goals, and I am excited about the opportunity to contribute to your team while continuing to grow as a developer.`;

  const closing = `Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience can contribute to ${company}'s success. I am available for an interview at your convenience.

Sincerely,
${BASE_INFO.name}
${BASE_INFO.email}
${BASE_INFO.github}`;

  return `${intro}\n\n${experiencePara}\n\n${projectsPara}\n\n${whyCompany}\n\n${closing}`;
}
