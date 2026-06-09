"use client";

import {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FORCE_INTRO_PAGE } from "@/lib/config";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Share2,
  Check,
} from "lucide-react";
import { VotingModal } from "@/components/voting-modal";
import { Caveat, Unbounded } from "next/font/google";
import Link from "next/link";

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  display: "swap",
});

interface Participant {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  totalVotes: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  participants?: Participant[];
}

const PARTICIPANT_REFRESH_INTERVAL_MS = 30000;

const slides = [
  {
    id: 1,
    image:
      "https://res.cloudinary.com/dcvlszzoy/image/upload/v1780826552/photo_2026-06-07_10-55-58_juugdm.jpg",
    title: "Vote for Your Favorites",
    description: "Make your voice heard in our community voting system",
  },
  {
    id: 2,
    image:
      "https://res.cloudinary.com/dcvlszzoy/image/upload/v1780826552/photo_2026-06-07_10-55-55_pf2o28.jpg",
    title: "Discover New Categories",
    description: "Explore and vote across 30 exciting categories",
  },
  {
    id: 3,
    image:
      "https://res.cloudinary.com/dcvlszzoy/image/upload/v1780827653/photo_2026-06-07_10-56-02_cp2ani.jpg",
    title: "Join the Community",
    description: "Be part of the decision-making process",
  },
  {
    id: 4,
    image:
      "https://res.cloudinary.com/dcvlszzoy/image/upload/v1780827651/photo_2026-06-07_10-56-06_rfvetm.jpg",
    title: "Join the Community",
    description: "Be part of the decision-making process",
  },
  {
    id: 5,
    image:
      "https://res.cloudinary.com/dcvlszzoy/image/upload/v1780827651/photo_2026-06-07_10-56-10_dbzygd.jpg",
    title: "Join the Community",
    description: "Be part of the decision-making process",
  },
];

export default function Home() {
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkIntro = () => {
      // If FORCE_INTRO_PAGE is enabled, always redirect to intro
      if (FORCE_INTRO_PAGE) {
        router.replace("/intro");
        return;
      }

      const introShown = localStorage.getItem("intro_shown");
      const introTimestamp = localStorage.getItem("intro_timestamp");
      const now = Date.now();
      const sixHours = 6 * 60 * 60 * 1000;
      const timestamp = introTimestamp ? parseInt(introTimestamp) : 0;

      const isValid =
        introShown && !isNaN(timestamp) && now - timestamp <= sixHours;

      if (!isValid) {
        router.replace("/intro");
      } else {
        // Defer state update to avoid cascading render warning
        setTimeout(() => {
          setShouldRender(true);
        }, 0);
      }
    };

    checkIntro();
  }, [router]);

  if (!shouldRender) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="px-2 md:px-5 mt-2 mb-5">
        <div
          className={`text-orange-600 text-2xl md:text-xl ${caveat.className}`}
        >
          Are you ready?!
        </div>
        <div
          className={`text-4xl md:text-6xl font-bold text-transparent [-webkit-text-stroke:2px_#3b82f6] ${unbounded.className}`}
        >
          AUSA WEEK{" "}
          <span className={`${caveat.className} text-sm`}>Grand pose</span>
        </div>
      </div>

      <HeroSection />
      <Suspense fallback={<div className="h-screen bg-slate-50" />}>
        <VotingSection />
      </Suspense>

      <section className="max-w-md mx-auto my-6 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <h3 className="text-gray-900 font-semibold text-lg mb-4">
          Having any issues?
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="shrink-0">
              <Image
                src="/isaacwinner.png"
                alt="Isaac Winner"
                width={56}
                height={56}
                className="rounded-full object-cover aspect-square ring-2 ring-gray-100"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                Isaac Winner
              </p>
              <p className="text-xs text-gray-500 font-medium mb-1">
                Software Developer
              </p>
              <Link
                href="https://wa.me/2348119188295"
                className="inline-flex text-xs text-green-600 font-semibold underline decoration-2 underline-offset-4 hover:text-green-700 transition-colors"
              >
                Chat on WhatsApp
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="shrink-0">
              <Image
                src="/sodmak.png"
                alt="Sodmak"
                width={56}
                height={56}
                className="rounded-full object-cover aspect-square ring-2 ring-gray-100"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                Sodmak
              </p>
              <p className="text-xs text-gray-500 font-medium mb-1">
                Social Director
              </p>
              <Link
                href="https://wa.me/2349078859865 "
                className="inline-flex text-xs text-green-600 font-semibold underline decoration-2 underline-offset-4 hover:text-green-700 transition-colors"
              >
                Chat on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden flex items-center justify-center md:px-60 bg-zinc-950">
      <div className="invisible pointer-events-none aria-hidden">
        <Image
          src={slides[currentSlide].image}
          alt=""
          width={1920}
          height={1080}
          className="w-auto h-auto max-w-full max-h-[70vh] object-contain"
        />
      </div>

      {/* Visible Slide Track */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-y-0 left-0 right-0 transition-opacity duration-1000 flex items-center justify-center p-4 ${
            index === currentSlide
              ? "opacity-100 z-10"
              : "opacity-0 pointer-events-none z-0"
          }`}
        >
          {/* Constrained wrapper to isolate overlay/content strictly to image boundaries */}
          <div className="relative max-w-full h-full flex items-center justify-center">
            <Image
              src={slide.image}
              alt={slide.title}
              width={1920}
              height={1080}
              priority={index === 0}
              className="w-auto h-auto max-w-full max-h-[70vh] object-contain shadow-xl rounded-lg"
            />

            {/* Optional: Dark Overlay strictly over the image asset */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-lg" />

            {/* Text/Interactive Content Layer */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-white">
              {/* Slide title / content overlay */}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white rounded-full h-12 w-12 flex items-center justify-center transition-colors backdrop-blur-sm"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-8 w-8" />
        <span className="sr-only">Previous slide</span>
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white rounded-full h-12 w-12 flex items-center justify-center transition-colors backdrop-blur-sm"
        onClick={nextSlide}
      >
        <ChevronRight className="h-8 w-8" />
        <span className="sr-only">Next slide</span>
      </button>
    </div>
  );
}

function VotingSection() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantsByCategoryId, setParticipantsByCategoryId] = useState<
    Record<string, Participant[]>
  >({});
  const [loadingParticipantsFor, setLoadingParticipantsFor] = useState<
    string | null
  >(null);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const pendingParticipantSlugRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const isFetchingCategoriesRef = useRef(false);
  // const participantRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-scroll active tab into view
  useEffect(() => {
    if (activeCategoryId && tabsRef.current[activeCategoryId]) {
      tabsRef.current[activeCategoryId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategoryId]);

  const fetchParticipants = useCallback(
    async (
      category: Category,
      options?: { force?: boolean; signal?: AbortSignal },
    ) => {
      if (!options?.force && participantsByCategoryId[category.id]) {
        return;
      }

      try {
        if (!participantsByCategoryId[category.id]) {
          queueMicrotask(() => setLoadingParticipantsFor(category.id));
        }

        const response = await fetch(
          `/api/participants?category=${encodeURIComponent(category.slug)}`,
          { signal: options?.signal },
        );

        if (!response.ok) {
          const text = await response.text();
          console.error(
            `API Error ${response.status}:`,
            text.substring(0, 100),
          );
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setParticipantsByCategoryId((current) => ({
            ...current,
            [category.id]: data.participants,
          }));
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching participants:", error);
        }
      } finally {
        setLoadingParticipantsFor((current) =>
          current === category.id ? null : current,
        );
      }
    },
    [participantsByCategoryId],
  );

  const fetchCategories = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch("/api/public-categories", { signal });

        if (!response.ok) {
          const text = await response.text();
          console.error(
            `API Error ${response.status}:`,
            text.substring(0, 100),
          );
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);

          // Check for query params
          const categorySlug = searchParams.get("category");
          const participantSlug = searchParams.get("participant");

          if (categorySlug) {
            const foundCategory = data.categories.find(
              (c: Category) => c.slug === categorySlug,
            );
            if (foundCategory) {
              pendingParticipantSlugRef.current = participantSlug;
              setActiveCategoryId(foundCategory.id);
            } else if (data.categories.length > 0) {
              setActiveCategoryId(data.categories[0].id);
            }
          } else if (data.categories.length > 0) {
            setActiveCategoryId(data.categories[0].id);
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching categories:", error);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchParams],
  );

  useEffect(() => {
    if (isFetchingCategoriesRef.current) return;

    const controller = new AbortController();
    isFetchingCategoriesRef.current = true;

    void fetchCategories(controller.signal).finally(() => {
      isFetchingCategoriesRef.current = false;
    });

    return () => {
      controller.abort();
      isFetchingCategoriesRef.current = false;
    };
  }, [fetchCategories]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const activeParticipants = useMemo(
    () =>
      activeCategoryId
        ? (participantsByCategoryId[activeCategoryId] ?? [])
        : [],
    [activeCategoryId, participantsByCategoryId],
  );
  const isLoadingActiveParticipants =
    !!activeCategoryId &&
    loadingParticipantsFor === activeCategoryId &&
    !participantsByCategoryId[activeCategoryId];

  useEffect(() => {
    if (!activeCategory) {
      return;
    }

    const controller = new AbortController();

    // Defer to avoid react-hooks/set-state-in-effect warning.
    // `fetchParticipants` will trigger state updates when the request resolves.
    const id = window.setTimeout(() => {
      void fetchParticipants(activeCategory, { signal: controller.signal });
    }, 0);

    return () => {
      window.clearTimeout(id);
      controller.abort();
    };
  }, [activeCategory, fetchParticipants]);

  useEffect(() => {
    if (!activeCategory) {
      return;
    }

    const interval = setInterval(() => {
      fetchParticipants(activeCategory, { force: true });
    }, PARTICIPANT_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeCategory, fetchParticipants]);

  useEffect(() => {
    const participantSlug = pendingParticipantSlugRef.current;

    if (!participantSlug || isLoadingActiveParticipants) {
      return;
    }

    const element = document.getElementById(`participant-${participantSlug}`);

    if (!element) {
      return;
    }

    pendingParticipantSlugRef.current = null;
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    element.classList.add("ring-4", "ring-amber-500", "ring-offset-4");

    setTimeout(() => {
      element.classList.remove("ring-4", "ring-amber-500", "ring-offset-4");
    }, 3000);
  }, [activeParticipants, isLoadingActiveParticipants]);

  const handleShare = (
    categorySlug: string,
    participantSlug: string,
    participantId: string,
  ) => {
    const url = `${window.location.origin}${window.location.pathname}?category=${categorySlug}&participant=${participantSlug}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Vote for my favorite participant!",
          url: url,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(participantId);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  return (
    <section id="voting-section" className="py-12 px-4 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2
          className={`text-2xl md:text-4xl font-bold text-slate-900 mb-4 ${caveat.className}`}
        >
          Award Categories...
        </h2>
        {/* <p className="text-slate-600 max-w-2xl mx-auto">
          Choose a category and vote for your preferred participant.
        </p> */}
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center mb-12">
        <div
          ref={scrollContainerRef}
          className="flex items-center bg-white/40 backdrop-blur-md  border border-slate-200/60 py-1 px-1 overflow-x-auto no-scrollbar max-w-full shadow-sm"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-28 animate-pulse mx-1" />
              ))
            : categories.map((category, index) => (
                <div key={category.id} className="flex items-center">
                  <button
                    ref={(el) => {
                      tabsRef.current[category.id] = el;
                    }}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`relative flex items-center gap-2 px-6 py-2.5 transition-all duration-300 whitespace-nowrap group ${
                      activeCategoryId === category.id
                        ? "text-white z-10"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
                    }`}
                  >
                    {activeCategoryId === category.id && (
                      <div className="absolute inset-0  z-0 bg-orange-600 rounded-xl">
                        <div className="absolute inset-0 rounded-lg pointer-events-none opacity-50" />
                        {/* Gloss Reflection */}
                        <div
                          className="absolute top-0 left-0 right-0 h-[45%] rounded-t-lg opacity-40"
                          style={{
                            background:
                              "linear-gradient(180deg, white 0%, transparent 100%)",
                          }}
                        />
                      </div>
                    )}

                    <span className="relative z-10 font-bold tracking-tight">
                      {category.name}
                    </span>
                    {activeCategoryId === category.id && (
                      <ArrowDown
                        className="w-4 h-4 relative z-10 animate-in fade-in slide-in-from-left-1 duration-300"
                        strokeWidth={3}
                      />
                    )}
                  </button>

                  {/* Vertical Separator */}
                  {index < categories.length - 1 &&
                    activeCategoryId !== category.id &&
                    activeCategoryId !== categories[index + 1].id && (
                      <div className="w-[1px] h-5 bg-slate-300/40 mx-0.5" />
                    )}
                </div>
              ))}
        </div>
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-slate-200 animate-pulse rounded-xl"
            />
          ))
        ) : isLoadingActiveParticipants ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-slate-200 animate-pulse rounded-xl"
            />
          ))
        ) : activeCategory && activeParticipants.length ? (
          activeParticipants.map((participant) => (
            <div
              key={participant.id}
              id={`participant-${participant.slug}`}
              className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-500 shadow-sm hover:shadow-xl"
            >
              <div className="aspect-square relative overflow-hidden">
                {participant.imageUrl ? (
                  <Image
                    src={participant.imageUrl}
                    alt={participant.name}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 88vw, 360px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400">No Image</span>
                  </div>
                )}

                {/* Share Overlay Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(
                      activeCategory.slug,
                      participant.slug,
                      participant.id,
                    );
                  }}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/10 backdrop-blur-sm text-amber-500 rounded-full shadow-lg transition-all duration-300 hover:bg-amber-500 hover:text-white transform hover:scale-110"
                  title="Share profile"
                >
                  {copiedId === participant.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {participant.name}
                  </h3>
                  <button
                    onClick={() =>
                      handleShare(
                        activeCategory.slug,
                        participant.slug,
                        participant.id,
                      )
                    }
                    className="sm:hidden p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600">
                    <span className="text-amber-600 font-bold">
                      {participant.totalVotes?.toLocaleString() || 0}
                    </span>{" "}
                    votes
                  </div>
                  <button
                    onClick={() => {
                      setSelectedParticipant(participant);
                      setIsModalOpen(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 "
                  >
                    Vote
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-slate-400">
              No participants in this category yet.
            </p>
          </div>
        )}
      </div>

      <VotingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        participant={selectedParticipant}
        category={
          activeCategory
            ? {
                id: activeCategory.id,
                name: activeCategory.name,
                slug: activeCategory.slug,
              }
            : null
        }
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
