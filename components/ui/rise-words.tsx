import { Fragment, type CSSProperties } from "react";

type RiseWordsProps = {
  text: string;
  /** Entrance step of the first word; each word after it follows 40ms later. */
  step?: number;
  className?: string;
};

/**
 * Words that rise one after another from behind their own line.
 * Split for motion only, so it's hidden from assistive tech:
 * give the parent the full text as its aria-label.
 */
export function RiseWords({ text, step = 0, className }: RiseWordsProps) {
  return (
    <span aria-hidden="true" className={className}>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="rise-mask">
            <span
              className="enter-rise inline-block"
              style={{ "--enter-step": step, "--enter-offset": `${i * 40}ms` } as CSSProperties}
            >
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}
