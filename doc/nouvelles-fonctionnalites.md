# Nouvelles fonctionnalités

Fonctionnalités demandées, pas encore développées. Chaque partie liste l'objectif, le périmètre
proposé et les questions à trancher avant de commencer.

| Fonctionnalité | Statut |
| --- | --- |
| [Caisse & dépenses (avec TPE)](#1-caisse--dépenses-avec-tpe) | À faire, questions en attente |
| [Simulation de production et des dépenses](#2-simulation-de-production-et-des-dépenses) | Développée (branche `vercel`), migration à appliquer |
| [Autres points en suspens](#3-autres-points-en-suspens) | À faire |

---

## 1. Caisse & dépenses (avec TPE)

**Objectif :** que le propriétaire ait une trace de **toutes les ventes et toutes les dépenses**.

### Comment fonctionne une caisse avec TPE

```
1. Vente      La caissière choisit les produits dans la caisse → total : 6 500 F
2. Paiement   Le client choisit : Espèces · Carte (TPE) · Wave · Orange Money
3. Carte      Le montant est saisi sur le TPE → le client paie → reçu du TPE
4. Trace      La caisse enregistre : produits, montant, moyen de paiement, heure, vendeur
5. Le soir    Clôture de caisse : total par moyen de paiement, comparé à l'argent réel
```

| Mode TPE | Fonctionnement | Avantage | Inconvénient |
| --- | --- | --- | --- |
| **Autonome** (recommandé pour commencer) | On tape le montant sur le TPE puis on note « payé par carte » + n° de reçu dans la caisse | Fonctionne avec n'importe quel TPE, aucun développement | Saisie en double |
| **Intégré** | La caisse envoie le montant au TPE automatiquement | Aucune saisie en double | TPE et fournisseur avec API, contrat, intégration technique |

### Périmètre proposé (module « Caisse & Dépenses » de l'espace gérant)

1. **Vente comptoir** : on choisit les plats et jus du jour, le moyen de paiement (espèces, carte TPE
   + n° de reçu, Wave, Orange Money), puis on imprime un ticket. Le stock baisse comme pour une
   commande en ligne.
2. **Journal unique des ventes** : en ligne et comptoir, filtrable par jour, moyen de paiement et vendeur.
3. **Dépenses** : catégorie (ingrédients, gaz, emballages, transport, salaires…), montant, moyen
   de paiement, photo du reçu.
4. **Clôture de caisse chaque soir** : fond de caisse, espèces comptées et attendues, écart affiché,
   totaux carte et Wave à rapprocher des relevés. Journée verrouillée une fois clôturée.
5. **Traçabilité** : chaque opération horodatée avec son auteur. Rien ne se supprime : une erreur
   s'annule avec un motif, et l'annulation reste visible.
6. **Rapports** : chiffre d'affaires, dépenses et bénéfice par jour, semaine et mois, avec export
   Excel pour le comptable.

### Déjà en place

- Les ventes en ligne sont enregistrées (commandes + paiement PayDunya).
- La page « Bilan » donne le chiffre d'affaires de la semaine et les plats les plus vendus.
- La table `purchases` (achats) existe en base, sans écran.

### Questions à trancher

- [ ] Y a-t-il des **ventes sur place ou au comptoir**, ou tout passe-t-il par les commandes en ligne et WhatsApp ?
- [ ] Avez-vous déjà un **TPE** ? Si oui, de quelle banque ou de quel fournisseur ?
- [ ] **Qui encaisse** : le gérant seul ou plusieurs employés ? S'il y a plusieurs employés, il faut un compte par personne.
- [ ] Le **propriétaire et le gérant** sont-ils la même personne ? Sinon, un accès « lecture seule » aux rapports pour le propriétaire.

---

## 2. Simulation de production et des dépenses

**Objectif :** connaître la **somme à recevoir**, les **dépenses** et le **bénéfice** d'un jour ou
d'une semaine, et la liste de courses, à partir des cuissons réelles précédentes.

Modèle validé :
- ingrédients avec **plusieurs formats d'achat** (boîte 300 g, 500 g, 1 kg…) ;
- **journal de production** rempli après chaque cuisson (ce qui a été utilisé, plats obtenus) ;
- quantités par plat calculées sur les **3 dernières cuissons** ;
- prévisions avec liste de courses dans le format habituel (arrondi au-dessus), somme à recevoir
  (assurée, déjà payée, si tout est vendu), dépenses et bénéfice, prévus et réels.

Développée sur la branche `vercel` (page « Simulation » de l'espace gérant). Détail et points prévus
pour plus tard : [fiche de la fonctionnalité](fonctionnalites/admin-simulation.md).

---

## 3. Autres points en suspens

- [ ] **Photos des jus** : remplacer les illustrations provisoires. Les stocks réels sont à régler dans Catalogue.
- [ ] **`.env` local** : il pointe encore vers l'ancienne base Lovable (`mdtrlkowgicbyqassxgw`) au lieu de la nouvelle base Supabase.
- [ ] **Témoignages** : remplacer les 5 avis d'exemple par de vrais avis clients.
- [x] ~~Audit gérant, points critiques~~ : l'impression échappe désormais les données clients, et la suppression d'un produit demande une confirmation.
