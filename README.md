# ⚽ Wydad Pronostics

Application web de pronostics sportifs pour le Wydad Athletic Club.

## 🚀 Installation et Lancement

### Prérequis
- Node.js installé
- MongoDB installé et lancé (ou une URL MongoDB Atlas)

### 1. Backend (Serveur API)
```bash
cd backend
npm install
# Copier .env.example vers .env
cp .env.example .env
# Peupler la base de données avec des matchs (une seule fois)
node src/seed.js
# Lancer le serveur
npm run dev
```
Le backend sera accessible sur `http://localhost:5000`.

### 2. Frontend (Application React)
```bash
cd frontend
npm install
# Lancer l'application
npm run dev
```
Le frontend sera accessible sur `http://localhost:5173`.

## 🧪 Guide de Test

Voici comment tester les fonctionnalités de l'application :

1.  **Inscription** :
    - Allez sur `http://localhost:5173`.
    - Cliquez sur **"Pas de compte ? S'inscrire"**.
    - Créez un compte (ex: `testuser / test@test.com / 123456`).

2.  **Création de Ligue** :
    - Une fois connecté, cliquez sur **"Créer une nouvelle ligue"**.
    - Donnez un nom (ex: "Ligue des Champions") et validez.
    - Vous verrez votre nouvelle ligue dans la liste.

3.  **Faire un Pronostic** :
    - Cliquez sur **"Accéder à la ligue"**.
    - Vous verrez la liste des matchs (ajoutés via le script `seed.js`).
    - Cliquez sur **"Faire mon pronostic"** pour le match Wydad vs Raja.
    - Entrez un score (ex: 2-1 pour le Wydad), choisissez le résultat "Victoire", et sélectionnez des buteurs.
    - Validez.

4.  **Classement** :
    - Retournez à la liste des ligues ou des matchs.
    - Cliquez sur **"Classement"**.
    - Pour l'instant, vous aurez 0 points car le match n'est pas "terminé" et aucun résultat réel n'a été saisi.
    - *Note : Pour tester le calcul des points, il faudrait entrer un résultat réel via l'API ou créer une interface d'administration simple.*

## 🛠️ Stack Technique

- **Frontend** : React, Vite, Tailwind CSS, Zustand, Lucide React
- **Backend** : Node.js, Express, MongoDB, Mongoose, JWT
