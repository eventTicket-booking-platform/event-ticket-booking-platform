import { cn } from "@/lib/utils";

function gradientFromValue(value: string) {
  const gradients = [
    "from-amber-200 via-orange-300 to-rose-400 text-black",
    "from-cyan-200 via-sky-300 to-blue-500 text-black",
    "from-emerald-200 via-teal-300 to-cyan-500 text-black",
    "from-fuchsia-200 via-pink-300 to-rose-500 text-black",
    "from-lime-200 via-emerald-300 to-teal-500 text-black",
    "from-violet-200 via-indigo-300 to-blue-500 text-black",
  ];
  const index = Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
}

export function BrandImage({
  category,
  title,
  className,
}: {
  category?: string | null;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br p-6",
        gradientFromValue(`${category ?? ""}-${title}`),
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.18),transparent_40%)]" />
      <div className="relative flex h-full flex-col justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-black/60">EventHub Select</span>
        <div>
          {category ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-black/50">{category}</p> : null}
          <p className="max-w-52 text-2xl font-semibold leading-tight">{title}</p>
        </div>
      </div>
    </div>
  );
}
