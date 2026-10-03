# Déploiement (Vercel)

Le site client et l'espace gérant sont **deux applications séparées**, déployées comme **deux projets
Vercel** depuis le même dépôt GitHub. Elles utilisent la même base Supabase.

| Projet Vercel | Dossier racine (« Root Directory ») | Adresse (exemple) |
| --- | --- | --- |
| Site client | `apps/site` | `ndellis.sn` |
| Espace gérant | `apps/admin` | `admin.ndellis.sn` |

Vercel détecte l'espace de travail (bun) et installe les dépendances depuis la racine du dépôt.
Le build (`vite build`) produit automatiquement la sortie Vercel (Nitro, preset `vercel`).

## Mise en place (une fois)

1. **Projet existant → site client** : *Settings › General › Root Directory* = `apps/site`.
2. **Nouveau projet → espace gérant** : *Add New › Project*, même dépôt GitHub,
   *Root Directory* = `apps/admin`.
3. **Variables d'environnement** de chaque projet (*Settings › Environment Variables*) :

| Variable | Site | Admin | Rôle |
| --- | :---: | :---: | --- |
| `VITE_SUPABASE_URL`, `SUPABASE_URL` | ✅ | ✅ | Adresse de la base Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PUBLISHABLE_KEY` | ✅ | ✅ | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | Clé serveur (secrète) : paiement côté site, notifications côté admin |
| `PAYDUNYA_MASTER_KEY`, `PAYDUNYA_PRIVATE_KEY`, `PAYDUNYA_TOKEN` | ✅ | | Paiement PayDunya |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | | ✅ | Notifications push du gérant |
| `PUSH_WEBHOOK_SECRET` | | ✅ | Protège le webhook des notifications |
| `VITE_SITE_URL` | | ✅ | Adresse du site client (lien « Voir le site client ») |

4. **Webhook des notifications** : dans Supabase (*Database › Webhooks*), l'adresse doit pointer vers
   l'**espace gérant** : `https://<admin>/api/public/push-webhook` (elle pointait vers le site avant
   la séparation).
5. **Supabase › Authentication › URL Configuration** : ajouter l'adresse de l'espace gérant dans les
   *Redirect URLs* (confirmation d'e-mail, mot de passe oublié).
6. **PayDunya** : l'adresse de notification (IPN) reste celle du site client :
   `https://<site>/api/public/paydunya-ipn`.

## Branches

- Chaque projet Vercel déploie la branche configurée dans *Settings › Git › Production Branch*.
- Une modification dans `packages/` ou `supabase/` concerne les deux applications : les deux projets
  redéploient.

## En local

```bash
npm install          # à la racine
npm run dev:site     # http://localhost:8080
npm run dev:admin    # http://localhost:8081
```

Le fichier `.env` à la racine est lu par les deux applications.
