import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import chefImage from "@/assets/chef-ndellis.jpg.asset.json";
import cuisinePoster from "@/assets/cheffe-cuisine-poster.jpg.asset.json";
import cuisineVideo from "@/assets/cheffe-cuisine.mp4.asset.json";
import cuisineVideoWebm from "@/assets/cheffe-cuisine.webm.asset.json";
import heroImage from "@/assets/plats-traiteur-header.png.asset.json";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { publicMenuQuery, type MenuRow } from "@/lib/api";
import { useCart } from "@/lib/cart";
import {
  formatDay,
  formatDayShort,
  formatPrice,
  formatTime,
  STATE_LABELS,
  todayISO,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Menu de la semaine — Précommande traiteur à Dakar" },
      {
        name: "description",
        content:
          "Consultez le menu de la semaine, choisissez vos plats et jus, et précommandez en ligne sans créer de compte. Livraison du lundi au vendredi.",
      },
      { property: "og:title", content: "Menu de la semaine — Précommande traiteur" },
      {
        property: "og:description",
        content: "Plats et jus disponibles chaque jour. Précommandez en quelques clics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { data, isLoading } = useQuery(publicMenuQuery());
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const rows = data ?? [];

  const days = useMemo(() => [...new Set(rows.map((r) => r.day_date))].sort(), [rows]);
  const currentDay = activeDay && days.includes(activeDay) ? activeDay : (days[0] ?? null);
  const dayRows = rows.filter((r) => r.day_date === currentDay);
  const plats = dayRows.filter((r) => r.category === "plat");
  const jus = dayRows.filter((r) => r.category === "jus");

  useEffect(() => {
    if (currentDay && scrollRef.current) {
      const btn = dayRefs.current.get(currentDay);
      if (btn) {
        btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentDay]);

  const scrollDays = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border/70">
        <img
          src={heroImage.url}
          alt="Plats sénégalais et jus frais préparés par le traiteur"
          width={1600}
          height={912}
          className="h-[310px] w-full object-cover sm:h-[420px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/65 to-sidebar/10" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="max-w-2xl text-sidebar-foreground">
              <p className="text-sm font-bold uppercase tracking-widest text-accent">
                Votre table, notre passion
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-6xl">
                Le goût de la maison,
                <span className="block italic text-accent">préparé chaque jour.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-sidebar-foreground/85 sm:text-base">
                Découvrez le menu de la semaine et réservez vos plats et jus frais avant l'heure
                limite.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : days.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <h2 className="font-display text-xl font-bold">Menu bientôt disponible</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Le menu de la semaine sera publié prochainement. Revenez dimanche !
            </p>
          </div>
        ) : (
          <>
            <div className="no-print mb-9">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="font-display text-lg font-bold">Menus de la semaine</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => scrollDays("left")}
                    aria-label="Voir les jours précédents"
                    title="Jours précédents"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => scrollDays("right")}
                    aria-label="Voir les jours suivants"
                    title="Jours suivants"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
              <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto py-2 scrollbar-hide scroll-smooth"
              >
                {days.map((day) => {
                  const isCurrent = day === currentDay;
                  const isToday = day === todayISO();
                  return (
                    <Button
                      key={day}
                      ref={(el) => {
                        if (el) dayRefs.current.set(day, el);
                      }}
                      type="button"
                      variant={isCurrent ? "default" : "outline"}
                      onClick={() => setActiveDay(day)}
                      className={cn(
                        "h-auto min-w-36 shrink-0 snap-start rounded-full px-6 py-3 text-sm font-bold",
                        isCurrent && "shadow-warm",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {formatDayShort(day)}
                        {isToday && <span className="inline-flex size-2 rounded-full bg-accent" />}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-bold">
                {currentDay ? formatDay(currentDay) : ""}
              </h2>
              {currentDay && (
                <Badge variant={currentDay === todayISO() ? "default" : "secondary"}>
                  {currentDay === todayISO() ? "Menu du jour" : "Précommande"}
                </Badge>
              )}
            </div>

            <ProductSection title="Les plats" rows={plats} />
            <ProductSection title="Les jus" rows={jus} />
          </>
        )}
      </main>

      <CulinaryJourneySection />

      <ChefSection />


      <CartBar />
      <SiteFooter />
    </div>
  );
}

function ProductSection({ title, rows }: { title: string; rows: MenuRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="mt-8">
      <h3 className="mb-4 font-display text-lg font-bold text-primary">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <ProductCard key={row.day_product_id} row={row} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ row }: { row: MenuRow }) {
  const { items, add, setQuantity } = useCart();
  const inCart = items.find((i) => i.day_product_id === row.day_product_id);
  const available = row.state === "disponible";
  const maxQty = row.stock_left;
  const isToday = row.day_date === todayISO();

  return (
    <article
      className={cn(
        "surface-card flex flex-col overflow-hidden transition-shadow hover:shadow-warm",
        !available && "opacity-60 grayscale",
      )}
    >
      <div className="relative aspect-[4/3] bg-secondary">
        {row.photo_url ? (
          <img
            src={row.photo_url}
            alt={row.name}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center font-display text-3xl text-muted-foreground">
            {row.name.slice(0, 1)}
          </div>
        )}
        {!available && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            {STATE_LABELS[row.state]}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-lg font-bold">{row.name}</h4>
          <span className="whitespace-nowrap font-semibold text-accent">
            {formatPrice(row.price)}
          </span>
        </div>
        {row.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{row.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {isToday ? "Commandes du jour" : "Précommande"} jusqu'à {formatTime(row.close_time)} ·{" "}
          {available ? `${row.stock_left} restant(s)` : STATE_LABELS[row.state]}
        </p>

        <div className="mt-auto pt-3">
          {!available ? (
            <Button disabled className="w-full" variant="secondary">
              Indisponible
            </Button>
          ) : inCart ? (
            <div className="flex items-center justify-between rounded-lg border border-border p-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setQuantity(row.day_product_id, inCart.quantity - 1)}
                aria-label="Retirer une unité"
              >
                <Minus className="size-4" />
              </Button>
              <span className="font-semibold">{inCart.quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Ajouter une unité"
                onClick={() => {
                  if (inCart.quantity >= maxQty) {
                    toast.error(`Il ne reste que ${maxQty} portion(s) de ${row.name}.`);
                    return;
                  }
                  setQuantity(row.day_product_id, inCart.quantity + 1);
                }}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                add({
                  day_product_id: row.day_product_id,
                  name: row.name,
                  category: row.category,
                  price: row.price,
                  day_date: row.day_date,
                });
                toast.success(
                  isToday
                    ? `${row.name} ajouté au panier`
                    : `${row.name} ajouté en précommande`,
                );
              }}
            >
              {isToday ? "Ajouter au panier" : "Précommander"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

const CUISINES = [
  "Cuisine sénégalaise",
  "Saveurs asiatiques",
  "Grande cuisine européenne",
  "Menus sur mesure",
];

function CulinaryJourneySection() {
  return (
    <section className="border-y border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
        <div className="order-first md:order-none">
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Nos clients
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Un voyage culinaire,
            <span className="block italic text-accent">à chaque commande.</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Familles, entreprises et événements : nos clients nous confient des plats divers et
            variés — du thiéboudienne et du poulet yassa aux saveurs asiatiques, en passant par les
            grandes classiques de la cuisine européenne. Chaque menu est pensé comme un voyage,
            adapté à vos envies et à l'occasion.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Dites-nous ce qui vous fait envie : nous composons la table, les jus frais et les
            quantités, et nous livrons tout prêt à déguster.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {CUISINES.map((item) => (
              <span
                key={item}
                className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-3 rounded-3xl border border-accent/30" />
          <video
            poster={cuisinePoster.url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="La cheffe Ndellis Signé en pleine préparation en cuisine"
            className="relative aspect-[9/16] w-full rounded-2xl object-cover shadow-warm"
          >
            <source src={cuisineVideoWebm.url} type="video/webm" />
            <source src={cuisineVideo.url} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}

function ChefSection() {
  return (
    <section className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative mx-auto w-full max-w-sm md:order-none order-first">
          <div className="absolute -inset-3 rounded-3xl border border-accent/30" />
          <img
            src={chefImage.url}
            alt="Ndellis Signé, cheffe exécutive chez Ndelli's Traiteur"
            width={960}
            height={1280}
            loading="lazy"
            className="relative aspect-[3/4] w-full rounded-2xl object-cover shadow-warm"
          />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">
            Notre cheffe
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Ndellis Signé,
            <span className="block italic text-accent">cheffe exécutive & styliste culinaire</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-sidebar-foreground/85 sm:text-base">
            Une femme passionnée, animée d'un amour inconditionnel pour l'art culinaire et le
            bien-être des êtres humains. À la tête de Ndelli's Traiteur depuis 2019, elle imagine
            chaque menu comme une œuvre : des plats généreux, élégants et fidèles aux saveurs
            sénégalaises.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-sidebar-foreground/85 sm:text-base">
            Son parcours s'est forgé aux côtés des plus grandes tables de Dakar : quatorze ans à la
            cuisine du Radisson Blu Hôtel Dakar, une expérience à la 2STV, et une formation en
            gastronomie au CFPP Sénégal avec un BT en cuisine et restauration. De cette richesse est
            née une cuisine de maison, raffinée et sincère — celle que vous retrouvez chaque jour
            dans nos menus.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {["Radisson Blu Dakar · 14 ans", "2STV", "BT Cuisine & Restauration — CFPP Sénégal", "Styliste culinaire"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CartBar() {
  const { count, total } = useCart();
  if (count === 0) return null;
  return (
    <div className="no-print sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="text-sm">
          <p className="font-semibold">
            {count} article(s) — {formatPrice(total)}
          </p>
          <p className="text-muted-foreground">Précommande non remboursable</p>
        </div>
        <Button asChild>
          <Link to="/commande">
            <ShoppingBag className="mr-2 size-4" />
            Voir le panier
          </Link>
        </Button>
      </div>
    </div>
  );
}
