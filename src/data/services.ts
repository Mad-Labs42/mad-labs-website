export interface Service {
  id: string;
  name: string;
  shortDescription: string;
  bullets: string[];
  icon: string;
}

export const services: Service[] = [
  {
    id: "computer-repair",
    name: "Computer Repair",
    shortDescription:
      "Desktop and laptop repairs using modern diagnostic tools and quality replacement parts.",
    bullets: [
      "Screen and keyboard replacement for all major brands",
      "Data recovery from failed or corrupted drives",
      "SSD upgrades and memory expansion",
      "Thermal paste renewal, fan cleaning, and hardware diagnostics",
    ],
    icon: "💻",
  },
  {
    id: "mobile-it",
    name: "Mobile IT",
    shortDescription:
      "Phone and tablet service for common issues, plus mobile device management for small teams.",
    bullets: [
      "Screen and battery replacement for phones and tablets",
      "Charging port repair and camera module fixes",
      "Data transfer between old and new devices",
      "Mobile device management for business fleets",
    ],
    icon: "📱",
  },
  {
    id: "diagnostics-tuning",
    name: "Diagnostics & Tuning",
    shortDescription:
      "Performance audits, malware removal, and system optimization to extend device life.",
    bullets: [
      "Full system health audit with detailed report",
      "Malware and virus removal with preventive hardening",
      "Operating system reinstallation and driver updates",
      "Performance tuning for gaming, design, and office workflows",
    ],
    icon: "🔧",
  },
  {
    id: "network-setup",
    name: "Network & Setup",
    shortDescription:
      "Home office and small business networking — from WiFi optimization to complete infrastructure setup.",
    bullets: [
      "Home office WiFi optimization and mesh network setup",
      "Printer, scanner, and peripheral configuration",
      "Small business network design and VLAN setup",
      "Secure remote access and VPN configuration",
    ],
    icon: "🌐",
  },
];
