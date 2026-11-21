// Temporary foundation page. Replaced by the full home page in P1.
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#b8925a]">
        Wedding Planning Platform
      </p>
      <h1 className="font-serif text-5xl font-semibold sm:text-6xl">Wedora</h1>
      <p className="max-w-md text-base text-foreground/70">
        Discover trusted wedding vendors and request bookings for your big day.
      </p>
    </main>
  );
}
