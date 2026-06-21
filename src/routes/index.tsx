import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { getRobloxGames, type RobloxGameStats } from "@/lib/roblox.functions";

const PLACE_IDS = [
  119317534126469, // ReHaul
  137925884276740, // Build A Plane
  18421734073, // Risky Haul
  90922738116652, // MOVE IT
];

// Add as many videos as you like. Each takes a YouTube video id (the part
// after "watch?v="), a title, and a short description shown beneath it.
const VIDEOS: { id: string; title: string; description: string }[] = [
  {
    id: "_tvy4vC56Es",
    title: "Build, Drive, and Map Gen System Showcase",
    description: "100% custom, 100% done by me. This displays the full flow of building a car to driving through the map.",
  },
  {
    id: "WDoD8I56C7M",
    title: "Flight System",
    description: "A recent commission I did involving custom movement, vector forces, assembly velocities, and some complex math.",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Anticheat deep dive",
    description: "Server authority, replication checks and catching exploiters.",
  },
];

// Add, edit or remove testimonials here. Each one renders as a card.
const TESTIMONIALS: { quote: string; name: string; role: string }[] = [
  {
    quote:
      "Dragon shipped a full vehicle physics system for us in under two weeks. Clean code, zero regressions, and players noticed the difference immediately.",
    name: "Aiden K.",
    role: "Studio Lead, Apex Interactive",
  },
  {
    quote:
      "Our anticheat was a mess until Dragon rebuilt it. Exploits dropped off a cliff and the server load actually went down.",
    name: "Mira S.",
    role: "Founder, Hollowpoint Games",
  },
  {
    quote:
      "Reliable, fast, and genuinely cares about the player experience. He turned a rough prototype into a top-page experience.",
    name: "Theo R.",
    role: "Producer, Northbeam Studio",
  },
];

// The tools/languages shown in the Toolkit section.
const STACK = ["TypeScript", "JavaScript", "HTML", "CSS", "Python", "Luau", "Kotlin"];

const SOCIALS = [
  {
    label: "YouTube",
    handle: "@MrDragonChan",
    url: "https://www.youtube.com/@MrDragonChan",
    icon: YouTubeIcon,
  },
  {
    label: "X / Twitter",
    handle: "@TheDragon_Chan",
    url: "https://x.com/TheDragon_Chan",
    icon: XIcon,
  },
  {
    label: "Discord",
    handle: "_dragonchan",
    url: "https://discord.com/users/_dragonchan",
    icon: DiscordIcon,
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dragon Chan — Roblox Developer" },
      {
        name: "description",
        content:
          "Dragon Chan — fullstack Roblox developer. Live game stats, devlogs and socials.",
      },
    ],
  }),
  component: Portfolio,
});

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      el.classList.add("reveal-visible");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        // Toggle on enter AND leave so the animation replays
        // when scrolling back up or down past the element.
        if (entry.isIntersecting) {
          el.classList.add("reveal-visible");
        } else {
          el.classList.remove("reveal-visible");
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

function useScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
        el.classList.add("reveal-visible");
      });
    }
  }, []);
}

// Cursor-following background highlight.
function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rx = -300, ry = -300, tx = -300, ty = -300, raf = 0;
    const loop = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      el.style.setProperty("--mx", `${rx}px`);
      el.style.setProperty("--my", `${ry}px`);
      if (Math.abs(tx - rx) > 0.5 || Math.abs(ty - ry) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        background:
          "radial-gradient(380px circle at var(--mx, -300px) var(--my, -300px), oklch(0.74 0.175 52 / 0.10), transparent 65%)",
      }}
    />
  );
}

function Portfolio() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["roblox-games", PLACE_IDS],
    queryFn: () => getRobloxGames({ data: { placeIds: PLACE_IDS } }),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  useScrollReveal();

  const totals = (data ?? []).reduce(
    (acc, g) => {
      acc.playing += g.playing;
      acc.visits += g.visits;
      acc.favorites += g.favoritedCount;
      return acc;
    },
    { playing: 0, visits: 0, favorites: 0 },
  );

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Spotlight />
      {/* Animated backdrop grid */}
      <div className="hero-grid" />

      <Nav />

      <main className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-12 sm:pt-20">
        <Hero totals={totals} loading={isLoading} />

        <section id="games" className="mt-32">
          <Reveal>
            <SectionHeader
              eyebrow="Live experiences"
              title="Roblox games"
              description="Auto-refreshes every 30 seconds. Concurrent players, visits and favorites straight from Roblox."
              right={
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <span className={isFetching ? "inline-block animate-spin" : ""}>↻</span>
                  {isFetching ? "Refreshing" : "Refresh"}
                </button>
              }
            />
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {isLoading
              ? PLACE_IDS.map((id) => <GameCardSkeleton key={id} />)
              : isError
                ? (
                  <div className="col-span-full rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm">
                    Couldn't load Roblox stats right now.
                  </div>
                )
                : (data ?? []).map((g, i) => (
                    <Reveal key={g.placeId} delay={i * 80}>
                      <GameCard game={g} />
                    </Reveal>
                  ))}
          </div>
        </section>

        <section id="stack" className="mt-32">
          <Reveal>
            <SectionHeader
              eyebrow="How I build"
              title="Toolkit"
              description="The languages and tech I reach for day to day."
            />
          </Reveal>
          <Reveal>
            <div className="mt-8 flex flex-wrap gap-3">
              {STACK.map((s, i) => (
                <span
                  key={s}
                  className="card-surface card-surface-hover inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                  style={{ animation: `fade-up-blur 0.6s ${i * 60}ms cubic-bezier(0.16,1,0.3,1) both` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="media" className="mt-32">
          <Reveal>
            <SectionHeader
              eyebrow="Devlogs & videos"
              title="On YouTube"
              description="Behind-the-scenes builds and updates on the @MrDragonChan channel."
            />
          </Reveal>
          <Reveal className="mt-8">
            <a
              href="https://www.youtube.com/@MrDragonChan"
              target="_blank"
              rel="noreferrer"
              className="card-surface card-surface-hover block overflow-hidden"
            >
              <div className="grid gap-6 p-8 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-primary">
                    YouTube channel
                  </div>
                  <h3 className="mt-3 text-2xl font-display font-semibold">@MrDragonChan</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    View me on YouTube to see my development process and other
                    cool projects.
                  </p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                  Visit channel →
                </div>
              </div>
            </a>
          </Reveal>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VIDEOS.map((v, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="card-surface card-surface-hover overflow-hidden">
                  <div className="relative aspect-video bg-surface-elevated">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${v.id}`}
                      title={v.title}
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-semibold">{v.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {v.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="testimonials" className="mt-32">
          <Reveal>
            <SectionHeader
              eyebrow="Kind words"
              title="Testimonials"
              description="What studios and developers say after working with me."
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 90}>
                <figure className="card-surface card-surface-hover flex h-full flex-col p-6">
                  <div className="font-nevera text-4xl leading-none text-primary">“</div>
                  <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground/90">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-5 border-t border-border/60 pt-4">
                    <div className="font-display text-sm font-semibold">{t.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{t.role}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact" className="mt-32">
          <Reveal>
            <SectionHeader
              eyebrow="Get in touch"
              title="Socials"
              description="The fastest ways to reach me or follow along."
            />
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SOCIALS.map((s, i) => (
              <Reveal
                key={s.url}
                className="card-surface card-surface-hover flex items-center gap-5 p-6"
                delay={i * 80}
              >
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="contents"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {s.label}
                    </div>
                  <div className="mt-1 text-lg font-display font-semibold">{s.handle}</div>
                  </div>
                  <div className="ml-auto text-muted-foreground">↗</div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <footer className="mt-24 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dragon Chan · Roblox Developer
        </footer>
      </main>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-end px-6 py-4">
        <div className="hidden gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#games" className="transition hover:text-foreground">Games</a>
          <a href="#stack" className="transition hover:text-foreground">Toolkit</a>
          <a href="#media" className="transition hover:text-foreground">Videos</a>
          <a href="#testimonials" className="transition hover:text-foreground">Reviews</a>
          <a href="#contact" className="transition hover:text-foreground">Contact</a>
        </div>
      </div>
    </nav>
  );
}

function Hero({
  totals,
  loading,
}: {
  totals: { playing: number; visits: number; favorites: number };
  loading: boolean;
}) {
  return (
    <header id="top" className="relative pt-10">
      <div className="hero-glow" />

      <div
        className="relative inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-primary backdrop-blur"
        style={{ animation: "fade-up-blur 0.8s 0.05s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <span className="live-dot" /> Fullstack Roblox Developer
      </div>

      <h1 className="relative mt-6 font-nevera font-extrabold leading-[0.98] tracking-tight text-[clamp(2.85rem,8.5vw,6.75rem)]">
        {["Turn", "your", "visions"].map((w, i) => (
          <span
            key={w}
            className="word-in mr-[0.28em]"
            style={{ animationDelay: `${0.15 + i * 0.09}s` }}
          >
            {w}
          </span>
        ))}
        <br />
        <span className="word-in mr-[0.28em]" style={{ animationDelay: "0.42s" }}>
          into
        </span>
        <span
          className="word-in text-gradient"
          style={{ animationDelay: "0.51s" }}
        >
          reality.
        </span>
      </h1>

      <div
        className="relative mt-7 h-px w-40 origin-left bg-gradient-to-r from-primary to-transparent"
        style={{ animation: "draw-line 0.9s 0.75s cubic-bezier(0.16,1,0.3,1) both" }}
      />

      <p
        className="relative mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground"
        style={{ animation: "fade-up-blur 0.9s 0.85s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        I'm <span className="font-semibold text-foreground">Dragon Chan</span>, a
        fullstack Roblox developer with 3 years of experience. I've contributed to
        over <span className="font-semibold text-foreground">675M visits</span> and
        <span className="font-semibold text-foreground"> 150k+ CCU</span>. My goal is
        to turn your visions into reality. I've worked on just about everything:
        combat, build systems, tycoons, data handling, anticheats, admin systems,
        vehicle systems, movement, and much, much more.
      </p>

      <div
        className="mt-12 grid gap-4 sm:grid-cols-3"
        style={{ animation: "fade-up-blur 1s 0.9s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <StatTile
          label="Players right now"
          value={loading ? null : totals.playing}
          live
          exact
        />
        <StatTile label="Total visits" value={loading ? null : totals.visits} />
        <StatTile
          label="Total favorites"
          value={loading ? null : totals.favorites}
        />
      </div>
    </header>
  );
}

function StatTile({
  label,
  value,
  live = false,
  exact = false,
}: {
  label: string;
  value: number | null;
  live?: boolean;
  exact?: boolean;
}) {
  const display =
    value === null ? "—" : exact ? formatNumber(value) : formatCompact(value);
  const sub =
    value !== null && !exact && value >= 1000 ? formatNumber(value) : null;

  return (
    <div className="card-surface p-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {live && <span className="live-dot" />} {label}
      </div>
      <div className="mt-3 font-display text-4xl font-semibold tabular-nums sm:text-5xl">
        {display}
      </div>
      {sub && (
        <div className="mt-1 text-xs text-muted-foreground tabular-nums">
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </div>
        <h2 className="mt-3 text-3xl font-display font-semibold sm:text-4xl">{title}</h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

function GameCard({ game }: { game: RobloxGameStats }) {
  return (
    <a
      href={game.url}
      target="_blank"
      rel="noreferrer"
      className="card-surface card-surface-hover group flex gap-5 p-5"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-elevated">
        {game.iconUrl ? (
          <img
            src={game.iconUrl}
            alt={game.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            no icon
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-lg font-display font-semibold">{game.name}</h3>
          <span className="text-muted-foreground transition group-hover:text-primary">
            ↗
          </span>
        </div>

        <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="live-dot" />
          <span className="font-medium text-foreground tabular-nums">
            {formatNumber(game.playing)}
          </span>
          playing now
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-4 text-xs text-muted-foreground">
          <Mini label="Visits" value={formatCompact(game.visits)} />
          <Mini label="Favorites" value={formatCompact(game.favoritedCount)} />
        </div>
      </div>
    </a>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-display text-base font-semibold text-foreground tabular-nums">
        {value}
      </div>
    </div>
  );
}

function GameCardSkeleton() {
  return (
    <div className="card-surface flex gap-5 p-5">
      <div className="h-28 w-28 shrink-0 animate-pulse rounded-xl bg-surface-elevated" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="h-5 w-2/3 animate-pulse rounded bg-surface-elevated" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-elevated" />
        <div className="mt-auto grid grid-cols-2 gap-3">
          <div className="h-12 animate-pulse rounded-lg bg-surface-elevated" />
          <div className="h-12 animate-pulse rounded-lg bg-surface-elevated" />
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function formatCompact(n: number) {
  if (n >= 1_000_000_000)
    return (n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 1) + "B";
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return n.toString();
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.79l-5.32-6.96L4.8 22H1.54l8.04-9.18L1 2h6.91l4.82 6.37L18.244 2Zm-1.19 18h1.84L7.04 4H5.07l11.984 16Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.39 18.39 0 0 0-5.487 0 16.31 16.31 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.416 10.416 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.128 12.945 12.945 0 0 1-1.873.892.077.077 0 0 0-.041.106c.36.699.772 1.364 1.225 1.994a.077.077 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
