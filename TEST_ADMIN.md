# 🔐 Guide de Test de l'Administration

Maintenant que votre application est en ligne, voici comment activer et tester les fonctionnalités d'administration (gestion des matchs et résultats).

## Étape 1 : Promouvoir votre compte en "Admin"

Pour des raisons de sécurité, vous ne pouvez pas devenir admin directement depuis l'interface. Vous devez utiliser le script de promotion que j'ai trouvé dans votre code.

1.  **Inscrivez-vous normalement** sur votre site de production (Vercel).
2.  Ouvrez un terminal sur votre ordinateur (dans le dossier du projet).
3.  Exécutez la commande suivante en remplaçant par votre email :
    ```bash
    cd backend
    node src/utils/promoteAdmin.js VOTRE_EMAIL@exemple.com
    ```
    > [!NOTE]
    > Assurez-vous que votre fichier `backend/.env` contient le bon `MONGODB_URI` de production (Atlas) pour que la modification soit appliquée en ligne.

---

## Étape 2 : Accéder au Dashboard Admin

1.  Une fois promu, **déconnectez-vous et reconnectez-vous** sur votre site.
2.  Vous verrez apparaître un nouveau lien **"Admin"** dans la barre de navigation.
3.  Cliquez dessus pour accéder au **"ADMIN CENTRAL"**.

---

## Étape 3 : Tester les fonctionnalités Admin

Voici ce que vous pouvez tester dans le dashboard :

### 1. Envoi de rappels
- Sélectionnez un match à venir.
- Cliquez sur **"Rappel Pronos"**. Cela simulera l'envoi de notifications aux utilisateurs.

### 2. Saisie d'un résultat officiel (Le plus important !)
C'est ici que vous validez les scores pour calculer les points de tout le monde :

1.  Sélectionnez un match terminé.
2.  Entrez le **Score du Wydad** et le **Score de l'adversaire**.
3.  **Ajoutez les événements du match** :
    - Choisissez le buteur dans la liste.
    - Entrez la minute du but.
    - Cliquez sur **"Ajouter Événement"**.
4.  Vérifiez le **"Barème à Valider"** à droite (il calcule automatiquement les bonus : premier buteur, doublé, etc.).
5.  Cliquez sur **"Publier Résultats"**.

---

## Étape 4 : Vérifier l'impact sur le site

Une fois le résultat publié :
1.  Allez sur la page **Classement**.
2.  Vérifiez que les points des utilisateurs ont été mis à jour automatiquement.
3.  Allez sur la page **Ligue** et vérifiez que le match s'affiche comme "Terminé" avec le bon score.

---

## 🛠️ En cas de besoin de réinitialisation

Si vous voulez recommencer vos tests à zéro :
- Vous pouvez vider les collections `results` et `predictions` directement dans votre interface MongoDB Atlas.
- Le script `node src/seed.js` peut aussi être utilisé pour remettre des matchs propres.

Félicitations pour la mise en ligne ! ⚽🔥
