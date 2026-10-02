import chefImage from "@/assets/chef-ndellis.jpg";

export function ChefSection() {
  return (
    <section className="relative text-sidebar-foreground">
      {/* voile marron supplémentaire : le haut de l'image (table blanche) est plus clair que le bas,
          on l'assombrit pour que la partie cheffe ait le même rendu que Service traiteur */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-sidebar/40 via-sidebar/30 to-transparent"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative mx-auto order-first w-full max-w-sm">
          <div className="absolute -inset-3 rounded-3xl border border-accent/30" />
          <img
            src={chefImage}
            alt="Ndellis Signé, cheffe exécutive chez Ndelli's Traiteur"
            width={960}
            height={1280}
            loading="lazy"
            className="relative aspect-[3/4] w-full rounded-2xl object-cover shadow-warm"
          />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-accent">Notre cheffe</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Ndellis Signé,
            <span className="block italic text-accent">cheffe exécutive & styliste culinaire</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-sidebar-foreground/90 sm:text-base">
            Une femme passionnée, animée d'un amour inconditionnel pour l'art culinaire et le
            bien-être des êtres humains. À la tête de Ndelli's Traiteur depuis 2019, elle imagine
            chaque menu comme une œuvre : des plats généreux, élégants et fidèles aux saveurs
            sénégalaises.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-sidebar-foreground/90 sm:text-base">
            Son parcours s'est forgé aux côtés des plus grandes tables de Dakar : quatorze ans à la
            cuisine du Radisson Blu Hôtel Dakar, une expérience à la 2STV, et une formation en
            gastronomie au CFPP Sénégal avec un BT en cuisine et restauration. De cette richesse est
            née une cuisine de maison, raffinée et sincère — celle que vous retrouvez chaque jour
            dans nos menus.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {[
              "Radisson Blu Dakar · 14 ans",
              "2STV",
              "BT Cuisine & Restauration — CFPP Sénégal",
              "Styliste culinaire",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-accent/40 bg-sidebar/40 px-4 py-1.5 text-xs font-semibold text-accent backdrop-blur-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
