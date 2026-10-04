/**
 * All site copy lives here — edit content, not components.
 * The email uses the reserved `.example` domain; replace it before deploying.
 */

export const site = {
  name: "logic",
  title: "logic — Intelligence, structured.",
  description:
    "logic is a three-person team building intelligent software end to end — the model, the system around it, and the interface people touch.",
  email: "hello@logic.example",
} as const;

export const hero = {
  eyebrow: "Applied intelligence · Team of three",
  title: ["Intelligence,", "structured."],
  intro:
    "We are a three-person team building intelligent software end to end — the model, the system around it, and the interface people actually touch.",
  facts: [
    { label: "Members", value: "03" },
    { label: "Layers", value: "Model · System · Interface" },
    { label: "Method", value: "First principles" },
    { label: "Since", value: "2026" },
  ],
} as const;

export const sections = {
  team: {
    id: "team",
    index: "01",
    label: "Team",
    title: "Three nodes, fully connected.",
    description:
      "Each of us owns one layer of the stack and reviews the other two. Nothing ships until it makes sense to all three.",
  },
  method: {
    id: "method",
    index: "02",
    label: "Method",
    title: "Four axioms we design against.",
    description:
      "Not values for a wall — constraints we hold every decision to, from the first sketch to the last commit.",
  },
  contact: {
    id: "contact",
    index: "03",
    label: "Contact",
    title: "Have a hard problem? Let’s reason through it.",
    description:
      "We take on a small number of projects at a time. Tell us what you’re building and where it’s stuck.",
  },
} as const;

export const nav = Object.values(sections).map(({ id, index, label }) => ({
  href: `#${id}`,
  index,
  label,
}));

export const principles = [
  {
    title: "First principles",
    body: "Reduce the problem to what is known to be true, then build up from there.",
  },
  {
    title: "Systems over features",
    body: "Every decision is judged by how it composes with everything around it.",
  },
  {
    title: "Clarity is a feature",
    body: "If it can’t be explained simply, it isn’t finished yet.",
  },
  {
    title: "Measure, then decide",
    body: "Opinions are hypotheses. We run the experiment and let the result argue.",
  },
] as const;
