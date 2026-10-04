import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import styles from "./neural-figure.module.css";

// Geometry in SVG user units. Every node sits on the 20-unit lattice.
const WIDTH = 480;
const HEIGHT = 360;
const LAYER_X = [60, 240, 420] as const;

type Point = { x: number; y: number };

const inputs: Point[] = [100, 180, 260].map((y) => ({ x: LAYER_X[0], y }));
const hidden: Point[] = [60, 140, 220, 300].map((y) => ({ x: LAYER_X[1], y }));
const output: Point = { x: LAYER_X[2], y: 180 };

/**
 * Signal routes as [input, hidden] index pairs; every route ends at the output.
 * Route k fires 3s after route k - 1 (see --route in the stylesheet).
 */
const routes = [
  [0, 2],
  [1, 0],
  [2, 1],
] as const;

const layers = [
  { label: "Input", x: LAYER_X[0] },
  { label: "Hidden", x: LAYER_X[1] },
  { label: "Output", x: LAYER_X[2] },
];

const toPath = (...points: Point[]) =>
  points.map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join("");

/** Positions an HTML element over the SVG at a point in user units. */
const at = ({ x, y }: Point) =>
  ({ "--x": `${(x / WIDTH) * 100}%`, "--y": `${(y / HEIGHT) * 100}%` }) as CSSProperties;

type NeuralFigureProps = {
  /** One label per input node — the members' initials. */
  labels: string[];
};

const route = (index: number) => ({ "--route": index }) as CSSProperties;

/**
 * The team as a network: three inputs, one output.
 * Draws itself once in view, then fires one route every 3s: the input charges,
 * the signal leaves it, lights the hidden node it passes, and lands on the output.
 */
export function NeuralFigure({ labels }: NeuralFigureProps) {
  return (
    <figure data-reveal className={styles.figure}>
      <div aria-hidden="true" className={styles.frame}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={cn(styles.layer, styles.lattice)}>
          <defs>
            <pattern
              id="neural-lattice"
              x="10"
              y="10"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#neural-lattice)" />
        </svg>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.layer}>
          <g className={styles.edges}>
            {inputs.flatMap((from) =>
              hidden.map((to) => (
                <path key={toPath(from, to)} d={toPath(from, to)} pathLength={1} data-layer="1" />
              )),
            )}
            {hidden.map((from) => (
              <path key={toPath(from, output)} d={toPath(from, output)} pathLength={1} data-layer="2" />
            ))}
          </g>
          <g>
            {routes.map(([i, j], k) => {
              const d = toPath(inputs[i], hidden[j], output);
              return (
                <g key={d} className={styles.signal} style={route(k)}>
                  <path d={d} pathLength={1} className={styles.halo} />
                  <path d={d} pathLength={1} className={styles.core} />
                </g>
              );
            })}
          </g>
          <g className={styles.hidden}>
            {hidden.map(({ x, y }) => (
              <circle key={y} cx={x} cy={y} r={4} />
            ))}
          </g>
          {routes.map(([, j], k) => (
            <g key={k} className={styles.pass} style={route(k)}>
              <circle cx={hidden[j].x} cy={hidden[j].y} r={10} />
              <circle cx={hidden[j].x} cy={hidden[j].y} r={4} />
            </g>
          ))}
        </svg>

        {inputs.map((point, i) => (
          <span key={point.y} className={cn(styles.placed, styles.input)} style={at(point)}>
            {labels[i]}
          </span>
        ))}
        {routes.map(([i], k) => (
          <span
            key={k}
            className={cn(styles.placed, styles.charge)}
            style={{ ...at(inputs[i]), ...route(k) }}
          />
        ))}
        <span className={cn(styles.placed, styles.output)} style={at(output)} />

        {layers.map(({ label, x }) => (
          <span
            key={label}
            className={cn(styles.placed, styles.label, "mono-label text-fg-subtle")}
            style={at({ x, y: 22 })}
          >
            {label}
          </span>
        ))}
        <span
          className={cn(styles.placed, styles.label, "mono-label text-fg")}
          style={at({ x: output.x, y: output.y + 30 })}
        >
          logic
        </span>
      </div>

      <figcaption className="mono-label mt-4 flex items-center justify-between gap-4 text-fg-subtle">
        <span>Fig. 01 — Three inputs, one output</span>
        <span aria-hidden="true" className="max-sm:hidden">
          3 → 4 → 1
        </span>
      </figcaption>
    </figure>
  );
}
