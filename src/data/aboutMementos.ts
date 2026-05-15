export interface Memento {
  id: string;
  type: "polaroid" | "certificate" | "postit" | "sticker" | "card" | "badge";
  frameMode?: "raw"; // "raw" = render image directly without card/polaroid wrapper
  title?: string;
  body?: string;
  image?: string;
  alt?: string;
  rotate: number;
  className?: string;
  x: number; // left position (%)
  y: number; // top position (%)
  w: number; // width (%)
  z: number; // z-index
}

export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  r: number;
  z: number;
}

export function getDefaultLayout(): LayoutItem[] {
  return mementos.map((m) => ({
    id: m.id,
    x: m.x,
    y: m.y,
    w: m.w,
    r: m.rotate,
    z: m.z,
  }));
}

export const mementos: Memento[] = [
  // ═══ Top band ═══
  {
    id: "tandy-pc",
    type: "polaroid",
    title: "My First PC",
    body: "Tandy 1000 — the machine that started it all. 7.16 MHz of raw power.",
    image: "/Images/tandy-1000-pic.jpeg",
    alt: "Magazine advertisement for the Tandy 1000 personal computer",
    rotate: -3,
    x: 0,
    y: 8,
    w: 21,
    z: 3,
  },
  {
    id: "shopping-list",
    type: "postit",
    image: "/Images/shopping-list-postit.png",
    alt: "Yellow sticky note with Sharpie handwritten shopping list: COFFEE!!, printer ink, Super Computer, and Take over the world?",
    rotate: 2,
    x: 81.9,
    y: 10.1,
    w: 12,
    z: 4,
    className: "memento--postit-list",
  },
  {
    id: "bsod",
    type: "polaroid",
    title: "My First BSOD",
    body: "Windows 98. Aol. A brand new USB scanner. I still have the screenshot.",
    image: "/Images/Blue_screen_of_death_on_CRT.jpg",
    alt: "Blue screen of death displayed on a CRT monitor showing a Windows error",
    rotate: 3,
    x: 55.5,
    y: 3.2,
    w: 22,
    z: 3,
  },
  {
    id: "best-friend",
    type: "polaroid",
    title: "Me and my best friend",
    body: "My PC. The only one who truly gets me.",
    image: "/Images/me-and-best-friend.png",
    alt: "Polaroid photo of me and my best friend — a workstation",
    rotate: 3,
    x: 1.1,
    y: 53.5,
    w: 18,
    z: 3,
    className: "memento--best-friend",
  },

  // ═══ Middle band ═══
  {
    id: "trek-sticker",
    type: "sticker",
    title: "Treknobabbler",
    body: "You better Trek yourself!",
    image: "/Images/trek-yourself-before-you-wreck-yourself.jpg",
    alt: "Star Trek parody poster reading: You better Trek yourself before you wreck yourself",
    rotate: -4,
    x: 22.2,
    y: 37.2,
    w: 14,
    z: 5,
    className: "memento--sticker-trek",
  },
  {
    id: "sonic-screwdriver",
    type: "card",
    title: "Holy Relic",
    body: "Sonic Screwdriver\nClassification: Lab Artifact\nStatus: Functional (mostly)",
    image: "/Images/sonic-screwdriver-no-background.png",
    alt: "Sonic screwdriver device on a specimen display card with classification details",
    rotate: -2,
    x: 82.8,
    y: 31,
    w: 16,
    z: 3,
    className: "memento--card-sonic",
  },
  {
    id: "lab-safety",
    type: "certificate",
    title: "Lab Safety Training",
    body: "Completed: No. Attempted: Yes.",
    image: "/Images/failed-lab-certificate.png",
    alt: "Failed lab safety training certificate with humorous violations listed",
    rotate: 1,
    x: 40.5,
    y: 34.3,
    w: 30,
    z: 3,
  },
  {
    id: "terror-ted",
    type: "sticker",
    image: "/Images/terror-ted.jpg",
    alt: "Terror Ted sticker with a mischievous teddy bear",
    rotate: -3,
    x: 29.5,
    y: 77.8,
    w: 10,
    z: 4,
    className: "memento--sticker-ted",
  },
  {
    id: "mad-labs-badge",
    type: "badge",
    title: "MAD LABS",
    body: "",
    image: "/Images/mad-labs-id-badge.png",
    alt: "MAD LABS official ID badge with circular emblem",
    rotate: -19,
    x: 65.1,
    y: 49.2,
    w: 13,
    z: 5,
    className: "memento--id-badge",
  },
  {
    id: "dont-panic",
    type: "sticker",
    title: "DON'T PANIC",
    body: "",
    image: "/Images/dont-panic-sticker.png",
    alt: "Don't Panic sticker with humorous warning message",
    rotate: 9,
    x: 6.9,
    y: 80.4,
    w: 14,
    z: 4,
    className: "memento--sticker-dontpanic",
  },

  // ═══ Lower band ═══
  {
    id: "london-jets",
    type: "sticker",
    title: "LONDON JETS",
    body: "Est. 2025",
    image: "/Images/London_Jets.webp",
    alt: "London Jets team patch or logo",
    rotate: -3,
    x: 80,
    y: 77.3,
    w: 12,
    z: 4,
    className: "memento--sticker-jets memento--patch",
  },
  {
    id: "hecklefish",
    type: "sticker",
    image: "/Images/heckle-fish.jpg",
    alt: "Heckle Fish cartoon character sticker",
    rotate: -12,
    x: 6.1,
    y: 38.6,
    w: 9,
    z: 5,
    className: "memento--sticker-fish",
  },
  {
    id: "rimmer-flibbles",
    type: "polaroid",
    title: "Mr. Flibbles is very cross!",
    body: "",
    image: "/Images/rimmer-flibbles.jpg",
    alt: "Polaroid photo of Mr. Flibbles with handwritten caption",
    rotate: 7,
    x: 25.2,
    y: 55.2,
    w: 16,
    z: 3,
    className: "memento--polaroid-flibbles",
  },
  {
    id: "art-bell",
    type: "card",
    title: "Late Night Radio Legend",
    body: 'Art Bell\n"From the desert..."\nCoast to Coast AM',
    image: "/Images/art-bell.webp",
    alt: "Art Bell, legendary late-night radio host of Coast to Coast AM",
    rotate: -2,
    x: 45.8,
    y: 63,
    w: 17,
    z: 3,
    className: "memento--card-artbell",
  },
  {
    id: "wifi-gremlin",
    type: "polaroid",
    frameMode: "raw",
    title: "Wi-Fi Gremlin Caught on Camera",
    body: "Located behind the break room microwave. Relocated to a server closet in Kentucky. The signal has been stable ever since.",
    image: "/Images/network-gremlin-polaroid.png",
    alt: "Photograph of a small gremlin-like creature caught near networking equipment",
    rotate: -8,
    x: 27.7,
    y: 3.1,
    w: 20,
    z: 3,
  },
];
