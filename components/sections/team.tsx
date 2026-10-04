import type { CSSProperties } from "react";
import { Grid, GridItem } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { sections } from "@/content/site";
import { members } from "@/content/team";
import { cn } from "@/lib/utils";
import { MemberCard } from "./member-card";
import styles from "./team.module.css";

export function Team() {
  const { id, index, label, title, description } = sections.team;
  const last = members.length - 1;

  return (
    <Section id={id} index={index} label={label} title={title} description={description} side="end">
      <Grid as="ul" role="list" className="gap-y-(--grid-gap)">
        {members.map((member, i) => (
          <GridItem
            as="li"
            key={member.id}
            data-reveal
            className={styles.link}
            style={{ "--enter-step": i } as CSSProperties}
          >
            <MemberCard member={member} index={i + 1} />
            {i > 0 && <span aria-hidden="true" className={cn(styles.port, styles.in)} />}
            {i < last && <span aria-hidden="true" className={cn(styles.port, styles.out)} />}
          </GridItem>
        ))}
      </Grid>
    </Section>
  );
}
