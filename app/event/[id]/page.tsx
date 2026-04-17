import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarIcon, MapPinIcon } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { TicketTierCard } from "@/components/ticket-tier-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event;
  try {
    event = await api.events.byId(id);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={event.category.name}
        title={event.title}
        description={event.description}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden p-0">
          {event.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.bannerUrl} alt={event.title} className="h-full min-h-[360px] w-full object-cover" />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center bg-white/5 text-white/45">
              No banner uploaded
            </div>
          )}
        </Card>
        <Card className="p-8">
          <div className="grid gap-4 text-sm text-white/65">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4" />
              <span>{formatDateTime(event.startDateTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4" />
              <span>Ends {formatDateTime(event.endDateTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="size-4" />
              <span>{event.venue.name}, {event.venue.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="size-4" />
              <span>{event.venue.address}</span>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`/booking/${event.eventId}`} className="!text-black">Book Now</ButtonLink>
            <Link href="/events" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
              Back to Events
            </Link>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Ticket tiers</h2>
        {event.ticketTypes.map((tier) => (
          <TicketTierCard
            key={tier.ticketTypeId}
            tier={{
              id: String(tier.ticketTypeId),
              name: tier.name,
              price: tier.price,
              description: `Available quantity: ${tier.totalQuantity}`,
              benefits: [],
              available: tier.totalQuantity,
            }}
          />
        ))}
      </section>
    </main>
  );
}
