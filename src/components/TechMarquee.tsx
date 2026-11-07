const topics = [
  "Android", "Firebase", "Flutter", "Gemini", "Google Cloud", "TensorFlow",
  "Web", "Kotlin", "Angular", "Go", "Maps Platform", "Chrome", "Vertex AI", "Dart",
];
const dots = ["bg-g-blue", "bg-g-red", "bg-g-yellow", "bg-g-green"];

/** Endless scrolling strip of Google technologies. The list is rendered twice so the loop is seamless. */
export function TechMarquee() {
  return (
    <div data-motion className="group relative overflow-hidden border-y border-line bg-surface py-4">
      {/* Static edge fades (cheaper than mask-image over a moving layer). */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent" />
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3 pr-3">
            {topics.map((t, i) => (
              <li key={t} className="flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium">
                <span className={`size-2 rounded-full ${dots[i % 4]}`} />
                {t}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
