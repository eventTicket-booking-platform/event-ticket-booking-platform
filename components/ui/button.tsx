import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const baseStyles =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-white text-black hover:bg-zinc-200",
  secondary: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
  ghost: "text-white/80 hover:text-white",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(baseStyles, variants[variant], className)} {...props} />;
}

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof variants;
};

export function ButtonLink({ href, children, className, variant = "primary" }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(baseStyles, variants[variant], className)}>
      {children}
    </Link>
  );
}
