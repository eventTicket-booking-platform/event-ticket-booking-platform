import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { ArrowRightIcon, CalendarIcon, CheckIcon, SearchIcon, StarIcon, UsersIcon } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { CategoriesResponse, EventsResponse } from "@/lib/api/types";

const benefits = [
  "Live inventory is sourced from the event service through the gateway",
  "User bookings run against the current booking-service contract",
  "Email login and dashboard flows match the current auth-service APIs",
];

export default async function HomePage() {
  let eventsResponse: EventsResponse = { dataList: [], dataCount: 0 };
  let categories: CategoriesResponse = [];

  try {
    [eventsResponse, categories] = await Promise.all([api.events.list({ size: 4 }), api.events.categories()]);
  } catch (error) {
    console.error("Failed to load homepage data", error);
  }

  const featuredEvents = eventsResponse.dataList.slice(0, 4);
  const featuredCategories = categories.slice(0, 6);

  return (
    <main>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-18 pt-12 sm:px-6 lg:px-8 lg:pt-18">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <Badge>Cloud-native event booking</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Premium ticketing for events people actually plan around.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                Discover live events from the current platform inventory and complete bookings through the gateway-backed flow.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/events" className="!text-black">
                Browse Events
              </ButtonLink>
              <ButtonLink href="/categories" variant="secondary">
                Explore Categories
              </ButtonLink>
            </div>
            <form action="/events" className="rounded-[2rem] border border-white/10 bg-[color:var(--card)] p-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <label className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="search"
                    name="search"
                    placeholder="Search for music, tech, food, and more"
                    className="h-14 w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
                  />
                </label>
                <button className="inline-flex h-14 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-zinc-200">
                  Find Events
                </button>
              </div>
            </form>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: CalendarIcon, value: `${eventsResponse.dataCount}+`, label: "Events available now" },
                { icon: UsersIcon, value: `${featuredCategories.length}`, label: "Live categories" },
                { icon: StarIcon, value: "Gateway", label: "API-connected frontend" },
              ].map((item) => (
                <Card key={item.label} className="p-5">
                  <item.icon className="size-5 text-white/60" />
                  <p className="mt-5 text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-white/52">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>
          <Card className="relative overflow-hidden p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))]" />
            <div className="relative flex h-full flex-col justify-between gap-12">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Live catalog</p>
                <div className="rounded-[2rem] border border-white/10 bg-black/35 p-5">
                  <p className="text-sm text-white/55">Currently featured</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {featuredEvents[0]?.title ?? "Fresh inventory from the event service"}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    Public listings, category browsing, event details, and user bookings all run against the current backend APIs.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 p-4">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-white/70" />
                    <p className="text-sm leading-7 text-white/62">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Categories"
          title="Browse live event categories."
          description="These category cards are loaded from the event service and link directly into the public discovery page."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featuredCategories.map((category) => (
            <Link
              key={category.categoryId}
              href={`/events?category=${category.categoryId}`}
              className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="rounded-[1.5rem] bg-black/60 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Category</p>
                <h3 className="mt-4 text-xl font-semibold text-white">{category.name}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  {category.description || "Explore current events in this category."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Featured Events"
            title="Current public listings from the backend."
            description="The homepage now renders the same event summaries the public event API returns through the gateway."
          />
          <ButtonLink href="/events" variant="secondary" className="w-fit">
            View All Events
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {featuredEvents.map((event) => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Public event discovery",
              body: "Search and category filtering use the public event endpoints rather than local mock objects.",
            },
            {
              title: "Real checkout flow",
              body: "Ticket quantities on the booking page submit directly to the booking service with the authenticated user token.",
            },
            {
              title: "Live user dashboard",
              body: "The dashboard loads profile details and booking history from the current auth and booking service APIs.",
            },
          ].map((item) => (
            <Card key={item.title} className="p-7">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/62">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          <div className="grid gap-8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Ready to book</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Browse live events and complete bookings against the current gateway APIs.
              </h2>
            </div>
            <ButtonLink href="/events" className="w-fit !text-black">
              Browse Now
              <ArrowRightIcon className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </Card>
      </section>
    </main>
  );
}
