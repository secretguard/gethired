import { ResourceLibraryView } from "../components/ResourceLibraryView";
import { RoleGate } from "../components/RoleGate";

export default function ResourceLibraryPage() {
  return (
    <RoleGate>
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
            Curated, genuinely free — no trials, no paywalls
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Resource Library
          </h1>
          <p className="text-balance text-base text-slate">
            Real free resources for your track — documentation, practice platforms, courses, and cheat sheets,
            filterable by the skill gaps this app checks for.
          </p>
        </div>
        <div className="mt-10 flex w-full justify-center">
          <ResourceLibraryView />
        </div>
      </main>
    </RoleGate>
  );
}
