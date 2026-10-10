"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon, CalendarIcon, HeartIcon, MapPinIcon, SearchIcon, StarIcon, UsersIcon } from "@/components/icons";

export type CategoryExplorerItem = {
  categoryId?: number;
  name: string;
  description?: string;
  eventCount: number;
  events: Array<{
    eventId: number;
    title: string;
    bannerUrl: string | null;
    startDateTime: string;
    location: string;
    startingPrice: string;
    availableTickets: string;
  }>;
};

export function CategoryExplorer({ categories }: { categories: CategoryExplorerItem[] }) {
  const [expandedCategory, setExpandedCategory] = useState(categories[0]?.name ?? "");
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) => category.name.toLowerCase().includes(normalizedQuery));
  }, [categories, query]);

  return (
    <div>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Explore by Category</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/62">
          Discover incredible events across all categories. From music festivals to tech conferences, find your next unforgettable experience.
        </p>
        <label className="relative mx-auto mt-7 block max-w-md">
          <span className="sr-only">Search categories</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories..."
            className="h-11 w-full rounded-lg border border-white/10 bg-[color:var(--card)] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-white/30"
          />
        </label>
      </div>

      <div className="mt-14 grid gap-5">
        {filteredCategories.map((category, index) => {
          const isExpanded = expandedCategory === category.name;
          const CategoryIcon = getCategoryIcon(index);

          return (
            <article
              key={category.name}
              className={`overflow-hidden rounded-xl border transition ${getCategoryRowStyle(index)} ${
                isExpanded ? "shadow-[0_24px_90px_rgba(0,0,0,0.35)]" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedCategory(isExpanded ? "" : category.name)}
                className="group flex w-full items-center justify-between gap-5 p-5 text-left transition hover:brightness-110"
                aria-expanded={isExpanded}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-black/25 text-white ring-1 ring-white/10">
                    <CategoryIcon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white">{category.name}</h2>
                    <p className="mt-1 line-clamp-1 text-sm text-white/70">
                      {category.description || "Discover upcoming events in this category."}
                    </p>
                    <p className="mt-2 text-xs text-white/58">
                      {category.eventCount} {category.eventCount === 1 ? "upcoming event" : "upcoming events"}
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className={`size-5 shrink-0 text-white/80 transition ${isExpanded ? "rotate-90" : "group-hover:translate-x-1"}`} />
              </button>

              {isExpanded ? (
                <div className="border-t border-white/10 bg-black/20 p-5 sm:p-7">
                  {category.events.length ? (
                    <>
                      <div className="grid gap-6 lg:grid-cols-3">
                        {category.events.map((event) => (
                          <Link
                            key={event.eventId}
                            href={`/event/${event.eventId}`}
                            className="overflow-hidden rounded-xl border border-white/10 bg-black/25 transition hover:-translate-y-1 hover:border-white/25"
                          >
                            <div className="relative h-40 overflow-hidden bg-white/5">
                              {event.bannerUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={event.bannerUrl} alt={event.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] text-sm text-white/45">
                                  No banner uploaded
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 h-18 bg-gradient-to-t from-black to-transparent" />
                            </div>
                            <div className="p-4">
                              <h3 className="line-clamp-1 text-base font-bold text-white">{event.title}</h3>
                              <div className="mt-4 space-y-2 text-sm text-white/72">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="size-4 text-white/55" />
                                  <span>{event.startDateTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPinIcon className="size-4 text-white/55" />
                                  <span>{event.location}</span>
                                </div>
                              </div>
                              <div className="mt-4 border-t border-white/10 pt-4">
                                <div className="flex items-end justify-between gap-4">
                                  <div>
                                    <p className="text-lg font-bold text-white">{event.startingPrice}</p>
                                    <p className="mt-1 text-xs text-white/55">{event.availableTickets}</p>
                                  </div>
                                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                                    <StarIcon className="size-4 text-yellow-400" />
                                    Available
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={category.categoryId ? `/events?category=${category.categoryId}` : `/events?search=${encodeURIComponent(category.name)}`}
                        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold !text-black transition hover:bg-zinc-200"
                      >
                        View All {category.name}
                        <ArrowRightIcon className="ml-3 size-4 !text-black" />
                      </Link>
                    </>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-black/25 p-6 text-center">
                      <p className="text-sm text-white/65">No available events were found for this category.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function getCategoryIcon(index: number) {
  return [HeartIcon, CalendarIcon, StarIcon, UsersIcon, ArrowRightIcon, SearchIcon][index % 6];
}

function getCategoryRowStyle(index: number) {
  return [
    "border-fuchsia-500/25 bg-gradient-to-r from-fuchsia-950/75 to-pink-950/35",
    "border-orange-500/25 bg-gradient-to-r from-orange-950/75 to-red-950/35",
    "border-sky-500/25 bg-gradient-to-r from-sky-950/75 to-cyan-950/35",
    "border-emerald-500/25 bg-gradient-to-r from-emerald-950/75 to-green-950/35",
    "border-amber-500/25 bg-gradient-to-r from-amber-950/75 to-yellow-950/35",
    "border-violet-500/25 bg-gradient-to-r from-violet-950/75 to-purple-950/35",
  ][index % 6];
}
