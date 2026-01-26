# 🚀 Guide de Déploiement - Wydad Pronostics

## 🚀 Déploiement Automatisé (Recommandé)
J'ai ajouté un fichier `render.yaml` à la racine. Pour déployer le backend sur Render :
1. Allez sur votre tableau de bord Render.
2. Cliquez sur **New +** > **Blueprint**.
3. Connectez votre dépôt GitHub.
4. Render configurera automatiquement le serveur **ET** le disque persistant pour vos logos.

Pour inviter vos amis, vous devez mettre l'application en ligne. Voici la méthode la plus simple et gratuite.

## ⚠️ Prérequis Important : La Base de Données

Actuellement, nous utilisons des fichiers JSON pour stocker les données. Sur les hébergeurs gratuits, **ces fichiers sont effacés à chaque redémarrage**.
Pour que vos amis gardent leurs comptes et pronostics, **vous DEVEZ utiliser MongoDB Atlas (Cloud Gratuit)**.

### Étape 1 : Créer une base de données MongoDB Atlas (Gratuit)
1.  Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2.  Créez un compte et choisissez l'option **FREE (M0)**.
3.  Créez un Cluster (Laissez les options par défaut).
4.  Dans "Security" > "Database Access", créez un utilisateur (ex: `admin`) avec un mot de passe.
5.  Dans "Security" > "Network Access", ajoutez l'adresse IP `0.0.0.0/0` (pour autoriser l'accès de partout).
6.  Cliquez sur "Connect" > "Drivers" et copiez l'URL de connexion (ex: `mongodb+srv://admin:<password>@cluster0.mongodb.net/...`).
7.  **Gardez cette URL précieusement.**

---

## Étape 2 : Déployer le Backend (Vercel - Gratuit)

1.  Assurez-vous que votre code est sur GitHub.
2.  Allez sur [Vercel](https://vercel.com) et connectez-vous.
3.  Cliquez sur "Add New..." > "Project".
4.  Importez votre dépôt GitHub `Fantasywydad`.
5.  **Configuration** :
    *   **Root Directory** : Cliquez sur "Edit" et sélectionnez le dossier `backend`.
    *   **Framework Preset** : Other (Laissez par défaut ou "Other").
6.  **Variables d'environnement** :
    *   `MONGODB_URI` : Collez l'URL de votre MongoDB Atlas.
    *   `JWT_SECRET` : Votre secret JWT.
7.  Cliquez sur "Deploy".
8.  **Notez l'URL fournie par Vercel** (ex: `https://fantasywydad-backend.vercel.app`).

---

## Étape 3 : Déployer le Frontend (Vercel)

1.  Retournez sur le tableau de bord Vercel.
2.  Cliquez sur "Add New..." > "Project".
3.  Importez **le même dépôt GitHub**.
4.  **Configuration** :
    *   **Root Directory** : Cliquez sur "Edit" et sélectionnez le dossier `frontend`.
    *   **Framework Preset** : Vite.
5.  **Variables d'environnement** :
    *   `VITE_API_URL` : Collez l'URL de votre **Backend Vercel** que vous venez de créer (ex: `https://fantasywydad-backend.vercel.app`).
        *   ⚠️ **Important** : N'ajoutez pas de `/` à la fin de l'URL.
6.  Cliquez sur "Deploy".

---

## 🎉 C'est fini !

Vous avez maintenant :
*   Base de données : **MongoDB Atlas** (Gratuit)
*   Backend : **Vercel** (Gratuit)
*   Frontend : **Vercel** (Gratuit)
