import { StarIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";

export function ReviewCard({
  name,
  rating,
  comment,
}: {
  name: string;
  rating: number;
  comment: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{name}</h3>
        <div className="flex items-center gap-1 text-white/70">
          <StarIcon className="size-4" />
          <span className="text-sm">{rating.toFixed(1)}</span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-white/62">{comment}</p>
    </Card>
  );
}
