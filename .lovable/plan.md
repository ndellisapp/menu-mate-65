# Affichage dynamique des jours du menu public

## Objectif
Faire en sorte que le site public ne propose dans le menu hebdomadaire que le jour courant et les jours suivants, jamais les jours passés. Par exemple, si on est mardi, lundi disparaît ; si on est mercredi, seuls mercredi, jeudi et vendredi restent visibles.

## Étapes

### 1. Stabiliser la date de filtrage sur le fuseau horaire local
Le site cible des clients au Sénégar (UTC+0). La fonction utilitaire `todayISO()` dans `src/lib/format.ts` utilise actuellement `new Date().toISOString().slice(0, 10)`, ce qui donne la date UTC. Cela fonctionne à UTC+0 mais peut être source de confusion en cas de décalage. Nous allons remplacer cette fonction par une version qui retourne la date locale formatée en ISO (`YYYY-MM-DD`) via `Intl.DateTimeFormat` avec `timeZone: "Africa/Dakar"`, garantissant que le "jour courant" correspond bien au calendrier du client/gérant.

### 2. Filtrer le menu public dès la requête
`publicMenuQuery` dans `src/lib/api.ts` utilise déjà `.gte("day_date", todayISO())`. Nous ne changerons que la source de la date : la requête utilisera la nouvelle date locale fiable. Cela garantit que Supabase ne retourne que les jours futurs ou d'aujourd'hui.

### 3. Sélectionner automatiquement le bon jour actif
Dans `src/routes/index.tsx`, la logique actuelle sélectionne `days[0]` par défaut si `activeDay` n'est pas défini. Comme `publicMenuQuery` sera déjà filtrée, `days[0]` correspondra au jour courant (ou au prochain jour ouvert), ce qui est le comportement attendu. Nous vérifierons cependant que cette sélection par défaut reste cohérente après le filtrage.

### 4. Vérifier l'administration
`adminMenuQuery` affiche tous les jours pour la planification ; il n'est pas concerné par ce filtrage. Nous ne toucherons pas à cette requête ni aux pages back-office.

### 5. Tests visuels
Une fois les modifications appliquées, nous vérifierons le rendu du site public avec les données actuelles pour s'assurer que :
- Les jours passés de la semaine en cours ne s'affichent plus.
- Le jour courant est bien sélectionné par défaut.
- Les jours futurs (mercredi, jeudi, vendredi) restent accessibles.
