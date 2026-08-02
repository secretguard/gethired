import { ResourceLibraryView } from "../components/ResourceLibraryView";
import { RoleGate } from "../components/RoleGate";
import { PageHeader } from "../components/ui/PageHeader";

export default function ResourceLibraryPage() {
  return (
    <RoleGate>
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <PageHeader
          eyebrow="Curated, genuinely free — no trials, no paywalls"
          title="Resource Library"
          size="md"
          description="Real free resources for your track — documentation, practice platforms, courses, and cheat sheets, filterable by the skill gaps this app checks for."
        />
        <div className="mt-10 flex w-full justify-center">
          <ResourceLibraryView />
        </div>
      </main>
    </RoleGate>
  );
}
