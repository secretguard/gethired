export function SiteFooter() {
  return (
    <footer className="w-full border-t border-slate/10 px-4 py-6 text-center sm:px-6">
      <p className="text-xs text-slate/70">
        Built by{" "}
        <a
          href="https://www.sarathg.me"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-beacon underline decoration-transparent underline-offset-2 transition-all duration-150 ease-standard hover:decoration-beacon"
        >
          Sarath G
        </a>
      </p>
    </footer>
  );
}
