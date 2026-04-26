import { EventCard } from "@/components/event-card";
import { FilterPanel } from "@/components/filter-panel";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { CategoriesResponse, EventsResponse } from "@/lib/api/types";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const search = typeof resolved.search === "string" ? resolved.search : undefined;
  const category = typeof resolved.category === "string" && resolved.category !== "all"
    ? Number(resolved.category)
    : undefined;
  const city = typeof resolved.city === "string" ? resolved.city : undefined;

  let eventsResponse: EventsResponse = { dataList: [], dataCount: 0 };
  let categories: CategoriesResponse = [];
  let loadFailed = false;

  try {
    [eventsResponse, categories] = await Promise.all([
      api.events.list({ search, category, city }),
      api.events.categories(),
    ]);
  } catch (error) {
    loadFailed = true;
    console.error("Failed to load events page data", error);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Browse Events"
        title="Find live experiences from the current backend inventory."
        description="This page now reads directly from the gateway-backed event service and uses live category filters."
      />
      <FilterPanel
        search={search ?? ""}
        category={typeof category === "number" ? String(category) : "all"}
        city={city ?? ""}
        categories={categories}
      />
      {loadFailed ? (
        <Card className="p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">Event listings are temporarily unavailable.</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            The page is reachable, but the event service did not return data for this request. Try again in a moment.
          </p>
          <ButtonLink href="/events" variant="secondary" className="mt-6">
            Retry
          </ButtonLink>
        </Card>
      ) : eventsResponse.dataList.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {eventsResponse.dataList.map((event) => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">No events matched your filters.</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Try a broader search term or remove one of the active filters.
          </p>
          <ButtonLink href="/events" variant="secondary" className="mt-6">
            Reset Filters
          </ButtonLink>
        </Card>
      )}
    </main>
  );
}
