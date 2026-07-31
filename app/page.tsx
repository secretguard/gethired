import { CvScreener } from "./components/CvScreener";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 bg-neutral-50 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">GetHired</h1>
        <p className="max-w-md text-neutral-500">
          Upload your CV to see how it stacks up against real cybersecurity job requirements.
        </p>
      </div>
      <CvScreener />
    </main>
  );
}
