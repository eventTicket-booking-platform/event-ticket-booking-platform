import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="max-w-xl p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Not Found</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">This event page does not exist.</h1>
        <p className="mt-4 text-sm leading-7 text-white/62">
          Check the URL or return to the event listing to continue browsing available inventory.
        </p>
        <Link
          href="/events"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black"
        >
          Browse Events
        </Link>
      </Card>
    </main>
  );
}
