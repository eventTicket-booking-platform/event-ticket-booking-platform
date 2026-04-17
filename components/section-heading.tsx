import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-3", align === "center" && "text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">{eyebrow}</p>
      <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}
