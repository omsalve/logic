# logic

Team showcase site for **logic**, a three-person team. One static page built with Next.js 16 (App Router), React 19 and Tailwind CSS v4.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static production build
npm run lint
```

## Editing content

All copy lives in `content/`. Components never hold text.

- `content/site.ts`: hero, facts strip, section titles, principles, contact email
- `content/team.ts`: members (name, layer, role, bio, focus areas, links)

The names, bios, links and `hello@logic.example` are **placeholders**. Replace them before deploying. The hero network draws one input node per member and is laid out for three.

## Structure

```
app/
  layout.tsx            fonts, metadata, page chrome
  page.tsx              composes the sections
  globals.css           tokens, Tailwind theme, layout utilities, entrance motion
  icon.svg              favicon (the K3 mark)
components/
  layout/               container, grid, grid-overlay, rule, section, site-header, site-nav,
                        site-footer, reveal-observer
  ui/                   node-card, spotlight, button, copy-button, rise-words, tag, logo, icons
  sections/             hero, neural-figure, team, member-card, method, contact
content/                site copy and team data
lib/utils.ts            cn(), pad(), initials()
```

## The grid

The page sits on a 12-column grid (4 columns below `md`). `<GridOverlay>` draws those columns as faint guides behind everything, and the rest of the layout lands on them.

- `<Grid>` (flow): columns separated by gutters. Place children with `<GridItem span={{ lg: 6 }} start={{ lg: 8 }}>`.
- `<Grid variant="ruled">` with `<GridCell>`: cells divided by hairlines. The grid reaches half a gutter past the content edge, so every border sits exactly on a guide line, and cells pad back in so their text stays on the columns.
- `<Rule>`: a full-width hairline with registration marks where it crosses the outer guides. Each `<Section>` closes with one. Pass `flush` when a section ends on a ruled grid, and that grid's bottom edge becomes the rule.

Grid geometry is defined by CSS variables in `globals.css` (`--grid-cols`, `--grid-gap`, `--page-gutter`, `--container`), so the overlay, flow grids and ruled grids always agree.

## Tokens

Raw values live on `:root` in `globals.css` so CSS modules can read them. `@theme` maps them to utilities. The default Tailwind palette is switched off, so only system colours exist:

| Utility                                | Use                                                        |
| -------------------------------------- | ---------------------------------------------------------- |
| `bg-canvas`, `bg-surface`              | page, node fill                                            |
| `text-fg`, `-fg-muted`, `-fg-subtle`   | text: all three pass WCAG AA on the canvas                 |
| `border-line-faint`, `-line`, `-line-strong` | guides, rules and borders, ports                     |
| `signal` (`#00D1FF`)                   | reserved for signal: focus, live state, hover, the network |
| `rounded-node`                         | 6px, every node and control                                |
| `text-display`, `text-title`           | fluid headline sizes                                       |
| `mono-label`                           | JetBrains Mono system labels                               |

## Motion

Tokens live with the rest in `globals.css`: `--curve-out` for anything entering, `--curve-in-out` for anything moving on screen.

**Entrances** play once per visit, staggered 70ms per `enter-step-*` (finer steps via `--enter-offset`):

| Utility        | Motion                                                        |
| -------------- | ------------------------------------------------------------- |
| `enter`        | fades up 10px                                                 |
| `enter-fade`   | fades in place: ruled frames, so their lines never leave the guides |
| `enter-rise`   | rises from behind a `rise-mask` (`<RiseWords>` for headlines) |
| `enter-draw-x` / `enter-draw-y` | wipes in along its length: rules, guides, the label dash |

Above the fold they play on load. Anything inside a `data-reveal` region holds its first frame until `<RevealObserver>` marks the region in view, so each section enters as it's scrolled to.

**On load:** the grid guides draw down the page, then the hero headline rises word by word and the rest follows.

**On scroll:** section titles rise word by word and closing rules draw across the page. The team cards enter in turn, then a signal moves down the chain: each wire draws and the next node's port pings. The network draws itself, then fires one route every 3s. Each input charges, its signal flashes the hidden node it passes, and the output ripples where it lands. These timings are solved from the signal's easing curve, as noted in `neural-figure.module.css`.

**Feedback:** a signal line on the header rule follows the section being read. Cards carry a pointer-following spotlight. The logo makes a third of a turn (K3 lands where it started). Arrows nudge, the email underline wipes in, and the copy check draws itself.

With `prefers-reduced-motion`, everything fades instead of moving, and the signals, spotlight and pings are off. Hover effects only apply on devices with a fine pointer. Keyboard actions (skip link, focus rings) are never animated.
