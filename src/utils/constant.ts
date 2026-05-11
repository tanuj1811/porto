import {
  FaEnvelope, FaGithub, FaLinkedinIn, FaPhone,
} from "react-icons/fa6";
import {
  FaMusic, FaHeadphones, FaGuitar,
  FaFilm, FaTheaterMasks, FaVideo,
  FaCode, FaChess, FaBookOpen, FaPlane,
} from "react-icons/fa";
import { TbNotes } from "react-icons/tb";
import { FiGithub, FiLinkedin, FiTwitter, FiInstagram } from "react-icons/fi";
import { BsMusicNoteBeamed, BsCameraReelsFill } from "react-icons/bs";
import { IoMusicalNotes } from "react-icons/io5";
import { SiReact, SiTypescript } from "react-icons/si";
import {
  SiNextdotjs, SiVuedotjs, SiJavascript, SiHtml5, SiCss, SiSass,
  SiJquery, SiRedux, SiPython, SiFlask, SiSanic, SiPostgresql, SiElasticsearch,
} from "react-icons/si";
import type { IconType } from "react-icons";
import pathVisualizerImg from "@/assets/imgs/pathVisualizeImg.png";
import damnTechImg from "@/assets/imgs/damnTech.png";
import projectImageNotFound from "@/assets/imgs/projectDefaultImg.png";

// ─── Personal Info ────────────────────────────────────────────────────────────

export const PERSONAL = {
  name: "Tanuj Sharma",
  displayName: "Tanuj",
  email: "tanujsharma1811@gmail.com",
  phone: "+919501802975",
  location: "Bengaluru, India",
  resumePath: "/tanuj_3yoe.pdf",
  letterboxd: "https://boxd.it/hH8J9",
};

// ─── External Links ───────────────────────────────────────────────────────────

export const LINKS = {
  github: "https://github.com/tanuj1811",
  linkedin: "https://www.linkedin.com/in/tanuj1811/",
  twitter: "https://x.com",
  instagram: "https://www.instagram.com",
};

// ─── Nav Sections ─────────────────────────────────────────────────────────────

export const NAV_SECTIONS = [
  { id: "home",       label: "Home"       },
  { id: "about",      label: "About"      },
  { id: "experience", label: "Experience" },
  { id: "projects",   label: "Projects"   },
  { id: "contact",    label: "Contact"    },
];

// ─── Social Icons (side panel) ────────────────────────────────────────────────

export type SocialLink = {
  label: string;
  href: string;
  icon: IconType;
  openInNewTab?: boolean;
};

export const socialLinks: SocialLink[] = [
  { label: "GitHub",   href: LINKS.github,                        icon: FaGithub,     openInNewTab: true  },
  { label: "LinkedIn", href: LINKS.linkedin,                      icon: FaLinkedinIn, openInNewTab: true  },
  { label: "Email",    href: `mailto:${PERSONAL.email}`,          icon: FaEnvelope                        },
  { label: "Phone",    href: `tel:${PERSONAL.phone}`,             icon: FaPhone                           },
  { label: "Resume",   href: PERSONAL.resumePath,                 icon: TbNotes,      openInNewTab: true  },
];

// ─── Contact Socials ──────────────────────────────────────────────────────────

export const contactSocials = [
  { href: LINKS.github,    label: "GitHub",    icon: FiGithub    },
  { href: LINKS.linkedin,  label: "LinkedIn",  icon: FiLinkedin  },
  { href: LINKS.twitter,   label: "Twitter",   icon: FiTwitter   },
  { href: LINKS.instagram, label: "Instagram", icon: FiInstagram },
];

// ─── Career Entries ───────────────────────────────────────────────────────────

export const careerEntries = [
  {
    role: "Software Engineer",
    company: "Stylumia",
    year: "Jan 2023 – Jan 2026",
    desc: "Built real-time AI response experiences for text, graphs, and visuals. Shipped an AI MVP in 13 days that drove 5+ enterprise sign-ups, launched a fashion-designer PWA showcased at NIFT, modernized React 14 to 18 with Docker/Nginx/CI-CD for 80% faster rendering, and implemented OAuth2/OIDC RBAC onboarding for 200+ daily users.",
  },
  {
    role: "Product Engineer",
    company: "Netomi",
    year: "Jan 2026 – Present",
    desc: "Led frontend migration from Webpack to Vite, improving startup speed by 85% and reducing production build time by 70%. Delivered a high-priority feature in 2 weeks by re-architecting 5+ modules, coordinating with 3 cross-functional teams, and resolving 15+ production-critical issues.",
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = [
  {
    name: "Path Visualizer",
    category: "Algorithms",
    tools: "React, SCSS, BFS, DFS, Dijkstra, Maze Patterns",
    description: "Built an interactive pathfinding visualizer that demonstrates graph algorithms through dynamic maze patterns, real-time traversal animations, and engaging visual effects, helping users better understand algorithm behavior and path optimization concepts. ",
    link: "https://github.com/tanuj1811/path-visualizer",
    image: pathVisualizerImg
  },
  {
    name: "Damn Tech",
    category: "Self Learning",
    tools: "md, github",
    description: "Created and maintained a personal learning-focused platform featuring projects and content series such as damn_dsa, damn_css, damn_redis, damn_es, and more, aimed at simplifying complex development concepts and sharing practical technical knowledge with the developer community.",
    link: "https://github.com/tanuj1811/damn_dsa",
    image: damnTechImg,
  },
  {
    name: "cause.co",
    category: "Community ",
    tools: "Spring Boot, ReactJS, MongoDB/MySQL, Firebase, Docker",
    description: "Developed a collaborative web platform that enables users to ask and answer questions across various topics, focusing on scalable backend architecture, seamless frontend interaction, secure authentication, and efficient communication between services to deliver a smooth and reliable user experience. ",
    link: "https://github.com/tanuj1811/cause.com",
    image: projectImageNotFound,
  },
  {
    name: "BigM",
    category: "E-commerce ",
    tools: "HTML, SCSS, Java Enterprise Edition (J2EE)",
    description: "Marketplace for wholesale order of Coca-cola products. Built a seamless B2B ordering platform with real-time inventory sync and automated order processing. ",
    link: "https://github.com/tanuj1811/bigM",
    image: projectImageNotFound,
  },
];

// ─── Tech Stack ───────────────────────────────────────────────────────────────

interface TechItem {
  label: string;
  icon: IconType;
  color: string;
}

export const techStackCategories: { name: string; items: TechItem[] }[] = [
  {
    name: "Frontend",
    items: [
      { label: "React JS",    icon: SiReact,      color: "#61DAFB" },
      { label: "Next JS",     icon: SiNextdotjs,  color: "#ffffff" },
      { label: "Vue JS",      icon: SiVuedotjs,   color: "#4FC08D" },
      { label: "TypeScript",  icon: SiTypescript, color: "#3178C6" },
      { label: "JavaScript",  icon: SiJavascript, color: "#F7DF1E" },
      { label: "HTML5",       icon: SiHtml5,      color: "#E34F26" },
      { label: "CSS3",        icon: SiCss,        color: "#1572B6" },
      { label: "SCSS",        icon: SiSass,       color: "#CC6699" },
      { label: "jQuery",      icon: SiJquery,     color: "#0769AD" },
      { label: "Redux",       icon: SiRedux,      color: "#764ABC" },
      { label: "React Hooks", icon: SiReact,      color: "#00BFFF" },
    ],
  },
  {
    name: "Backend",
    items: [
      { label: "Python", icon: SiPython, color: "#3776AB" },
      { label: "Flask",  icon: SiFlask,  color: "#ffffff" },
      { label: "Sanic",  icon: SiSanic,  color: "#FF8C42" },
    ],
  },
  {
    name: "Database & Search",
    items: [
      { label: "PostgreSQL",    icon: SiPostgresql,    color: "#4169E1" },
      { label: "ElasticSearch", icon: SiElasticsearch, color: "#00BFB3" },
    ],
  },
];

// ─── Floating Icons (Home section decorations) ────────────────────────────────

export interface FIcon {
  Icon: IconType;
  color: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  anim: string;
  delay: number;
}

export const floatingIcons: FIcon[] = [
  // Top strip
  { Icon: BsMusicNoteBeamed, color: "#00BFFF",               size: 26, top: "5%",    left: "18%",   anim: "fi-anim-a", delay: 0.3 },
  { Icon: FaFilm,            color: "#f472b6",               size: 24, top: "4%",    left: "47%",   anim: "fi-bounce", delay: 1.1 },
  { Icon: FaCode,            color: "#4ade80",               size: 28, top: "6%",    right: "20%",  anim: "fi-anim-b", delay: 0.6 },
  // Left edge
  { Icon: FaHeadphones,      color: "#a78bfa",               size: 32, top: "28%",   left: "2%",    anim: "fi-anim-c", delay: 0.9 },
  { Icon: FaGuitar,          color: "#fb923c",               size: 28, top: "52%",   left: "1.5%",  anim: "fi-anim-a", delay: 2.0 },
  { Icon: FaBookOpen,        color: "#60a5fa",               size: 26, top: "74%",   left: "3%",    anim: "fi-anim-b", delay: 1.4 },
  // Right edge
  { Icon: SiReact,           color: "#61DAFB",               size: 30, top: "26%",   right: "1.5%", anim: "fi-spin",   delay: 0.5 },
  { Icon: IoMusicalNotes,    color: "#00BFFF",               size: 26, top: "50%",   right: "2%",   anim: "fi-anim-c", delay: 1.7 },
  { Icon: FaTheaterMasks,    color: "#fbbf24",               size: 28, top: "72%",   right: "2.5%", anim: "fi-anim-a", delay: 0.8 },
  // Bottom strip
  { Icon: FaPlane,           color: "#38bdf8",               size: 26, bottom: "5%", left: "16%",   anim: "fi-anim-b", delay: 1.3 },
  { Icon: BsCameraReelsFill, color: "#f87171",               size: 24, bottom: "4%", left: "50%",   anim: "fi-anim-c", delay: 2.2 },
  { Icon: SiTypescript,      color: "#3178C6",               size: 26, bottom: "5%", right: "16%",  anim: "fi-bounce", delay: 0.4 },
  { Icon: FaVideo,           color: "#c084fc",               size: 22, bottom: "6%", right: "32%",  anim: "fi-anim-a", delay: 1.8 },
  { Icon: FaChess,           color: "rgba(255,255,255,0.45)",size: 24, bottom: "8%", left: "32%",   anim: "fi-anim-b", delay: 2.6 },
  { Icon: FaMusic,           color: "#f472b6",               size: 22, bottom: "6%", left: "32%",   anim: "fi-anim-c", delay: 1.5 },
];

// ─── Gen Z Quotes ─────────────────────────────────────────────────────────────

// export const genZQuotes = [
//   "uk finding yourself is so hard. Many people don't know how to do it correctly",
//   "you have love yourself first",
//   "You can't beg for anything in friendship and love. Those who want to comeback they will",
//   "Attachment hurts more than loneliness sometimes",
//   "We lose people pretending to be strong",
//   "Not everyone you lose is a loss",
//   "Overthinking kills more happiness than reality ever will",
//   "Trust once broken is never the same again",
//   "Har strong insaan ke peeche ek painful story hoti hai",
//   "You can't force someone to stay",
//   "Happiness is rare these days, protect it",
// ];

export const genZQuotes = [
  "Initializing awesomeness… please pretend this is intentional.",
"Calibrating pixels and caffeine levels…",
"Loading portfolio faster than Earth escaping astrophage.",
"Hold tight. The frontend goblins are working.",
"Compiling chaos into creativity…",
"Synchronizing brain cells with the server…",
"Rendering greatness at 60 FPS.",
"Preparing something unnecessarily overengineered…",
"Deploying vibes to production…",
"The loading bar is emotionally trying its best.",
]