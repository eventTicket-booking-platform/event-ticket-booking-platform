import { CategoryExplorer, type CategoryExplorerItem } from "@/components/category-explorer";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { CategoriesResponse, CategoryDto, EventDetailDto, EventsResponse, EventSummaryDto } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: CategoriesResponse = [];
  let eventsResponse: EventsResponse = { dataList: [], dataCount: 0 };
  let loadFailed = false;

  try {
    [categories, eventsResponse] = await Promise.all([api.events.categories(), api.events.list({ size: 250 })]);
  } catch (error) {
    loadFailed = true;
    console.error("Failed to load categories page data", error);
  }

  const categoryItems = await getCategoryExplorerItems(eventsResponse.dataList, categories);

  return (
    <main className="px-4 py-14 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl">
        {loadFailed ? (
          <Card className="p-10 text-center">
            <h1 className="text-2xl font-semibold text-white">Categories are temporarily unavailable.</h1>
            <p className="mt-4 text-sm leading-7 text-white/62">
              The category service did not return data for this request. Try again in a moment.
            </p>
            <ButtonLink href="/categories" variant="secondary" className="mt-6">
              Retry
            </ButtonLink>
          </Card>
        ) : (
          <CategoryExplorer categories={categoryItems} />
        )}
      </section>
    </main>
  );
}

async function getCategoryExplorerItems(events: EventSummaryDto[], categories: CategoryDto[]): Promise<CategoryExplorerItem[]> {
  const categoriesByName = new Map(categories.map((category) => [normalizeCategoryName(category.name), category]));
  const eventsByCategory = new Map<string, EventSummaryDto[]>();
  const counts = new Map<string, { categoryId?: number; name: string; description?: string; eventCount: number }>();

  for (const event of events) {
    const name = event.categoryName?.trim();

    if (!name) {
      continue;
    }

    const key = normalizeCategoryName(name);
    const category = categoriesByName.get(key);
    const existing = counts.get(key);

    counts.set(key, {
      categoryId: category?.categoryId,
      name: category?.name || name,
      description: category?.description,
      eventCount: (existing?.eventCount || 0) + 1,
    });
    eventsByCategory.set(key, [...(eventsByCategory.get(key) ?? []), event]);
  }

  for (const category of categories) {
    const key = normalizeCategoryName(category.name);

    if (!counts.has(key)) {
      counts.set(key, {
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        eventCount: 0,
      });
    }
  }

  const sortedCategories = Array.from(counts.values()).sort(
    (left, right) => right.eventCount - left.eventCount || left.name.localeCompare(right.name),
  );
  const candidateEvents = sortedCategories.flatMap((category) =>
    (eventsByCategory.get(normalizeCategoryName(category.name)) ?? [])
      .toSorted((left, right) => new Date(left.startDateTime).getTime() - new Date(right.startDateTime).getTime())
      .slice(0, 6),
  );
  const uniqueCandidateEvents = Array.from(new Map(candidateEvents.map((event) => [event.eventId, event])).values());
  const detailResults = await Promise.allSettled(uniqueCandidateEvents.map((event) => api.events.byId(event.eventId)));
  const detailsByEventId = new Map<number, EventDetailDto>();

  detailResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      detailsByEventId.set(uniqueCandidateEvents[index].eventId, result.value);
    }
  });

  return sortedCategories.map((category) => {
    const categoryEvents = eventsByCategory.get(normalizeCategoryName(category.name)) ?? [];
    const eventCards = categoryEvents
      .map((event) => toCategoryEventCard(event, detailsByEventId.get(event.eventId)))
      .toSorted((left, right) => right.availableTicketsValue - left.availableTicketsValue)
      .slice(0, 3)
      .map((event) => ({
        eventId: event.eventId,
        title: event.title,
        bannerUrl: event.bannerUrl,
        startDateTime: event.startDateTime,
        location: event.location,
        startingPrice: event.startingPrice,
        availableTickets: event.availableTickets,
      }));

    return {
      ...category,
      events: eventCards,
    };
  });
}

function toCategoryEventCard(event: EventSummaryDto, detail?: EventDetailDto) {
  const startingPrice = getStartingPrice(detail);
  const availableTickets = getAvailableTickets(detail);

  return {
    eventId: event.eventId,
    title: event.title,
    bannerUrl: detail?.bannerUrl || event.bannerUrl,
    startDateTime: formatDate(detail?.startDateTime || event.startDateTime),
    location: detail?.venue.city || event.city || "Location TBA",
    startingPrice: typeof startingPrice === "number" ? formatCurrency(startingPrice) : "TBA",
    availableTickets:
      typeof availableTickets === "number"
        ? `${availableTickets} ${availableTickets === 1 ? "ticket" : "tickets"} available`
        : "Tickets available soon",
    availableTicketsValue: availableTickets ?? -1,
  };
}

function getStartingPrice(event?: EventDetailDto) {
  const prices = event?.ticketTypes.map((ticketType) => ticketType.price).filter((price) => Number.isFinite(price)) ?? [];

  return prices.length ? Math.min(...prices) : undefined;
}

function getAvailableTickets(event?: EventDetailDto) {
  if (!event?.ticketTypes.length) {
    return undefined;
  }

  return event.ticketTypes.reduce((total, ticketType) => total + ticketType.totalQuantity, 0);
}

function normalizeCategoryName(name: string) {
  return name.trim().toLowerCase();
}
