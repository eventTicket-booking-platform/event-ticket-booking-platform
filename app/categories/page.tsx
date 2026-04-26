import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { CategoriesResponse } from "@/lib/api/types";

export default async function CategoriesPage() {
  let categories: CategoriesResponse = [];
  let loadFailed = false;

  try {
    categories = await api.events.categories();
  } catch (error) {
    loadFailed = true;
    console.error("Failed to load categories page data", error);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Categories"
        title="Explore the active event categories from the backend."
        description="Categories are loaded from the current event service so admin-side changes show up here automatically."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-3xl font-semibold text-white">{categories.length}</p>
          <p className="mt-2 text-sm text-white/55">Active categories</p>
        </Card>
      </div>
      {loadFailed ? (
        <Card className="p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">Categories are temporarily unavailable.</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            The category service did not return data for this request. Try again in a moment.
          </p>
          <ButtonLink href="/categories" variant="secondary" className="mt-6">
            Retry
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <Card key={category.categoryId} className="p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Category</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{category.name}</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                {category.description || "No description provided for this category."}
              </p>
              <div className="mt-5 flex gap-3">
                <Link href={`/events?category=${category.categoryId}`} className="text-sm font-semibold text-white">
                  View Events
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
