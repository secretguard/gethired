/**
 * Content-shaped loading placeholders — used for waits where the shape of
 * the incoming content is already known (a scenario card, a question list),
 * per the current best-practice split with ScanLoader: skeletons for
 * "this shape is about to appear", ScanLoader for "we are actively
 * analyzing your input" (the CV screen / grading moments the product's
 * scan motif is built around).
 */
export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-shimmer rounded-full bg-[linear-gradient(90deg,rgb(18_24_31_/_0.06)_25%,rgb(18_24_31_/_0.12)_37%,rgb(18_24_31_/_0.06)_63%)] bg-[length:200%_100%] ${className}`}
    />
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-shimmer rounded-xl bg-[linear-gradient(90deg,rgb(18_24_31_/_0.06)_25%,rgb(18_24_31_/_0.12)_37%,rgb(18_24_31_/_0.06)_63%)] bg-[length:200%_100%] ${className}`}
    />
  );
}
