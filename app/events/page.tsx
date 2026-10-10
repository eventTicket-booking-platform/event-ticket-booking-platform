import { EventCard } from "@/components/event-card";
import { FilterPanel } from "@/components/filter-panel";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { CategoriesResponse, EventsResponse } from "@/lib/api/types";

export const dynamic = "force-dynamic";

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
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[20rem_1fr] lg:items-start lg:px-8">
      <aside className="lg:sticky lg:top-24">
        <FilterPanel
          search={search ?? ""}
          category={typeof category === "number" ? String(category) : "all"}
          city={city ?? ""}
          categories={categories}
        />
      </aside>
      <section className="min-w-0">
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
      </section>
    </main>
  );
}
