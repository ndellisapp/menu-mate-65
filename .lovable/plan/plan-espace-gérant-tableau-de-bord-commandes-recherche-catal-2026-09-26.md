# Plan — Espace gérant : tableau de bord, commandes, recherche catalogue et comptabilité

Réponses retenues : comptabilité **complète** (ingrédients, recettes, achats, simulateur), filtres du tableau de bord en **périodes rapides**, paiements Wave / Orange Money **en attente des accès marchands** (le paiement manuel actuel reste en place).

## 1. Tableau de bord repensé (`/admin`)
- 4 cartes avec **icônes modernes** (commandes, repas, jus, chiffre d'affaires) et un habillage plus soigné, dans l'identité marron/orange du site.
- **Ligne de totaux généraux** au-dessus : nombre total de commandes depuis le début, total repas, total jus, chiffre d'affaires global.
- **Filtres de période rapides** (boutons) : Aujourd'hui · Cette semaine · Ce mois · Tout. Ils pilotent les cartes et la liste de production.
- La liste de production reste exportable/imprimable ; le sélecteur de jour est conservé pour le mode « jour précis ».

## 2. Commandes (`/admin/orders`)
- Nouvelle colonne **Adresse de livraison** dans le tableau (tronquée, complète au clic sur la ligne — elle y est déjà).
- Filtres ajoutés : **Jour de consommation** (existant) + **Semaine** (menu, pas commande) — et filtre par **statut de paiement**.
- Exports CSV/Excel enrichis avec l'adresse.
- Badges « Précommande » et acompte déjà en place — inchangés.

## 3. Recherche dans le catalogue (`/admin/weeks`)
- Barre de **recherche** dans le sélecteur « Depuis le catalogue » (filtre sur le nom en temps réel) ; état vide explicite. Le reste du pop-up reste inchangé.

## 4. Comptabilité (nouveau module « Comptabilité » dans le menu admin)
Base de données (migration, RLS réservée aux admins, avec règles d'accès explicites) :
- `ingredients` : nom, unité (kg, pièce, sachet…), prix d'achat par unité.
- `recipes` : quantité d'ingrédient par plat du catalogue (ex. 0,25 kg de riz par portion).
- `purchases` : date, ingrédient ou libellé libre (barquettes, gaz…), quantité, coût total — rattachable à un jour ou à une semaine.

Pages :
- **Ingrédients & recettes** : créer/modifier les ingrédients, puis, plat par plat, saisir les quantités par portion. Coût de revient par plat calculé automatiquement.
- **Achats** : saisie rapide des dépenses du jour, avec total dépensé par jour/semaine.
- **Résultats** : par jour et par semaine — ventes (calculées depuis les commandes), dépenses, **bénéfice** ; coût par plat et par menu du jour.
- **Simulateur de production** : on saisit des quantités en stock (10 kg de riz, 5 kg de viande…), l'application calcule **combien de portions de chaque plat** on peut produire (limité par l'ingrédient le plus rare).
- Exports CSV pour le suivi comptable.

## 5. Paiements Wave / Orange Money
- Le parcours actuel (acompte 1 500 F non remboursable + ID de transaction vérifié dans l'admin) reste en place.
- Un emplacement d'intégration est préparé dans le code ; les API seront branchées dès que vous aurez les accès marchands — chantier **en attente**, non réalisé dans ce plan.

## Ce qui est déjà fait
- Précommandes avec acompte 1 500 F non remboursable (affiché au client) — en place.
- Calendrier des semaines — validé par vous.
- Section « Service traiteur sur devis » avec WhatsApp 78 186 72 72 — en place.

## Ordre de réalisation
1. Tableau de bord (icônes + totaux + filtres) · 2. Commandes (adresse + filtres + exports) · 3. Recherche catalogue · 4. Comptabilité (base de données, puis pages ingrédients/recettes, achats, résultats, simulateur).

## Notes techniques
- Toutes les nouvelles tables sont en RLS, accessibles uniquement aux comptes admin (fonction `is_admin()`), avec GRANT explicites.
- Le calcul du bénéfice utilise uniquement les commandes non annulées ; acomptes inclus dans les ventes.
- Vérification finale : typecheck, build, et test des écrans dans l'aperçu.
