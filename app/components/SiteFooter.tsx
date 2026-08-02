import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-slate/10 px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-beacon/25 bg-beacon-soft/60 p-5 text-center shadow-border sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <Image
            src="/website_header_logo.png"
            alt="GetHired"
            width={96}
            height={24}
            className="h-6 w-auto flex-none opacity-90"
          />
          <p className="text-sm text-ink">
            Built by <span className="font-semibold">Sarath G</span>
            <span className="text-slate"> — Cybersecurity Consultant &amp; Trainer</span>
          </p>
        </div>
        <a
          href="https://www.sarathg.me"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-card transition-all duration-150 ease-standard hover:bg-ink/90 hover:shadow-card-hover active:scale-[0.97]"
        >
          Visit sarathg.me
          <span aria-hidden>→</span>
        </a>
      </div>
    </footer>
  );
}
