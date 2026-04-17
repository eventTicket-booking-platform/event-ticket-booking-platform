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
    <form className="grid gap-4 rounded-[2rem] border border-white/10 bg-[color:var(--card)] p-5 md:grid-cols-[1.6fr_1fr_1fr_auto]">
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search events"
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
        />
      </label>
      <select
        name="category"
        defaultValue={category}
        className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
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
      <input
        name="city"
        defaultValue={city}
        placeholder="Filter by city"
        className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35"
      />
      <button className="h-12 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200">
        Apply
      </button>
    </form>
  );
}
