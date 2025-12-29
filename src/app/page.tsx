export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
        DevSwiss
      </h1>
      <p className="text-muted-foreground text-center max-w-[600px]">
        Your personal developer utility belt. Press <kbd className="bg-muted px-2 py-0.5 rounded border">⌘K</kbd> to start.
      </p>
    </div>
  );
}
