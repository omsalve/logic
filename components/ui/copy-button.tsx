"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import styles from "./copy-button.module.css";
import { CheckIcon, CopyIcon } from "./icons";

type CopyButtonProps = {
  value: string;
  /** Accessible name, e.g. "Copy email address". */
  label: string;
};

export function CopyButton({ value, label }: CopyButtonProps) {
  // A timestamp rather than a boolean, so a second click restarts the timer.
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const copied = copiedAt !== null;

  useEffect(() => {
    if (copiedAt === null) return;
    const timeout = window.setTimeout(() => setCopiedAt(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [copiedAt]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedAt(Date.now());
    } catch {
      // Clipboard unavailable or denied: stay idle rather than claim success.
    }
  }

  return (
    <>
      <Button variant="secondary" aria-label={label} data-copied={copied} onClick={copy}>
        <span className={styles.labels}>
          <span className={styles.idle}>
            <CopyIcon />
            Copy
          </span>
          <span className={styles.done}>
            <CheckIcon />
            Copied
          </span>
        </span>
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
