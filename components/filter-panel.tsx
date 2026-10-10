import { SearchIcon } from "@/components/icons";
import type { CategoryDto } from "@/lib/api/types";

export function FilterPanel({
  search,
  category,
  city,
  categories,
}: {
  search: string;
  category: string;
  city: string;
  categories: CategoryDto[];
}) {
  return (
    <form className="rounded-[2rem] border border-white/10 bg-[color:var(--card)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Filters</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Find Events</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">Narrow down listings by search, category, and city.</p>
      </div>

      <div className="mt-6 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">Search</span>
          <span className="relative block">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Event, artist, venue..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-white/30 focus:bg-white/7"
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">Category</span>
          <span className="relative block">
            <select
              name="category"
              defaultValue={category}
              className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/7"
            >
              <option value="all" className="bg-zinc-950 text-white">
                All categories
              </option>
              {categories.map((item) => (
                <option key={item.categoryId} value={item.categoryId} className="bg-zinc-950 text-white">
                  {item.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 size-2.5 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-white/45" />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white/70">City</span>
          <input
            name="city"
            defaultValue={city}
            placeholder="Filter by city"
            className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-white/30 focus:bg-white/7"
          />
        </label>

        <div className="grid gap-3 pt-1">
          <button className="h-12 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200">
            Apply Filters
          </button>
          <a
            href="/events"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Reset
          </a>
        </div>
      </div>
    </form>
  );
}
