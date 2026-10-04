export type Member = {
  id: string;
  name: string;
  /** The layer of the stack this member owns. */
  layer: string;
  role: string;
  bio: string;
  focus: string[];
  links: { label: string; href: string }[];
};

// Bios, focus areas and links are placeholders — replace them with your own.
// The hero network draws one input node per member and is laid out for three.
export const members: Member[] = [
  {
    id: "varun",
    name: "Varun",
    layer: "Model",
    role: "Fullstack engineer",
    bio: "Designs, trains and evaluates the models at the core of our work. Treats every metric with healthy suspicion.",
    focus: ["model design", "evaluation", "retrieval"],
    links: [
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
    ],
  },
  {
    id: "alfiya",
    name: "Alfiya",
    layer: "System",
    role: "Design lead",
    bio: "Builds the infrastructure that keeps models fast, observable and uneventful to run. Prefers fewer, sharper moving parts.",
    focus: ["distributed systems", "data pipelines", "observability"],
    links: [
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
    ],
  },
  {
    id: "palak",
    name: "Palak",
    layer: "Interface",
    role: "Design engineer",
    bio: "Turns complex systems into interfaces that feel obvious. Sweats the details most people never consciously notice.",
    focus: ["interaction design", "frontend", "design systems"],
    links: [
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
    ],
  },
];
