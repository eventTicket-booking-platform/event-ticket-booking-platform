import Link from "next/link";
import { CalendarIcon, MapPinIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import type { EventSummaryDto } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils";

export function EventCard({ event }: { event: EventSummaryDto }) {
  return (
    <Card className="overflow-hidden">
      {event.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.bannerUrl} alt={event.title} className="h-56 w-full object-cover" />
      ) : (
        <div className="flex h-56 items-center justify-center bg-white/5 text-sm text-white/45">
          No banner uploaded
        </div>
      )}
      <div className="space-y-5 p-6 pt-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{event.categoryName}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{event.title}</h3>
          </div>
        </div>
        <div className="grid gap-3 text-sm text-white/65">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4" />
            <span>{formatDateTime(event.startDateTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-4" />
            <span>{event.city}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Link href={`/event/${event.eventId}`} className="text-sm font-semibold text-white transition hover:text-white/75">
            View Details
          </Link>
          <Link
            href={`/booking/${event.eventId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold !text-black transition hover:bg-zinc-200"
          >
            Book Now
          </Link>
        </div>
      </div>
    </Card>
  );
}
