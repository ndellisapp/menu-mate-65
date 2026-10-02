import cuisinePoster from "@/assets/cheffe-cuisine-poster.jpg";
import cuisineVideo from "@/assets/cheffe-cuisine.mp4";
import cuisineVideoWebm from "@/assets/cheffe-cuisine.webm";

const CUISINES = [
  "Cuisine sénégalaise",
  "Saveurs asiatiques",
  "Grande cuisine européenne",
  "Menus sur mesure",
];

export function CulinaryJourneySection() {
  return (
    <section className="border-y border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
        <div className="order-first md:order-none">
          <p className="text-sm font-bold uppercase tracking-widest text-accent">Nos clients</p>
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
            poster={cuisinePoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="La cheffe Ndellis Signé en pleine préparation en cuisine"
            className="relative aspect-[9/16] w-full rounded-2xl object-cover shadow-warm"
          >
            <source src={cuisineVideoWebm} type="video/webm" />
            <source src={cuisineVideo} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
