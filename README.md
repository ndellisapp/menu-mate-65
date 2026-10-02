# Orderly Eats

CAHIER DES CHARGES

Application Web de précommande et de gestion de service traiteur

1. Présentation du projet

Le projet consiste à développer une application web de précommande et de gestion pour un service de traiteur.

Le service propose chaque semaine différents plats ainsi que des jus.

Chaque dimanche, le menu de la semaine suivante est publié pour les jours du lundi au vendredi.

Les clients peuvent consulter les produits disponibles et effectuer leurs précommandes directement depuis l'application.

L'application permettra au traiteur d'anticiper sa production et son organisation logistique grâce aux précommandes.

Elle permettra notamment de connaître :

Le nombre de commandes.

Le nombre de repas à préparer.

Les quantités commandées par plat.

Les quantités de jus commandées.

Le nombre de plats/plaques à prévoir.

Les clients à livrer.

Les adresses de livraison.

L'application devra également gérer automatiquement la disponibilité des produits selon le stock et l'heure limite de commande.

2. Objectifs du projet

L'application devra permettre de :

Publier le menu hebdomadaire.

Proposer plusieurs plats pour une même journée.

Ajouter autant de plats que nécessaire pour chaque jour.

Ajouter des jus comme produits complémentaires.

Permettre aux clients de précommander sans créer de compte.

Collecter les informations nécessaires à la livraison.

Gérer les quantités disponibles.

Détecter automatiquement lorsqu'un stock est épuisé.

Détecter automatiquement lorsque l'heure limite de commande est dépassée.

Empêcher une commande lorsqu'un produit n'est plus disponible.

Permettre au gérant de désactiver manuellement un produit.

Permettre au gérant de rouvrir ou fermer les commandes.

Calculer les quantités nécessaires à la préparation.

Faciliter l'organisation des livraisons.

Imprimer les listes de commandes.

Imprimer des stickers pour les commandes.

Exporter les données en Excel/CSV.

Préparer l'intégration future d'un système de paiement.

3. Type d'application

Le projet sera une application web.

Elle devra être accessible depuis :

Ordinateur

Tablette

Smartphone

L'interface devra être responsive.

Le client pourra utiliser le site depuis son navigateur sans installer d'application.

Le gérant pourra également accéder au back-office depuis un ordinateur, une tablette ou un smartphone.

4. Espaces de l'application

L'application comportera deux espaces principaux.

4.1 Espace client

Accessible sans authentification.

Le client pourra :

Consulter le menu.

Consulter les plats disponibles.

Consulter les jus disponibles.

Choisir un ou plusieurs produits.

Choisir les quantités.

Renseigner ses coordonnées.

Valider sa précommande.

Recevoir une référence de commande.

4.2 Espace gérant

Accessible avec authentification.

Le gérant pourra :

Gérer les semaines.

Gérer les jours.

Gérer les plats.

Gérer les jus.

Gérer les stocks.

Gérer les horaires de commande.

Gérer les commandes.

Fermer ou rouvrir un produit.

Suivre la production.

Gérer les livraisons.

Imprimer.

Exporter les données.

5. Fonctionnement hebdomadaire

Chaque dimanche, le gérant pourra préparer le menu de la semaine suivante.

Exemple :

Semaine du 24 au 28 août

Lundi

Thiéboudienne

Yassa Poulet

Mardi

Mafé

Thiébou Yapp

Couscous

Mercredi

Poulet braisé

Poisson grillé

Jeudi

Thiéboudienne

Yassa

Mafé

Vendredi

Couscous

Poisson

Poulet

Il n'existe aucune limite fixe du nombre de plats par jour.

6. Gestion des produits

L'application devra gérer deux grandes catégories de produits :

Plats

Exemples :

Thiéboudienne

Yassa

Mafé

Couscous

Poulet braisé

Jus

Exemples :

Bissap

Bouye

Gingembre

Orange

La structure devra permettre d'ajouter facilement de nouveaux produits.

7. Gestion des plats

Pour chaque plat, le gérant pourra définir :

Nom

Description

Photo

Prix

Jour

Stock disponible

Heure de début des commandes

Heure de fin des commandes

Statut

Exemple :

Thiéboudienne

Prix : 3 000 FCFA

Stock : 30 portions

Commandes ouvertes : 08h00

Commandes fermées : 14h00

8. Gestion des jus

Les jus fonctionneront selon une logique similaire.

Pour chaque jus :

Nom

Photo

Prix

Stock

Disponibilité

Heure limite éventuelle

Statut

Le gérant pourra donc gérer indépendamment le stock des plats et celui des jus.

9. Disponibilité dynamique des produits

La disponibilité d'un produit devra être déterminée par plusieurs conditions.

Un produit est disponible uniquement si :

Stock disponible > 0

ET

Heure actuelle < heure limite de commande

ET

Produit activé par le gérant

Si l'une de ces conditions n'est plus remplie, le produit devient indisponible.

10. Gestion du stock

Le stock sera associé à chaque produit pour chaque journée.

Exemple :

Lundi — Thiéboudienne

Stock initial :

30 portions

Commandes :

Client A → 2

Client B → 3

Client C → 5

Client D → 20

Stock restant :

0

Le système doit automatiquement considérer le produit comme épuisé.

Le client ne pourra plus ajouter ce plat à sa commande.

11. Produit épuisé

Lorsqu'un stock atteint zéro, le produit devra automatiquement passer en état :

Épuisé

Côté client, le produit pourra être affiché mais ne pourra plus être commandé.

Exemple :

Thiéboudienne

Épuisé

Le bouton « Commander » ou « Ajouter » sera désactivé.

Le produit pourra également apparaître visuellement grisé.

12. Gestion de l'heure limite

La disponibilité devra également dépendre de l'heure.

Exemple :

Le gérant définit :

Heure limite : 14h00

À 13h59 :

Le produit est commandable s'il reste du stock.

À partir de 14h00 :

Le produit devient automatiquement indisponible.

Même s'il reste encore 10 portions.

13. Exemple concret

Le gérant possède :

30 plats disponibles

Heure limite :

14h00

À 10h00

Il reste 30 plats.

Le produit est disponible.

À 12h00

20 plats ont été commandés.

Il reste :

10 plats

Le produit reste disponible.

À 13h30

Les 10 derniers plats sont commandés.

Stock :

0

Le produit devient automatiquement :

Épuisé

À 13h45

Même si le stock avait encore été disponible, le produit resterait commandable.

À 14h00

Les commandes sont automatiquement fermées.

Le produit devient :

Commandes fermées

14. Différence entre « épuisé » et « commandes fermées »

Le système devra distinguer les deux situations.

Épuisé

Le stock est arrivé à zéro.

Exemple :

Thiéboudienne — Épuisé

Commandes fermées

Le stock peut encore exister, mais l'heure limite est dépassée.

Exemple :

Thiéboudienne — Commandes fermées

Cette distinction permettra au gérant de comprendre pourquoi un produit n'est plus commandable.

15. Désactivation manuelle par le gérant

Le gérant devra pouvoir désactiver manuellement un produit.

Exemple :

Il reste 5 plats mais le gérant décide de fermer les commandes.

Il pourra sélectionner :

Désactiver

Le produit deviendra immédiatement indisponible côté client.

Le gérant pourra également le réactiver si nécessaire.

16. Griser les produits indisponibles

Lorsqu'un produit n'est plus disponible, l'interface client devra clairement le signaler.

Le produit pourra être affiché en version grisée.

Exemple :

[Photo grisée]

Thiéboudienne

3 000 FCFA

Épuisé

Le bouton :

Ajouter

sera désactivé.

Cela permet au client de comprendre que le plat existe mais qu'il n'est plus commandable.

17. Cas où l'heure est dépassée

Lorsqu'un client consulte le site après l'heure limite :

Le produit pourra apparaître comme :

Commandes fermées

et être automatiquement désactivé.

Il ne devra pas être possible de contourner cette règle depuis l'interface client.

La vérification devra également être effectuée côté serveur/backend.

18. Validation du stock lors de la commande

Le stock devra être vérifié au moment de la validation de la commande.

Exemple :

Il reste 2 portions.

Deux clients essaient de commander simultanément 2 portions chacun.

Le système devra empêcher qu'un total de 4 portions soit accepté alors que seulement 2 sont disponibles.

La réservation du stock devra être effectuée de manière sécurisée lors de la validation de la commande.

19. Commande client

Le client pourra commander pour un ou plusieurs jours.

Une même commande peut contenir :

Plusieurs plats.

Plusieurs jus.

Des produits associés à des jours différents.

Exemple :

Lundi

2 Thiéboudiennes

1 Yassa

Mardi

1 Mafé

Jus

2 Bissaps

1 Bouye

20. Informations client

Aucun compte client ne sera nécessaire.

Le client devra renseigner :

Nom

Prénom

Numéro de téléphone

Adresse de livraison

Des informations complémentaires pourront être ajoutées :

Complément d'adresse

Point de repère

Instructions de livraison

21. Récapitulatif de commande

Avant validation, le client devra voir :

Informations client

Nom

Prénom

Téléphone

Adresse

Produits

Jour

Produit

Quantité

Prix unitaire

Sous-total

Total

Le montant total sera calculé automatiquement.

22. Précommandes non remboursables

Avant validation, le client devra être informé que les précommandes sont non remboursables.

Exemple :

Important : toute précommande validée est non remboursable.

Le client devra confirmer cette condition.

J'ai pris connaissance et j'accepte que ma précommande soit non remboursable.

La validation de la commande ne sera possible qu'après acceptation.

23. Confirmation de commande

Après validation, une référence unique sera générée.

Exemple :

CMD-20260824-001

La confirmation affichera :

Référence

Nom

Prénom

Téléphone

Adresse

Jour

Produits

Quantités

Total

Statut

24. Gestion des commandes

Le gérant pourra consulter toutes les commandes depuis le back-office.

Les informations principales seront :

RéférenceClientTéléphoneAdresseJourProduitsTotalStatutCMD-001Awa Diop77 XX XX XXAlmadiesLundiThiéboudienne + Bissap7 000 FConfirmée

25. Statuts des commandes

Les statuts pourront être :

Nouvelle

Confirmée

En préparation

Prête

En livraison

Livrée

Annulée

Une commande annulée reste soumise à la politique de non-remboursement définie par le service.

26. Tableau de bord

Le gérant pourra visualiser :

Commandes

Nombre de commandes

Commandes nouvelles

Commandes confirmées

Commandes en préparation

Commandes en livraison

Commandes livrées

Production

Nombre total de repas

Quantité par plat

Quantité de jus

Produits épuisés

Livraison

Nombre de commandes à livrer

Nombre de clients

Liste des adresses

27. Vue de production

L'application devra proposer une synthèse des quantités à préparer.

Exemple :

Lundi

ProduitQuantitéThiéboudienne30Yassa22Mafé15Bissap25Bouye18

Total repas : 67

Total jus : 43

Cette vue pourra être imprimée.

28. Estimation des plats / plaques

Les précommandes permettront d'estimer le nombre de plats ou plaques nécessaires pour la livraison.

Le système devra agréger automatiquement les quantités commandées.

Le gérant pourra ainsi savoir :

Combien de repas préparer.

Combien de plats/plaques prévoir.

Combien de jus prévoir.

Combien de commandes individuelles préparer.

Cette information pourra être regroupée par jour.

29. Gestion des livraisons

Pour chaque commande, le gérant pourra consulter :

Référence

Nom

Prénom

Téléphone

Adresse

Jour

Produits

Quantités

Instructions éventuelles

La liste devra pouvoir être triée par jour.

30. Impression des commandes

Le gérant pourra imprimer :

Liste complète

Toutes les commandes.

Liste par jour

Exemple :

Commandes du lundi

Liste par période

Exemple :

Commandes du lundi au vendredi

Commande individuelle

Une seule commande.

31. Impression des stickers

L'application devra permettre d'imprimer des stickers destinés aux emballages.

Exemple :

LOGO

COMMANDE #CMD-001

Awa Diop

77 XX XX XX

Almadies, Dakar

LUNDI

2 × Thiéboudienne

2 × Bissap

Le format devra pouvoir être adapté aux dimensions de l'imprimante utilisée.

32. Impression groupée

Le gérant pourra sélectionner :

Imprimer les stickers du lundi

Le système générera une étiquette par commande.

Il pourra également sélectionner une période ou une liste de commandes.

33. Export Excel / CSV

Le gérant pourra exporter les données.

Les colonnes pourront comprendre :

Référence

Date de commande

Jour

Nom

Prénom

Téléphone

Adresse

Produit

Catégorie

Quantité

Prix

Total

Statut

34. Recherche

Recherche par :

Référence

Nom

Prénom

Téléphone

Adresse

35. Filtres

Filtres par :

Date

Jour

Semaine

Produit

Plat

Jus

Statut

Disponibilité

36. Gestion des stocks dans le back-office

Le gérant devra avoir une vue claire des stocks.

Exemple :

ProduitStock initialCommandéRestantStatutThiéboudienne30300ÉpuiséYassa402515DisponibleMafé20200ÉpuiséBissap503515Disponible

37. Gestion des horaires

Le gérant pourra définir une heure limite de commande.

Cette heure pourra être définie :

Pour un jour.

Pour un produit.

Selon les besoins du service.

Exemple :

Lundi — commandes jusqu'à 14h00

ou :

Thiéboudienne — commandes jusqu'à 13h00

La configuration devra être suffisamment flexible pour évoluer selon les besoins du traiteur.

38. Règle de disponibilité

La disponibilité finale d'un produit sera calculée selon la logique suivante :

Produit disponible si :

Le produit est activé.

Le jour est ouvert aux commandes.

L'heure limite n'est pas dépassée.

Le stock disponible est supérieur à zéro.

Produit indisponible si :

Le stock est égal à zéro.

OU l'heure limite est dépassée.

OU le gérant a désactivé le produit.

OU le jour est fermé.

Cette logique devra être appliquée côté client et côté serveur.

39. Gestion des semaines

Le gérant pourra :

Créer une semaine.

Modifier une semaine.

Ajouter les jours.

Ajouter les produits.

Publier le menu.

Modifier les disponibilités.

Fermer une journée.

Le menu pourra être préparé à l'avance.

40. Historique

Les anciennes commandes devront être conservées.

Le gérant pourra consulter :

Semaine actuelle.

Semaines précédentes.

Mois précédent.

Période personnalisée.

41. Authentification du gérant

Le gérant devra disposer d'un compte sécurisé.

Fonctionnalités :

Connexion.

Déconnexion.

Modification du mot de passe.

Réinitialisation du mot de passe.

Gestion de session.

Le client ne possède pas de compte.

42. Identité visuelle

L'application devra reprendre l'identité visuelle du logo du traiteur.

La couleur principale du logo étant orientée vers le marron, cette couleur devra constituer la base de l'identité graphique du site.

La palette devra être chaleureuse et adaptée à l'univers de la restauration.

Palette indicative

CouleurUtilisationMarron du logoCouleur principaleMarron clairÉléments secondairesTerracottaAccentsBeige / crèmeArrière-plansBlancContenus et cartesGris foncéTexte

La couleur exacte du marron devra être récupérée à partir du logo afin d'assurer une cohérence parfaite.

43. Direction artistique

L'interface devra être :

Chaleureuse.

Moderne.

Élégante.

Gourmande.

Professionnelle.

Simple.

Le design devra mettre en valeur les photos des plats.

L'utilisation de fonds beige/crème et de surfaces blanches permettra de conserver une interface lumineuse malgré l'utilisation du marron.

44. Sécurité

Le système devra notamment prévoir :

HTTPS.

Authentification sécurisée.

Hashage des mots de passe.

Gestion des sessions.

Protection des APIs.

Validation des données côté serveur.

Contrôle des permissions.

Protection contre les commandes frauduleuses.

Vérification du stock côté serveur.

Vérification de l'heure limite côté serveur.

La vérification du stock et de l'heure ne devra jamais dépendre uniquement de l'interface web.

45. Gestion des erreurs

Le système devra gérer :

Stock épuisé.

Heure limite dépassée.

Produit désactivé.

Jour fermé.

Quantité insuffisante.

Erreur réseau.

Erreur serveur.

Commande impossible.

Informations client manquantes.

Exemple :

Désolé, ce plat vient d'être épuisé. Veuillez choisir un autre plat.

Si le stock est devenu insuffisant entre l'affichage du panier et la validation, la commande devra être recalculée avant validation.

46. Paiement en ligne — évolution future

Le paiement en ligne ne sera pas intégré dans le MVP.

L'architecture devra néanmoins prévoir son intégration.

La commande pourra ultérieurement être associée à :

Un moyen de paiement.

Une référence de transaction.

Un montant payé.

Un statut de paiement.

Statuts :

Non payé

En attente

Payé

Échec

Remboursé

47. Notifications — évolution future

Des notifications pourront être ajoutées :

Confirmation de commande.

Nouvelle commande pour le gérant.

Commande prête.

Commande en livraison.

Confirmation de livraison.

Canaux possibles :

Email

SMS

WhatsApp

Notification web

48. Architecture des données

Semaine

ID

Date début

Date fin

Statut

Date publication

Jour

ID

Date

Semaine

Statut

Heure ouverture

Heure fermeture

Produit

ID

Nom

Description

Photo

Catégorie

Prix

Produit du jour

ID

Jour

Produit

Prix

Stock initial

Stock réservé/commandé

Stock restant

Heure ouverture

Heure fermeture

Statut

Activation manuelle

Cette structure permettra d'avoir plusieurs plats et plusieurs produits différents pour une même journée.

Commande

ID

Référence

Nom

Prénom

Téléphone

Adresse

Total

Statut

Date de création

Ligne de commande

ID

Commande

Produit

Jour

Quantité

Prix unitaire

Montant

Paiement — futur

ID

Commande

Moyen de paiement

Référence transaction

Montant

Statut

49. Première version — MVP

Client

Consultation du menu

Plusieurs plats par jour

Nombre de plats variable

Consultation des jus

Sélection des produits

Sélection des quantités

Commande sur plusieurs jours

Nom

Prénom

Téléphone

Adresse

Récapitulatif

Acceptation du caractère non remboursable

Validation

Référence de commande

Disponibilité

Gestion du stock

Décrémentation du stock

Détection automatique du stock épuisé

Gestion de l'heure limite

Fermeture automatique à l'heure définie

Désactivation manuelle par le gérant

Affichage grisé des produits indisponibles

Vérification du stock côté serveur

Back-office

Authentification

Tableau de bord

Gestion des semaines

Gestion des jours

Gestion des plats

Gestion des jus

Gestion des stocks

Gestion des horaires

Activation/désactivation des produits

Gestion des commandes

Gestion des statuts

Recherche

Filtres

Historique

Calcul des quantités

Estimation des plats/plaques

Export Excel

Export CSV

Impression des commandes

Impression par jour

Impression par période

Impression individuelle

Impression des stickers

Impression groupée

50. Évolutions futures

Paiement en ligne

Mobile Money

Carte bancaire

Notifications SMS

Notifications WhatsApp

Suivi de livraison

Gestion des livreurs

Géolocalisation

Plusieurs comptes administrateurs

Gestion des rôles

Comptes clients

Historique client

Fidélité

Promotions

Statistiques avancées

51. Critères de réussite

La première version sera considérée comme fonctionnelle lorsque :

Le gérant peut créer une semaine.

Il peut ajouter autant de plats qu'il souhaite par jour.

Il peut ajouter des jus.

Le client peut commander sans compte.

Le client peut commander plusieurs produits.

Le client peut commander pour plusieurs jours.

Le client peut renseigner ses informations de livraison.

Le système calcule automatiquement le montant.

Le client accepte la politique de non-remboursement.

Une référence unique est générée.

Le stock est automatiquement décrémenté.

Un produit devient automatiquement épuisé lorsque le stock atteint zéro.

Un produit devient automatiquement indisponible lorsque l'heure limite est dépassée.

Un produit indisponible est clairement affiché au client et son bouton de commande est désactivé.

Le gérant peut désactiver manuellement un produit.

Le système vérifie le stock et l'heure limite côté serveur.

Le gérant peut connaître le nombre total de repas à préparer.

Le gérant peut connaître les quantités par plat.

Le gérant peut connaître les quantités de jus.

Le gérant peut estimer le nombre de plats/plaques à prévoir.

Le gérant peut consulter les adresses de livraison.

Le gérant peut imprimer toutes les commandes.

Le gérant peut imprimer des stickers.

Le gérant peut exporter les commandes en Excel/CSV.

L'architecture permet d'ajouter ultérieurement le paiement en ligne.

52. Résumé du fonctionnement

Côté client

Accéder au site

↓

Consulter le menu de la semaine

↓

Choisir un jour

↓

Voir les plats disponibles

↓

Choisir les plats et quantités

↓

Ajouter éventuellement des jus

↓

Vérification automatique de la disponibilité

↓

Renseigner nom, prénom, téléphone et adresse

↓

Récapitulatif

↓

Accepter la condition de non-remboursement

↓

Valider la précommande

↓

Recevoir la référence de commande

Côté gérant

Connexion

↓

Créer la semaine

↓

Ajouter les jours

↓

Ajouter autant de plats et de jus que nécessaire

↓

Définir les stocks

↓

Définir les horaires de commande

↓

Publier le menu

↓

Recevoir les précommandes

↓

Suivre automatiquement les stocks

↓

Fermeture automatique lorsque le stock est épuisé ou lorsque l'heure limite est dépassée

↓

Possibilité de fermer manuellement un produit

↓

Voir les quantités à préparer

↓

Voir les quantités de plats/plaques et de jus

↓

Voir les informations de livraison

↓

Imprimer les listes

↓

Imprimer les stickers

↓

Organiser les livraisons

↓

Mettre à jour les statuts

↓

Exporter les données

53. Conclusion

L'application sera un outil central permettant au traiteur de gérer l'ensemble du cycle de précommande, depuis la publication du menu jusqu'à la préparation et à la livraison.

Le système devra particulièrement prendre en compte la gestion dynamique de la disponibilité.

Un produit pourra devenir indisponible pour trois raisons principales :

Le stock est épuisé.



Le gérant a désactivé manuellement le produit.

Dans les trois cas, le client devra voir clairement que le produit n'est plus commandable et ne pourra pas l'ajouter à une nouvelle commande.

La gestion du stock et des horaires devra être contrôlée à la fois par l'interface et par le backend afin d'éviter les commandes dépassant les quantités réellement disponibles.

Le système permettra ainsi au traiteur de connaître précisément, grâce aux précommandes, combien de repas préparer, combien de plats/plaques prévoir, combien de jus préparer et quels clients livrer, tout en simplifiant la gestion quotidienne des commandes.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7bf22b06-c961-41b0-9775-7e7cbed18f0e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
