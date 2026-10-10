import Link from "next/link";
import { ArrowRightIcon, CalendarIcon, MapPinIcon, SearchIcon, UsersIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { CategoriesResponse, CategoryDto, EventDetailDto, EventsResponse, EventSummaryDto } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let eventsResponse: EventsResponse = { dataList: [], dataCount: 0 };
  let categories: CategoriesResponse = [];

  try {
    [eventsResponse, categories] = await Promise.all([api.events.list({ size: 250 }), api.events.categories()]);
  } catch (error) {
    console.error("Failed to load homepage data", error);
  }

  const featuredEvents = eventsResponse.dataList.slice(0, 4);
  const featuredEventCards = await getFeaturedEventCards(featuredEvents);
  const topCategories = getTopEventCategories(eventsResponse.dataList, categories);

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-34">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.15] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Discover & Book
            <br />
            Unforgettable Events
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            Explore thousands of events, from concerts and conferences to food festivals. Find, book, and manage your
            tickets all in one place.
          </p>

          <form
            action="/events"
            className="mt-12 flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-[color:var(--card)] p-1.5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] sm:h-14 sm:flex-row sm:items-center"
          >
            <label className="relative min-h-12 flex-1">
              <span className="sr-only">Search events</span>
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/45" />
              <input
                type="search"
                name="search"
                placeholder="Search for events, artists, or venues..."
                className="h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-4 text-sm text-white outline-none placeholder:text-white/45"
              />
            </label>
            <button className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-black transition hover:bg-zinc-200">
              Search
            </button>
          </form>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <Link
              href="/events"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold !text-black transition hover:bg-zinc-200"
            >
              Browse All Events
              <ArrowRightIcon className="ml-3 size-4 !text-black" />
            </Link>
            <Link href="/dashboard" className="inline-flex h-11 items-center text-sm font-semibold text-white transition hover:text-white/70">
              View My Bookings
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-18 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Explore by Category</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/62">
              Discover incredible events across all categories. From music festivals to tech conferences, find your next unforgettable experience.
            </p>
            <form action="/events" className="mx-auto mt-7 max-w-md">
              <label className="relative block">
                <span className="sr-only">Search categories</span>
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                <input
                  type="search"
                  name="search"
                  placeholder="Search categories..."
                  className="h-11 w-full rounded-lg border border-white/10 bg-[color:var(--card)] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-white/30"
                />
              </label>
            </form>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {topCategories.map((category, index) => (
              <Link
                key={category.name}
                href={category.categoryId ? `/events?category=${category.categoryId}` : `/events?search=${encodeURIComponent(category.name)}`}
                className="group relative flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/35 px-6 py-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 hover:border-blue-400/70 hover:bg-black/50 sm:min-h-44"
              >
                <span className={`absolute inset-x-8 top-0 h-0.5 ${getCategoryCardAccent(index)}`} />
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)] opacity-0 transition group-hover:opacity-100" />
                <span className="relative block max-w-full truncate text-lg font-bold text-white sm:text-xl">{category.name}</span>
                <span className="relative mt-4 block text-sm font-medium text-white/50">
                  {category.eventCount} {category.eventCount === 1 ? "event" : "events"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-18 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Featured Events</h2>
              <p className="mt-4 text-base text-white/70">Check out these trending events happening soon</p>
            </div>
            <Link href="/events" className="mt-2 hidden items-center text-sm font-semibold text-white transition hover:text-white/70 sm:inline-flex">
              View All
              <ArrowRightIcon className="ml-3 size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredEventCards.map((event) => (
              <article
                key={event.eventId}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--card)] shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="relative h-[9.5rem] overflow-hidden bg-white/5">
                  {event.bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.bannerUrl} alt={event.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] text-sm text-white/45">
                      No banner uploaded
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                    {event.categoryName}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-1 text-base font-bold text-white">{event.title}</h3>
                  <div className="mt-4 space-y-2 text-sm text-white/72">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="size-4 text-white/55" />
                      <span>{formatDate(event.startDateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="size-4 text-white/55" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-white/62">Starting from</p>
                        <p className="mt-1 text-xl font-bold text-white">{event.startingPrice}</p>
                      </div>
                      <Link
                        href={`/booking/${event.eventId}`}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold !text-black transition hover:bg-zinc-200"
                      >
                        Book Now
                      </Link>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-xs text-white/58">
                      <UsersIcon className="size-3.5" />
                      {event.availableTickets}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Link href="/events" className="mt-8 inline-flex items-center text-sm font-semibold text-white transition hover:text-white/70 sm:hidden">
            View All
            <ArrowRightIcon className="ml-3 size-4" />
          </Link>
        </div>
      </section>

      <section className="border-y border-white/10 px-4 py-18 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">Why Choose EventHub?</h2>
          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {[
              {
                icon: ArrowRightIcon,
                title: "Wide Selection",
                body: "Browse from thousands of events across multiple categories and locations.",
                iconClassName: "-rotate-45",
              },
              {
                icon: UsersIcon,
                title: "Easy Booking",
                body: "Simple and secure ticket booking process with instant confirmations.",
              },
              {
                icon: CalendarIcon,
                title: "Manage Easily",
                body: "Keep track of all your bookings in one dashboard with instant access to tickets.",
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-xl p-8">
                <item.icon className={`size-8 text-white ${item.iconClassName ?? ""}`} />
                <h3 className="mt-7 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-4 max-w-sm text-base leading-7 text-white/72">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-4 py-22 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to find your next event?</h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            Start exploring thousands of amazing events. Book your tickets today and never miss out.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <Link
              href="/events"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold !text-black transition hover:bg-zinc-200"
            >
              Browse Events Now
            </Link>
            <Link href="/register" className="inline-flex h-10 items-center text-sm font-semibold text-white transition hover:text-white/70">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function getTopEventCategories(events: EventSummaryDto[], categories: CategoryDto[]) {
  const categoriesByName = new Map(categories.map((category) => [normalizeCategoryName(category.name), category]));
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

  return Array.from(counts.values())
    .sort((left, right) => right.eventCount - left.eventCount || left.name.localeCompare(right.name))
    .slice(0, 6);
}

function normalizeCategoryName(name: string) {
  return name.trim().toLowerCase();
}

function getCategoryCardAccent(index: number) {
  return [
    "bg-blue-400/80",
    "bg-cyan-400/70",
    "bg-indigo-400/75",
    "bg-emerald-400/70",
    "bg-amber-400/75",
    "bg-rose-400/70",
  ][index % 6];
}

async function getFeaturedEventCards(events: EventSummaryDto[]) {
  const detailResults = await Promise.allSettled(events.map((event) => api.events.byId(event.eventId)));

  return events.map((event, index) => {
    const detailResult = detailResults[index];
    const detail = detailResult?.status === "fulfilled" ? detailResult.value : undefined;
    const startingPrice = getStartingPrice(detail);
    const availableTickets = getAvailableTickets(detail);

    return {
      eventId: event.eventId,
      title: event.title,
      categoryName: detail?.category.name || event.categoryName,
      bannerUrl: detail?.bannerUrl || event.bannerUrl,
      startDateTime: detail?.startDateTime || event.startDateTime,
      location: detail?.venue.city || event.city || "Location TBA",
      startingPrice: typeof startingPrice === "number" ? formatCurrency(startingPrice) : "TBA",
      availableTickets:
        typeof availableTickets === "number"
          ? `${availableTickets} ${availableTickets === 1 ? "ticket" : "tickets"} available`
          : "Tickets available soon",
    };
  });
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
