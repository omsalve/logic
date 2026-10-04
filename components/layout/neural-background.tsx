"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import styles from "./neural-background.module.css";
import {
  HEIGHT,
  OUTPUT,
  REST,
  STEER,
  WIDTH,
  berth,
  edges,
  floorOpacity,
  floorPaths,
  layers,
  pose,
  projector,
  round,
  routes,
  shade,
  signalPath,
  toPath,
  type Point,
  type Route,
} from "./neural-scene";

/** Clicks the page fires as signals, round-robin over this many. */
const SPARKS = 4;

/** Clicks on these belong to the page, not the network. */
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role='button'], [contenteditable='true']";

/** How close the cursor must come, in stage units, before a node lights. */
const REACH = 64;

/** Scrolling turns the network this many radians per pixel. */
const SCROLL_SPIN = 0.0008;

/**
 * How much scrolling a crossing takes, as a fraction of the screen's height,
 * centred on the moment the next section's top passes mid-screen.
 */
const CROSSING = 0.6;

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/** Positions an HTML element over the SVG at a point in user units (1cqw = 4.8 units). */
const at = ({ x, y }: Pick<Point, "x" | "y">) =>
  ({ "--x": `${round((x / WIDTH) * 100)}cqw`, "--y": `${round((y / WIDTH) * 100)}cqw` }) as CSSProperties;

/** Sizes and shades a node for its distance from the camera. */
const depth = ({ scale }: Point) => ({ "--depth": scale, "--shade": shade(scale) }) as CSSProperties;

const route = (index: number) => ({ "--route": index }) as CSSProperties;

/** Writes attributes and inline custom properties, skipping any that haven't changed. */
function writer() {
  const written = new WeakMap<Element, Map<string, string>>();
  return (element: Element, values: Record<string, string | number>) => {
    let cache = written.get(element);
    if (!cache) written.set(element, (cache = new Map()));
    for (const [name, raw] of Object.entries(values)) {
      const value = String(raw);
      if (cache.get(name) === value) continue;
      cache.set(name, value);
      if (name.startsWith("--") || name === "z-index") {
        (element as HTMLElement | SVGElement).style.setProperty(name, value);
      } else {
        element.setAttribute(name, value);
      }
    }
  };
}

type NeuralBackgroundProps = {
  /** One label per input node — the members' initials. */
  labels: string[];
};

/**
 * The team as a network — three inputs, one output — turning slowly in 3D
 * behind the whole page. It draws itself on load and fires one route every 3s.
 * The cursor steers the camera and lights the nodes it nears; a click on the
 * page fires a signal from the nearest input, through the nearest hidden node,
 * to the output. Scrolling turns the network, and from lg carries it to the
 * open half beside each section (marked [data-side]): between sections it pulls
 * back and swings round, so it lands on the far side as its mirror image.
 *
 * The stylesheet stays the clock: it animates --neural-spin on an empty clock and
 * --neural-progress on each signal, and every frame this component reads them
 * back and reprojects the scene.
 */
export function NeuralBackground({ labels }: NeuralBackgroundProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const select = <T extends Element>(name: string) =>
      Array.from(stage.querySelectorAll<T>(`[data-${name}]`));

    const floorRings = select<SVGPathElement>("floor");
    const edgePaths = select<SVGPathElement>("edge");
    const hiddenNodes = select<SVGCircleElement>("hidden");
    const inputNodes = select<HTMLElement>("input");
    const [clock] = select<HTMLElement>("clock");
    const [outputNode] = select<HTMLElement>("output");
    const [logicLabel, ...layerLabels] = select<HTMLElement>("label");
    // Ambient routes first, then the sparks clicks fire.
    const signals = select<SVGGElement>("signal");
    const passes = select<SVGGElement>("pass");
    const charges = select<HTMLElement>("charge");
    const bursts = select<HTMLElement>("burst");

    const write = writer();
    const clockStyle = getComputedStyle(clock);
    const signalStyles = signals.map((signal) => getComputedStyle(signal));
    const passStyles = passes.map((pass) => getComputedStyle(pass));
    const chargeStyles = charges.map((charge) => getComputedStyle(charge));
    const read = (style: CSSStyleDeclaration, name: string) =>
      parseFloat(style.getPropertyValue(name)) || 0;
    const lit = (style: CSSStyleDeclaration) => parseFloat(style.opacity) > 0;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const signalRoutes: Route[] = [...routes, ...Array.from({ length: SPARKS }, () => routes[0])];
    let nextSpark = 0;

    // Input sets targets; the view eases toward them.
    const target = { x: 0, y: 0, scroll: window.scrollY };
    const eased = { ...target };
    const near = new Array<number>(OUTPUT + 1).fill(0);
    let client: { x: number; y: number } | null = null;
    let latest = pose(projector(REST));
    let camera = "";

    /** Client coordinates to stage units. The stage moves, so callers pass its current box. */
    const toStage = ({ x, y }: { x: number; y: number }, box: DOMRect) => ({
      x: ((x - box.left) / box.width) * WIDTH,
      y: ((y - box.top) / box.height) * HEIGHT,
    });

    // Where each section begins on the page, and the berth it wants: content on
    // the start side sends the network to the end berth (0), and vice versa.
    let berths: { top: number; u: number }[] = [];

    /** The berth for a scroll position, crossing as each section's top passes mid-screen. */
    const berthAt = (scroll: number) => {
      const focus = scroll + window.innerHeight / 2;
      const span = window.innerHeight * CROSSING;
      return berths.reduce(
        (u, { top, u: next }, k) => (k === 0 ? next : u + (next - u) * smoothstep((focus - top) / span + 0.5)),
        0,
      );
    };

    const paint = (blend: number) => {
      // Read the stylesheet's clock before writing anything, so style is computed once a frame.
      const turns = read(clockStyle, "--neural-spin");
      const progress = signalStyles.map((style) => read(style, "--neural-progress"));
      // Flashes and charges are only placed while they show.
      const passing = passStyles.map(lit);
      const charging = chargeStyles.map(lit);
      const pointer = client && toStage(client, stage.getBoundingClientRect());

      // Without motion the network keeps to its berth and changes sides in one step.
      const live = motion.matches;
      const u = live ? berthAt(eased.scroll) : Math.round(berthAt(eased.scroll));
      const { yaw, center, zoom, dip } = berth(u);
      const recede = Math.min(1, eased.scroll / (window.innerHeight * 0.8));
      const view = {
        spin: turns * Math.PI * 2 + (live ? eased.scroll * SCROLL_SPIN : 0),
        // Steering mirrors with the berth, so the network always turns toward the cursor.
        yaw: yaw - eased.x * STEER.yaw * (1 - 2 * u),
        pitch: REST.pitch + eased.y * STEER.pitch + (live ? recede * STEER.rise : 0),
        zoom,
        center,
      };
      const project = projector(view);
      const { points, inputPoints, hiddenPoints, outputPoint, stack } = (latest = pose(project));

      write(stage, { "--recede": round(recede), "--u": u.toFixed(4), "--dip": round(dip) });

      // The floor never turns, so it only moves with the camera.
      const key = `${view.yaw.toFixed(4)} ${view.pitch.toFixed(4)} ${u.toFixed(4)}`;
      if (key !== camera) {
        camera = key;
        floorPaths(projector({ ...view, spin: 0 }), u).forEach((d, ring) => write(floorRings[ring], { d }));
      }

      // Nodes near the cursor light, easing in and out.
      points.forEach(({ x, y }, n) => {
        const reach = pointer ? Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / REACH) : 0;
        near[n] += (reach - near[n]) * blend;
      });
      const glow = (n: number) => round(near[n]);

      edges.forEach(({ from, to }, k) => {
        write(edgePaths[k], {
          d: toPath(points[from], points[to]),
          "stroke-opacity": shade((points[from].scale + points[to].scale) / 2),
          "--glow": round(Math.max(near[from], near[to])),
        });
      });

      hiddenPoints.forEach(({ x, y, scale }, j) => {
        const n = inputPoints.length + j;
        write(hiddenNodes[j], {
          cx: x,
          cy: y,
          r: round((4 + near[n] * 1.5) * scale),
          "stroke-opacity": shade(scale),
          "--near": glow(n),
        });
      });

      // Nearer inputs stack above farther ones; each charge sits just above its input.
      inputPoints.forEach((point, i) => {
        write(inputNodes[i], { ...at(point), ...depth(point), "--near": glow(i), "z-index": stack[i] * 2 + 1 });
      });
      write(outputNode, { ...at(outputPoint), ...depth(outputPoint), "--near": glow(OUTPUT) });

      layers.forEach(({ x }, k) => write(layerLabels[k], { ...at({ x: project([x, 0, 0]).x, y: 22 }) }));
      write(logicLabel, { ...at({ x: outputPoint.x, y: outputPoint.y + 30 * outputPoint.scale }) });

      signalRoutes.forEach((r, k) => {
        const [i, j] = r;
        const d = signalPath(r, progress[k], project);
        for (const path of signals[k].children) write(path, { d });

        if (passing[k]) {
          const { x, y, scale } = hiddenPoints[j];
          const [ring, core] = passes[k].children;
          write(ring, { cx: x, cy: y, r: round(10 * scale) });
          write(core, { cx: x, cy: y, r: round(4 * scale) });
        }

        if (charging[k]) {
          write(charges[k], { ...at(inputPoints[i]), ...depth(inputPoints[i]), "z-index": stack[i] * 2 + 2 });
        }
      });
    };

    // With motion, a loop runs for as long as the page is shown (the stylesheet
    // spins the network and fires the routes). Without it, the scene is still
    // and only repaints when scrolling dims it.
    let raf = 0;
    let then = 0;

    const tick = (now: number) => {
      const live = motion.matches;
      const blend = live && then ? 1 - Math.exp(-Math.min(now - then, 100) / 180) : 1;
      then = now;
      eased.x += (target.x - eased.x) * blend;
      eased.y += (target.y - eased.y) * blend;
      eased.scroll += (target.scroll - eased.scroll) * blend;
      paint(blend);
      raf = live ? requestAnimationFrame(tick) : 0;
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /** Sends a signal from the input nearest `point`, through the hidden node nearest it. */
    const fire = (point: { x: number; y: number }) => {
      const nearest = (candidates: Point[]) =>
        candidates.reduce(
          (best, { x, y }, n) => {
            const distance = Math.hypot(x - point.x, y - point.y);
            return distance < best.distance ? { n, distance } : best;
          },
          { n: 0, distance: Infinity },
        ).n;

      const k = routes.length + nextSpark;
      signalRoutes[k] = [nearest(latest.inputPoints), nearest(latest.hiddenPoints)];
      // Replays the same keyframes the ambient routes run on.
      for (const element of [signals[k], passes[k], charges[k], bursts[nextSpark]]) {
        for (const animation of element.getAnimations()) {
          animation.currentTime = 0;
          animation.play();
        }
      }
      nextSpark = (nextSpark + 1) % SPARKS;
      request();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      client = { x: event.clientX, y: event.clientY };
      if (motion.matches) {
        target.x = (event.clientX / window.innerWidth) * 2 - 1;
        target.y = (event.clientY / window.innerHeight) * 2 - 1;
      }
      request();
    };

    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      client = null;
      target.x = target.y = 0;
      request();
    };

    const onScroll = () => {
      target.scroll = window.scrollY;
      request();
    };

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.defaultPrevented) return;
      if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return;
      fire(toStage({ x: event.clientX, y: event.clientY }, stage.getBoundingClientRect()));
    };

    const measure = () => {
      berths = Array.from(document.querySelectorAll<HTMLElement>("[data-side]"), (section) => ({
        top: section.getBoundingClientRect().top + window.scrollY,
        u: section.dataset.side === "end" ? 1 : 0,
      }));
      request();
    };

    const onMotionChange = () => {
      target.x = target.y = 0;
      then = 0;
      request();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("resize", measure, { passive: true });
    motion.addEventListener("change", onMotionChange);
    // Sections move as the page reflows (fonts landing, a resize), so re-measure with it.
    const reflow = new ResizeObserver(measure);
    reflow.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", measure);
      reflow.disconnect();
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  // The resting frame; the effect takes over from here.
  const project = projector(REST);
  const { points, inputPoints, hiddenPoints, outputPoint, stack } = pose(project);
  const sparks = Array.from({ length: SPARKS }, (_, s) => s);
  const signalRoutes = [...routes, ...sparks.map(() => routes[0])];
  const isSpark = (k: number) => k >= routes.length;

  return (
    <div aria-hidden="true" className={styles.background}>
      <div ref={stageRef} className={styles.stage}>
        <span className={styles.clock} data-clock />
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={cn(styles.layer, styles.floor)}>
          {floorPaths(projector({ ...REST, spin: 0 })).map((d, ring) => (
            <path key={ring} d={d} strokeOpacity={floorOpacity[ring]} data-floor />
          ))}
        </svg>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.layer}>
          <g className={styles.edges}>
            {edges.map(({ from, to, layer }, k) => (
              <path
                key={k}
                d={toPath(points[from], points[to])}
                pathLength={1}
                strokeOpacity={shade((points[from].scale + points[to].scale) / 2)}
                data-edge
                data-layer={layer}
              />
            ))}
          </g>
          <g>
            {signalRoutes.map((_, k) => (
              <g
                key={k}
                className={isSpark(k) ? styles.sparkSignal : styles.signal}
                style={route(k)}
                data-signal
              >
                <path className={styles.halo} />
                <path className={styles.core} />
              </g>
            ))}
          </g>
          <g className={styles.hidden}>
            {hiddenPoints.map(({ x, y, scale }, j) => (
              <circle key={j} cx={x} cy={y} r={round(4 * scale)} strokeOpacity={shade(scale)} data-hidden />
            ))}
          </g>
          {signalRoutes.map(([, j], k) => {
            const { x, y, scale } = hiddenPoints[j];
            return (
              <g key={k} className={isSpark(k) ? styles.sparkPass : styles.pass} style={route(k)} data-pass>
                <circle cx={x} cy={y} r={round(10 * scale)} />
                <circle cx={x} cy={y} r={round(4 * scale)} />
              </g>
            );
          })}
        </svg>

        {inputPoints.map((point, i) => (
          <span
            key={i}
            className={cn(styles.placed, styles.input)}
            style={{ ...at(point), ...depth(point), zIndex: stack[i] * 2 + 1 }}
            data-input
          >
            {labels[i]}
          </span>
        ))}
        {signalRoutes.map(([i], k) => (
          <span
            key={k}
            className={cn(styles.placed, isSpark(k) ? styles.sparkCharge : styles.charge)}
            style={{ ...at(inputPoints[i]), ...depth(inputPoints[i]), ...route(k), zIndex: stack[i] * 2 + 2 }}
            data-charge
          />
        ))}
        <span
          className={cn(styles.placed, styles.output)}
          style={{ ...at(outputPoint), ...depth(outputPoint) }}
          data-output
        >
          {sparks.map((s) => (
            <span key={s} className={styles.burst} data-burst />
          ))}
        </span>

        <span
          className={cn(styles.placed, styles.label, "mono-label text-fg")}
          style={at({ x: outputPoint.x, y: outputPoint.y + 30 * outputPoint.scale })}
          data-label
        >
          logic
        </span>
        {layers.map(({ label, x }) => (
          <span
            key={label}
            className={cn(styles.placed, styles.label, "mono-label text-fg-subtle")}
            style={at({ x: project([x, 0, 0]).x, y: 22 })}
            data-label
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
