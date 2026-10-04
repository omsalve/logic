/**
 * The network behind the page, in world space, and the camera that projects
 * it into the stage's SVG user units. Pure geometry: <NeuralBackground> owns
 * the DOM and decides where the camera looks.
 */

// The stage, in SVG user units. HTML layered over it is placed in the same units.
export const WIDTH = 480;
export const HEIGHT = 360;
const CENTER_Y = 166;

export type Vec3 = readonly [x: number, y: number, z: number];
export type Point = { x: number; y: number; scale: number };

/**
 * How the network is turned (about its flow axis) and how the camera sees it:
 * `zoom` scales the whole picture and `center` is the x it's centred on.
 */
export type View = { spin: number; yaw: number; pitch: number; zoom: number; center: number };

// x runs along the flow, y up, z toward the viewer.
// Each layer is a ring around the flow axis — a triangle, a square, a point.
const LAYER_X = [-170, 0, 170] as const;

const ring = (x: number, radius: number, count: number, phase = 0): Vec3[] =>
  Array.from({ length: count }, (_, i) => {
    const angle = phase + (i / count) * Math.PI * 2;
    return [x, radius * Math.cos(angle), radius * Math.sin(angle)];
  });

const inputs = ring(LAYER_X[0], 80, 3);
const hidden = ring(LAYER_X[1], 120, 4, Math.PI / 4);

/** Every node, in order: inputs, hidden, then the output. */
export const nodes: Vec3[] = [...inputs, ...hidden, [LAYER_X[2], 0, 0]];
export const OUTPUT = nodes.length - 1;
const hiddenNode = (j: number) => inputs.length + j;

export const edges = [
  ...inputs.flatMap((_, i) => hidden.map((_, j) => ({ from: i, to: hiddenNode(j), layer: 1 }))),
  ...hidden.map((_, j) => ({ from: hiddenNode(j), to: OUTPUT, layer: 2 })),
];

export type Route = readonly [input: number, hidden: number];

/**
 * The ambient routes, fired in turn every 3s. Each cuts across the funnel and
 * crosses its hidden node 0.79–0.80s in, so one pass keyframe serves all three.
 * Clicked routes can take any pair; the furthest is off by 30ms.
 */
export const routes: Route[] = [
  [0, 2],
  [1, 3],
  [2, 1],
];

export const layers = [
  { label: "Input", x: LAYER_X[0] },
  { label: "Hidden", x: LAYER_X[1] },
  { label: "Output", x: LAYER_X[2] },
];

const degrees = (n: number) => (n * Math.PI) / 180;

/** Where the camera rests: across the flow from front-left, a little above. */
export const REST: View = { spin: 0, yaw: degrees(30), pitch: degrees(22), zoom: 1, center: 256 };

/** How far the cursor steers the camera, and how far scrolling raises it. */
export const STEER = { yaw: degrees(12), pitch: degrees(7), rise: degrees(10) };

/**
 * The view as the network crosses to the page's other half, `u` going 0 → 1.
 * The camera swings round to the mirror image of REST (yaw 30° → 150°) and the
 * picture re-centres to match, so the output faces outward from either side.
 * Midway the camera looks straight down the flow — triangle, square, point —
 * and the network pulls back, `dip` peaking at 1.
 */
export function berth(u: number) {
  const dip = Math.sin(Math.PI * u);
  return {
    yaw: REST.yaw + (Math.PI - 2 * REST.yaw) * u,
    center: REST.center + (WIDTH - 2 * REST.center) * u,
    zoom: 1 - dip * 0.2,
    dip,
  };
}

const DISTANCE = 900;

/** Rounded, so the server and the client render identical markup. */
export const round = (n: number) => Math.round(n * 100) / 100;

/**
 * A projection for one view: turns a point `spin` radians about the flow axis,
 * then through the camera. Nearer points come back with a larger scale.
 */
export function projector({ spin, yaw, pitch, zoom, center }: View) {
  const [cs, ss] = [Math.cos(spin), Math.sin(spin)];
  const [cy, sy] = [Math.cos(yaw), Math.sin(yaw)];
  const [cp, sp] = [Math.cos(pitch), Math.sin(pitch)];

  return ([x, y, z]: Vec3): Point => {
    const ys = y * cs - z * ss;
    const zs = y * ss + z * cs;
    const xc = x * cy + zs * sy;
    const zy = -x * sy + zs * cy;
    const yc = ys * cp - zy * sp;
    const zc = ys * sp + zy * cp;
    const scale = (DISTANCE / (DISTANCE - zc)) * zoom;
    return { x: round(center + xc * scale), y: round(CENTER_Y - yc * scale), scale: round(scale) };
  };
}

export type Projector = ReturnType<typeof projector>;

/** Depth cue: full strength up front, dimming toward the back of the network. */
export const shade = (scale: number) => round(Math.min(1, Math.max(0.4, (scale - 0.72) / 0.42)));

/** Every node projected, and each input's place in the stack (0 = farthest). */
export function pose(project: Projector) {
  const points = nodes.map(project);
  const inputPoints = points.slice(0, inputs.length);
  const stack = inputPoints.map(({ scale }) => inputPoints.filter((other) => other.scale < scale).length);
  return {
    points,
    inputPoints,
    hiddenPoints: points.slice(inputs.length, OUTPUT),
    outputPoint: points[OUTPUT],
    stack,
  };
}

export const toPath = (...points: Pick<Point, "x" | "y">[]) =>
  points.map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join("");

const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const distance = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * Where a signal is drawn: the stretch of its route between tail and head.
 * Mirrors the 2D figure's dash — 0.08 of the route long, its head running from
 * just before the input (-0.05) to rest against the output (1) as progress goes
 * 0 → 1. Measured along the route in 3D, so it reaches the hidden node at the
 * same moment whichever way the network faces.
 */
export function signalPath([i, j]: Route, progress: number, project: Projector) {
  const head = Math.min(1, progress * 1.05 - 0.05);
  const tail = Math.max(0, head - 0.08);
  if (head <= 0) return "";

  const a = nodes[i];
  const b = nodes[hiddenNode(j)];
  const c = nodes[OUTPUT];
  const knee = distance(a, b) / (distance(a, b) + distance(b, c));
  const along = (t: number) => (t <= knee ? lerp(a, b, t / knee) : lerp(b, c, (t - knee) / (1 - knee)));

  const points = tail < knee && head > knee ? [along(tail), b, along(head)] : [along(tail), along(head)];
  return toPath(...points.map(project));
}

// The floor: a wide disc of 20-unit dots below the network, set back so it
// spreads behind it. Dots are bucketed into rings that fade toward the rim, so
// each ring draws as one path.
const FLOOR = { y: -140, x: 40, z: -120, radius: 420, rings: 5 };

const floorRings: (readonly [x: number, z: number])[][] = Array.from({ length: FLOOR.rings }, () => []);
for (let x = -FLOOR.radius; x <= FLOOR.radius; x += 20) {
  for (let z = -FLOOR.radius; z <= FLOOR.radius; z += 20) {
    const reach = Math.hypot(x, z) / FLOOR.radius;
    if (reach >= 1) continue;
    floorRings[Math.floor(reach * FLOOR.rings)].push([x, z]);
  }
}

export const floorOpacity = floorRings.map((_, ring) => round(1 - ((ring + 0.5) / FLOOR.rings) ** 2));

/**
 * One path per ring; each dot is a zero-length segment with a round cap.
 * The disc's set-back mirrors with the camera's berth (see berth), so it stays
 * behind the network from either side of the page.
 */
export const floorPaths = (project: Projector, u = 0) => {
  const back = FLOOR.z * (1 - 2 * u);
  return floorRings.map((dots) =>
    dots
      .map(([x, z]) => {
        const dot = project([FLOOR.x + x, FLOOR.y, back + z]);
        return `M${dot.x} ${dot.y}h0`;
      })
      .join(""),
  );
};
