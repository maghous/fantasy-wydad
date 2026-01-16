# 🚀 Guide de Déploiement - Wydad Pronostics

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

## Étape 2 : Déployer le Backend (Render.com)

1.  Créez un compte sur [Render](https://render.com).
2.  Cliquez sur "New +" > "Web Service".
3.  Connectez votre compte GitHub et sélectionnez votre dépôt (il faudra d'abord mettre votre code sur GitHub).
4.  **Configuration** :
    *   **Name** : `wydad-backend`
    *   **Root Directory** : `backend`
    *   **Environment** : `Node`
    *   **Build Command** : `npm install`
    *   **Start Command** : `node src/server.js`
5.  **Variables d'environnement** (Section "Environment Variables") :
    *   `MONGODB_URI` : Collez l'URL de votre MongoDB Atlas (Étape 1).
    *   `JWT_SECRET` : Mettez un mot de passe compliqué (ex: `votre_secret_tres_long`).
6.  Cliquez sur "Create Web Service".
7.  **Notez l'URL de votre backend** (ex: `https://wydad-backend.onrender.com`).

---

## Étape 3 : Déployer le Frontend (Vercel)

1.  Créez un compte sur [Vercel](https://vercel.com).
2.  Cliquez sur "Add New..." > "Project".
3.  Importez votre dépôt GitHub.
4.  **Configuration** :
    *   **Framework Preset** : Vite
    *   **Root Directory** : Cliquez sur "Edit" et sélectionnez le dossier `frontend`.
5.  **Variables d'environnement** :
    *   `VITE_API_URL` : Collez l'URL de votre backend Render (ex: `https://wydad-backend.onrender.com`).
6.  Cliquez sur "Deploy".

---

## 🎉 C'est fini !

Vercel vous donnera un lien (ex: `https://fantasywydad.vercel.app`).
Envoyez ce lien à vos amis pour qu'ils s'inscrivent !

### 💡 Note pour le Backend
Sur Render version gratuite, le serveur "s'endort" après 15 min d'inactivité. Le premier chargement peut prendre 30 à 50 secondes. C'est normal !
