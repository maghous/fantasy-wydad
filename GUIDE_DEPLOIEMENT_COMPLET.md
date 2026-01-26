# 🚀 Guide Complet de Déploiement - Wydad Pronostics

## 📋 Analyse de votre Application

Votre application est composée de :
- **Backend** : Node.js + Express + MongoDB (API REST)
- **Frontend** : React + Vite + Tailwind CSS
- **Base de données** : MongoDB (nécessite MongoDB Atlas en production)

## ⚠️ Pourquoi ça ne marche pas sur Vercel ?

Vercel est **optimisé pour les applications frontend** et les **fonctions serverless**. Le problème principal :

1. **Vercel ne peut pas exécuter un serveur Express traditionnel** en continu
2. Votre backend utilise `app.listen()` qui nécessite un serveur toujours actif
3. Les deux projets (backend/frontend) dans le même repo nécessitent une configuration spéciale

## ✅ Solutions Gratuites (3 Options)

---

## 🎯 **SOLUTION 1 : Backend sur Render + Frontend sur Vercel** (RECOMMANDÉ)

C'est la solution la plus simple et la plus fiable !

### Étape 1 : Préparer MongoDB Atlas (Gratuit)

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Créez un compte gratuit
3. Créez un cluster **M0 (Free)**
4. Dans **Database Access** : Créez un utilisateur (ex: `wydaduser` / mot de passe fort)
5. Dans **Network Access** : Ajoutez `0.0.0.0/0` (autoriser toutes les IPs)
6. Cliquez sur **Connect** → **Drivers** → Copiez l'URI de connexion
   ```
   mongodb+srv://wydaduser:<password>@cluster0.xxxxx.mongodb.net/wydad-pronostics?retryWrites=true&w=majority
   ```
7. Remplacez `<password>` par votre vrai mot de passe

### Étape 2 : Déployer le Backend sur Render

1. Allez sur [Render.com](https://render.com) et créez un compte
2. Cliquez sur **New +** → **Web Service**
3. Connectez votre dépôt GitHub `Fantasywydad`
4. **Configuration** :
   - **Name** : `wydad-backend` (ou autre nom)
   - **Region** : Frankfurt (ou le plus proche)
   - **Root Directory** : `backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : **Free**

5. **Variables d'environnement** (Section "Environment") :
   ```
   MONGODB_URI=mongodb+srv://wydaduser:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/wydad-pronostics
   JWT_SECRET=votre_secret_jwt_super_securise_123456
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://votre-app-frontend.vercel.app
   ```

6. Cliquez sur **Create Web Service**
7. Attendez le déploiement (5-10 minutes)
8. **Notez l'URL** fournie : `https://wydad-backend.onrender.com`

> [!IMPORTANT]
> Render met le service en veille après 15 minutes d'inactivité (plan gratuit). Le premier chargement peut prendre 30-60 secondes.

### Étape 3 : Déployer le Frontend sur Vercel

1. Allez sur [Vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **Add New...** → **Project**
3. Importez votre repo GitHub `Fantasywydad`
4. **Configuration** :
   - **Project Name** : `fantasy-wydad`
   - **Framework Preset** : `Vite`
   - **Root Directory** : Cliquez sur **Edit** → Sélectionnez `frontend`
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `dist` (par défaut)

5. **Variables d'environnement** :
   ```
   VITE_API_URL=https://wydad-backend.onrender.com
   ```
   ⚠️ **Pas de `/` à la fin !**

6. Cliquez sur **Deploy**
7. Attendez 2-3 minutes
8. Votre app sera disponible sur : `https://fantasy-wydad.vercel.app`

### Étape 4 : Mettre à jour le CORS du Backend

Une fois le frontend déployé, retournez sur **Render** :

1. Allez dans votre service backend
2. **Environment** → Modifiez `FRONTEND_URL` :
   ```
   FRONTEND_URL=https://fantasy-wydad.vercel.app
   ```
3. Sauvegardez (le service redémarrera automatiquement)

### ✅ C'est terminé !

Votre application est en ligne :
- **Frontend** : https://fantasy-wydad.vercel.app
- **Backend** : https://wydad-backend.onrender.com
- **Base de données** : MongoDB Atlas

---

## 🎯 **SOLUTION 2 : Backend + Frontend sur Vercel** (Serverless)

Cette solution transforme votre backend Express en **fonctions serverless**.

### ⚠️ Limitations importantes :
- Les fonctions serverless ont un **timeout de 10 secondes** (plan gratuit)
- Pas de connexions persistantes (chaque requête = nouvelle connexion DB)
- Plus complexe à déboguer

### Configuration requise

#### 1. Créer un fichier `api/index.js` à la racine du projet

```javascript
// api/index.js
const app = require('../backend/src/server');

module.exports = app;
```

#### 2. Créer `vercel.json` à la racine du projet

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

#### 3. Modifier `backend/src/server.js`

Assurez-vous que le fichier exporte `app` :

```javascript
// À la fin du fichier
module.exports = app;

// Démarrer le serveur seulement en local
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
```

#### 4. Déployer sur Vercel

1. Allez sur Vercel → **New Project**
2. Importez votre repo
3. **Root Directory** : Laissez vide (racine du projet)
4. **Variables d'environnement** :
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=votre_secret
   VITE_API_URL=/api
   ```
5. Déployez

> [!WARNING]
> Cette solution est **plus fragile** car les fonctions serverless ont des limitations. Préférez la Solution 1 pour plus de stabilité.

---

## 🎯 **SOLUTION 3 : Alternatives Gratuites**

Si Render ou Vercel ne fonctionnent pas, voici d'autres options :

### Backend

| Plateforme | Avantages | Inconvénients |
|------------|-----------|---------------|
| **Railway.app** | 500h gratuites/mois, très simple | Nécessite carte bancaire |
| **Fly.io** | Gratuit jusqu'à 3 apps | Configuration plus complexe |
| **Cyclic.sh** | Spécialisé Node.js | Limitations sur les requêtes |
| **Glitch.com** | Très simple | Se met en veille rapidement |

### Frontend

| Plateforme | Avantages | Inconvénients |
|------------|-----------|---------------|
| **Vercel** | Le meilleur pour React/Vite | - |
| **Netlify** | Très bon aussi | Limite de build minutes |
| **Cloudflare Pages** | CDN ultra-rapide | Configuration différente |
| **GitHub Pages** | Gratuit illimité | Pas de variables d'env serveur |

---

## 🔧 Configuration Finale Recommandée

### Structure de votre projet GitHub

```
Fantasywydad/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env.example
└── README.md
```

### Fichiers `.env.example` à créer

**backend/.env.example** :
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

**frontend/.env.example** :
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🐛 Dépannage

### Problème : "CORS Error" dans le navigateur

**Solution** : Vérifiez que `FRONTEND_URL` dans le backend correspond exactement à l'URL de votre frontend Vercel.

### Problème : "Cannot connect to MongoDB"

**Solutions** :
1. Vérifiez que l'IP `0.0.0.0/0` est autorisée dans MongoDB Atlas
2. Vérifiez que le mot de passe dans `MONGODB_URI` ne contient pas de caractères spéciaux (ou encodez-les)
3. Testez la connexion avec MongoDB Compass

### Problème : Backend Render très lent au premier chargement

**Explication** : C'est normal avec le plan gratuit. Le service se met en veille après 15 minutes d'inactivité.

**Solutions** :
- Utilisez un service de "ping" gratuit comme [UptimeRobot](https://uptimerobot.com) pour garder le service actif
- Affichez un message de chargement sur le frontend

### Problème : "Build failed" sur Vercel

**Solutions** :
1. Vérifiez que `package.json` contient bien `"build": "vite build"`
2. Vérifiez que toutes les dépendances sont dans `dependencies` (pas `devDependencies`)
3. Regardez les logs détaillés dans Vercel

---

## 📝 Checklist de Déploiement

- [ ] MongoDB Atlas configuré avec utilisateur et IP autorisée
- [ ] Backend déployé sur Render avec variables d'environnement
- [ ] URL du backend notée
- [ ] Frontend déployé sur Vercel avec `VITE_API_URL` configurée
- [ ] CORS configuré dans le backend avec l'URL du frontend
- [ ] Test de connexion : inscription d'un utilisateur
- [ ] Test de création de ligue
- [ ] Test de pronostic

---

## 🎉 Résultat Final

Avec la **Solution 1 (Recommandée)** :

```
✅ Base de données : MongoDB Atlas (Gratuit - 512 MB)
✅ Backend API : Render (Gratuit - 750h/mois)
✅ Frontend : Vercel (Gratuit - Illimité)
✅ HTTPS automatique sur tous les services
✅ Déploiement automatique à chaque push Git
```

**Coût total : 0€ / mois** 🎊

---

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs sur Render (onglet "Logs")
2. Vérifiez les logs sur Vercel (onglet "Deployments" → "View Function Logs")
3. Testez votre backend directement : `https://votre-backend.onrender.com/api/auth/test`
4. Utilisez les outils de développement du navigateur (F12 → Console/Network)

Bonne chance avec votre déploiement ! ⚽🎯
