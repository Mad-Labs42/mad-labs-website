export interface Service {
  id: string;
  name: string;
  shortDescription: string;
  bullets: string[];
  icon: string;
  pricing: string;
  category: string;
}

export const services: Service[] = [
  {
    id: "computer-repair",
    name: "Computer Repair & Tune-Ups",
    shortDescription:
      "Desktop and laptop diagnostics, repairs, and performance optimization for Cincinnati homes and small businesses.",
    bullets: [
      "Full system diagnostics with clear findings and no guesswork",
      "Virus and malware removal with preventive hardening",
      "SSD upgrades, memory expansion, and thermal maintenance",
      "Performance tuning for gaming, office, and creative workflows",
    ],
    icon: "monitor",
    pricing: "Diagnostics start at $45",
    category: "Repair",
  },
  {
    id: "small-business-websites",
    name: "Small Business Websites",
    shortDescription:
      "Custom websites built for Cincinnati small businesses — fast, modern, mobile-friendly, and easy to maintain.",
    bullets: [
      "Simple marketing sites and online presence setup",
      "Contact forms, service pages, and local business basics",
      "Optional AI chatbot setup for common customer questions",
      "Launch support, domain/DNS help, and ongoing website care available",
      "No page builders. No bloated templates. Clean code.",
    ],
    icon: "globe",
    pricing: "Websites start at $1,500",
    category: "Web",
  },
  {
    id: "wifi-network-setup",
    name: "Wi-Fi, Network & Device Setup",
    shortDescription:
      "Reliable home office and small business networking — from Wi-Fi optimization to full device configuration.",
    bullets: [
      "Wi-Fi troubleshooting, optimization, and mesh network setup",
      "Printer, scanner, and peripheral configuration",
      "Router, modem, and extender installation",
      "Smart-home device setup and connection support",
    ],
    icon: "signal",
    pricing: "Wi-Fi help starts at $105",
    category: "Network",
  },
  {
    id: "hardware-upgrades",
    name: "Hardware Upgrades & Custom PCs",
    shortDescription:
      "Upgrade your existing machine or have a custom PC built to your exact specifications.",
    bullets: [
      "RAM, SSD, GPU, and processor upgrades for desktops and laptops",
      "Custom gaming PC builds tailored to your budget and games",
      "Home server and NAS setup for backups and media",
      "Thermal repaste, fan upgrades, and deep cleaning",
    ],
    icon: "chip",
    pricing: "Contact us for quote",
    category: "Hardware",
  },
  {
    id: "security-backup",
    name: "Security & Backup",
    shortDescription:
      "Protect your data and devices with straightforward security audits and reliable backup solutions.",
    bullets: [
      "Full security checkup — passwords, updates, and vulnerable software",
      "Automated backup setup for documents, photos, and important files",
      "Basic cybersecurity hardening for home and small office",
      "Parental controls, monitoring, and safe browsing setup",
    ],
    icon: "shield",
    pricing: "Security checkups start at $95",
    category: "Security",
  },
  {
    id: "ai-agents-local-ai",
    name: "Custom Agents & Local AI Setup",
    shortDescription:
      "Custom AI systems built around your workflow — local-first agents, private model setups, and practical automations.",
    bullets: [
      "Custom AI agents — Hermes, OpenClaw, AgentZero; orchestration, MCP servers, tool ecosystems",
      "Local LLM infrastructure — llama.cpp, Ollama, vLLM; model selection, quantization, GPU/CPU tuning, privacy-focused setup",
      "Vibe coding setup — Claude Code, Cursor, Windsurf; skills authoring, MCP integration, background agent workflows",
      "AI workflow automation — custom integrations, agent pipelines, and tooling tailored to your stack",
    ],
    icon: "bot",
    pricing: "Consultation $95",
    category: "AI",
  },
];
