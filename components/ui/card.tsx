import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-[color:var(--card)] shadow-[0_20px_80px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
