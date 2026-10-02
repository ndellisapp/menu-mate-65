# Documentation — Ndelli's Traiteur

Application de précommande pour un service traiteur à Dakar. Chaque dimanche, le gérant publie
le menu du lundi au vendredi. Les clients commandent sans créer de compte et paient en ligne par PayDunya.

- **Ajouter une fonctionnalité :** suivez [`ajouter-une-fonctionnalite.md`](ajouter-une-fonctionnalite.md).
- **Comprendre une fonctionnalité existante :** ouvrez sa fiche ci-dessous.

## Fonctionnalités

### Côté client
| Fiche | Code | Page(s) |
| --- | --- | --- |
| [Accueil (vitrine)](fonctionnalites/accueil.md) | `src/features/home/` | `/` |
| [Menu de la semaine](fonctionnalites/menu-de-la-semaine.md) | `src/features/menu/` | `/` |
| [Panier](fonctionnalites/panier.md) | `src/features/cart/` | toutes |
| [Commande et confirmation](fonctionnalites/commande.md) | `src/features/checkout/` | `/commande`, `/confirmation` |
| [Paiement PayDunya](fonctionnalites/paiement.md) | `src/features/payment/` | `/api/public/paydunya-ipn` |

### Côté gérant
| Fiche | Code | Page(s) |
| --- | --- | --- |
| [Connexion gérant](fonctionnalites/connexion-gerant.md) | `src/features/auth/` | `/auth` |
| [Espace gérant : vue d'ensemble](fonctionnalites/admin.md) | `src/features/admin/` | `/admin/*` |
| [Accès et navigation](fonctionnalites/admin-acces.md) | `src/features/admin/layout/` | `/admin/*` |
| [Tableau de bord](fonctionnalites/admin-tableau-de-bord.md) | `src/features/admin/dashboard/` | `/admin` |
| [Semaines et menus](fonctionnalites/admin-semaines-et-menus.md) | `src/features/admin/menu-planning/` | `/admin/weeks` |
| [Catalogue produits](fonctionnalites/admin-produits.md) | `src/features/admin/products/` | `/admin/products` |
| [Commandes](fonctionnalites/admin-commandes.md) | `src/features/admin/orders/` | `/admin/orders` |

## Organisation du code

```
src/
├── routes/        une page = un fichier : URL et balises <head> uniquement (TanStack Router)
├── features/      tout le code d'une fonctionnalité : pages, composants, requêtes (api.ts)
├── components/    composants partagés (ui/ = shadcn, site-header, section-pill, carousel-arrows…)
├── lib/           utilitaires partagés (db.ts = client Supabase, format.ts, utils.ts)
└── integrations/  client Supabase (généré par Lovable, ne pas modifier)
supabase/
└── migrations/    schéma de la base de données (tables, sécurité, fonctions SQL)
```

## Technologies
- **TanStack Start** (React 19, routage par fichiers, fonctions serveur) et **Vite**
- **Supabase** : base PostgreSQL, authentification, stockage des photos, sécurité au niveau des lignes
- **Tailwind CSS 4** et composants **shadcn/ui**
- **TanStack Query** pour charger les données
- **PayDunya** pour le paiement
- Projet connecté à **Lovable** : tout commit poussé sur la branche se synchronise avec l'éditeur Lovable.

## Lancer le projet en local
```bash
npm install     # une seule fois
npm run dev     # http://localhost:8080
```
