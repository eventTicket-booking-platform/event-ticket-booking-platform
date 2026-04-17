import { CheckIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Tier = {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  available: number;
};

export function TicketTierCard({
  tier,
  quantity,
  onChange,
}: {
  tier: Tier;
  quantity?: number;
  onChange?: (next: number) => void;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {tier.available} left
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/62">{tier.description}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            {tier.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:text-right">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Price</p>
            <p className="mt-1 text-3xl font-semibold text-white">{formatCurrency(tier.price)}</p>
          </div>
          {onChange ? (
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5">
              <button
                type="button"
                aria-label={`Decrease ${tier.name} tickets`}
                onClick={() => onChange(Math.max(0, (quantity ?? 0) - 1))}
                className="px-4 py-3 text-lg text-white/70 transition hover:text-white"
              >
                -
              </button>
              <span className="min-w-12 text-center text-sm font-semibold text-white">{quantity ?? 0}</span>
              <button
                type="button"
                aria-label={`Increase ${tier.name} tickets`}
                onClick={() => onChange(Math.min(tier.available, (quantity ?? 0) + 1))}
                className="px-4 py-3 text-lg text-white/70 transition hover:text-white"
              >
                +
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
