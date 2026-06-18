import Image from "next/image";

const highlights = [
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&fit=crop",
    alt: "Luxury home with pool",
    title: "Instant Otis Score",
    subtitle: "Know in seconds if a listing is worth your time.",
    description:
      "Every listing gets a 0-100 score based on price, condition, location, and market trends. No more guessing — just data-backed confidence.",
    badge: { score: 92, label: "Strong Buy" },
    reverse: false,
  },
  {
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&fit=crop",
    alt: "Classic home with green lawn",
    title: "True Cost Calculator",
    subtitle: "The real monthly number, not the fantasy one.",
    description:
      "Beyond the sticker price: mortgage, taxes, insurance, HOA, maintenance, and commute costs rolled into one honest monthly number.",
    badge: { score: 78, label: "Strong Buy" },
    reverse: true,
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&fit=crop",
    alt: "Modern living room interior",
    title: "Red Flag Detection",
    subtitle: "Spot what the listing photos don't show you.",
    description:
      "Otis scans listing history, price drops, days on market, and disclosure patterns to surface the warning signs agents hope you miss.",
    badge: { score: 41, label: "Caution" },
    reverse: false,
  },
];

const moreFeatures = [
  {
    icon: "\u{1F4AC}",
    title: "Chat with Otis",
    description:
      "Ask anything about a listing in plain English. Otis answers with data, not opinions.",
  },
  {
    icon: "\u{1F4CA}",
    title: "Save & Compare",
    description:
      "Pin favorites and view them side-by-side across every metric that matters.",
  },
  {
    icon: "\u{1F91D}",
    title: "Negotiation Tips",
    description:
      "Data-backed talking points to negotiate a better deal every time.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-0">
      {/* Section header */}
      <div className="bg-[var(--bg-page)] px-6 pt-24 pb-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] font-[var(--font-instrument-serif)] animate-fade-in-up">
            Everything Zillow won&apos;t tell you
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto animate-fade-in-up delay-1">
            Built for buyers who want the full picture before making the biggest
            purchase of their life.
          </p>
        </div>
      </div>

      {/* Large alternating image + text rows */}
      {highlights.map((item, i) => (
        <div
          key={item.title}
          className={i % 2 === 0 ? "bg-[var(--bg-page)]" : "bg-[var(--bg-warm)]"}
        >
          <div className={`mx-auto max-w-6xl px-6 py-16 flex flex-col gap-10 items-center ${item.reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
            {/* Image */}
            <div className="w-full lg:w-1/2 animate-fade-in-up delay-2">
              <div className="relative rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] bg-white group shadow-[var(--shadow-md)]">
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={800}
                  height={533}
                  className="w-full h-64 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Score badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-[var(--border)] rounded-full px-3 py-1.5 shadow-[var(--shadow-sm)]">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${item.badge.score >= 70 ? "bg-[var(--success)]" : item.badge.score >= 40 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"}`}>
                    {item.badge.score}
                  </span>
                  <span className={`text-xs font-medium ${item.badge.score >= 70 ? "text-[var(--success)]" : item.badge.score >= 40 ? "text-[var(--warning)]" : "text-[var(--danger)]"}`}>
                    {item.badge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-1/2 animate-fade-in-up delay-3">
              <p className="text-sm font-medium uppercase tracking-wider text-[var(--accent)] mb-2">
                {item.subtitle}
              </p>
              <h3 className="text-3xl font-bold text-[var(--text-primary)] font-[var(--font-instrument-serif)]">
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Bottom feature cards */}
      <div className="bg-[var(--bg-page)] px-6 py-20">
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-6 sm:grid-cols-3">
          {moreFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 card-hover animate-fade-in-up delay-${index + 2}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center text-xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
