# MachineCare API

> **API REST sécurisée pour la gestion du parc de machines industrielles, la déclaration d'incidents et le suivi de leur résolution en atelier.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Protected-orange.svg)](https://jwt.io/)

---

## Table des Matières
1. [Présentation du Projet](#-présentation-du-projet)
2. [Architecture MVC Modulaire](#-architecture-du-projet)
3. [Démarrage Rapide avec Docker](#-démarrage-rapide-avec-docker)
4. [Variables d'Environnement](#-variables-denvironnement)
5. [Documentation des Endpoints REST](#-documentation-des-endpoints-rest)
6. [Règles Métier & Sécurité](#-règles-métier--sécurité)
7. [Gestion Centralisée des Erreurs](#-gestion-centralisée-des-erreurs)
8. [Collection de Tests Postman](#-tests--collection-postman)
9. [Workflow Git & Branches](#-workflow-git)

---

## Présentation du Projet

**MachineCare** est une solution backend robuste conçue pour optimiser la maintenance assistée par ordinateur (GMAO) dans les ateliers industriels. L'API permet d'inventorier les machines, de notifier les pannes en temps réel, d'attribuer les interventions aux équipes techniques et d'archiver les résolutions d'incidents.

---

## Architecture du Projet

L'API adopte une architecture modulaire en couches respectant le principe de responsabilité unique (SRP) :

```text
MachineCare/
├── src/
│   ├── config/          # Configuration de la base de données MongoDB (Mongoose)
│   ├── controllers/     # Contrôleurs HTTP (Auth, Machines, Breakdowns)
│   ├── middlewares/     # JWT Auth, Validation ObjectId, Gestionnaire global d'erreurs
│   ├── models/          # Schémas Mongoose (User, Machine, Breakdown)
│   ├── routes/          # Définition et routage des endpoints Express
│   ├── services/        # Logique métier (Auth token, Seeding automatique)
│   ├── utils/           # Classe d'erreur AppError, wrapper catchAsync
│   ├── app.js           # Configuration de l'application Express et des middlewares
│   └── server.js        # Point d'entrée et démarrage du serveur HTTP
├── docker-compose.yml   # Orchestration multi-conteneurs (API + MongoDB + Volumes)
├── Dockerfile           # Image Docker Alpine optimisée pour Node.js
├── MachineCare.postman_collection.json # Collection de tests Postman complète
└── package.json         # Dépendances et scripts de démarrage
```

---

## Démarrage Rapide avec Docker

Le projet est entièrement conteneurisé et s'exécute en une seule commande sans nécessiter l'installation préalable de Node.js ou de MongoDB sur votre machine hôte.

### 1. Cloner le dépôt Git
```bash
git clone https://github.com/haddadaziz/MachineCare.git
cd MachineCare
```

### 2. Configurer les variables d'environnement
Créez un fichier `.env` à la racine (ou copiez `.env.example`) :
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://mongo:27017/machinecare
JWT_SECRET=machinecare_super_secret_jwt_key_2026
ADMIN_EMAIL=admin@machinecare.com
ADMIN_PASSWORD=Admin1234!
```

### 3. Lancer l'application
```bash
docker compose up --build -d
```

* **API REST :** Accessible sur `http://localhost:5000`
* **MongoDB :** Accessible sur `localhost:27017`
* **Auto-Seeding :** Au tout premier démarrage, un compte administrateur est automatiquement injecté si la base est vide :
  * **Email :** `admin@machinecare.com`
  * **Mot de passe :** `Admin1234!`

---

## Variables d'Environnement

| Variable | Description | Valeur par défaut |
| :--- | :--- | :--- |
| `PORT` | Port d'écoute du serveur HTTP | `5000` |
| `NODE_ENV` | Environnement d'exécution (`development` / `production`) | `development` |
| `MONGO_URI` | Chaîne de connexion MongoDB (utilise le service Docker `mongo`) | `mongodb://mongo:27017/machinecare` |
| `JWT_SECRET` | Clé secrète pour la signature des jetons JWT | Clé de signature aléatoire |
| `ADMIN_EMAIL` | Email du compte administrateur créé par seed | `admin@machinecare.com` |
| `ADMIN_PASSWORD` | Mot de passe du compte administrateur initial | `Admin1234!` |

---

## Documentation des Endpoints REST

Toutes les routes protégées nécessitent l'en-tête HTTP : `Authorization: Bearer <votre_token_jwt>`.

### 1. Surveillance & Santé
| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Vérification de la disponibilité du serveur |

### 2. Authentification & Profil (`/api/auth`)
| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authentification et génération du token JWT |
| `POST` | `/api/auth/register` | Public | Inscription d'un nouvel utilisateur (`operateur` ou `technicien`) |
| `GET` | `/api/auth/me` | Privé (JWT) | Consultation du profil de l'utilisateur connecté |
| `PUT` | `/api/auth/me` | Privé (JWT) | Mise à jour de ses informations (rehachage auto si mot de passe) |

### 3. Parc des Machines (`/api/machines`)
| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/machines` | Privé (JWT) | Créer une machine (Validation d'unicité de la référence) |
| `GET` | `/api/machines` | Privé (JWT) | Lister les machines (Filtres : `?atelier=...&etat=...`) |
| `GET` | `/api/machines/:id` | Privé (JWT) | Consulter les détails d'une machine |
| `PUT` | `/api/machines/:id` | Privé (JWT) | Modifier les informations d'une machine |
| `DELETE` | `/api/machines/:id` | Privé (JWT) | Supprimer une machine (Vérification stricte de dépendances) |
| `GET` | `/api/machines/:id/breakdowns` | Privé (JWT) | Consulter l'historique complet des pannes d'une machine |

### 4. Cycle de Vie des Pannes (`/api/breakdowns`)
| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/breakdowns` | Privé (JWT) | Signaler un incident (Attribution auto du déclarant) |
| `GET` | `/api/breakdowns` | Privé (JWT) | Lister les signalements (Filtres : `?machine=...&statut=...`) |
| `PATCH` | `/api/breakdowns/:id/status` | Privé (JWT) | Faire évoluer le statut (`en attente` ➔ `en cours` ➔ `resolu`) |

---

## Règles Métier & Sécurité

1. **Protection des Mots de Passe (`select: false`) :**  
   Les mots de passe sont hachés avec un sel fort via `bcryptjs`. Le schéma Mongoose exclut par défaut le hash des requêtes de lecture pour prévenir toute fuite de données (conforme OWASP).
2. **Unicité des Références Machines :**  
   Chaque machine possède une référence unique indexée en majuscules (ex. `PRS-001`). Toute tentative de création d'un doublon est immédiatement interceptée et renvoie un code **409 Conflit**.
3. **Protection contre la Suppression Orpheline :**  
   Une machine liée à un ou plusieurs signalements de panne ne peut pas être supprimée de la base. L'API bloque la suppression et renvoie une erreur explicite **400 Bad Request**.
4. **Validation Stricte de Résolution d'Incident :**  
   Le passage d'une panne au statut `resolu` exige obligatoirement une note explicative (`noteResolution`). L'API horodate automatiquement la date de fin dans `resolvedAt` et consigne l'identifiant du réparateur dans `resolvedBy`.

---

##  Gestion Centralisée des Erreurs

L'application utilise un gestionnaire d'erreur global (`errorMiddleware.js`) couplé à la classe `AppError` pour formater l'intégralité des réponses en JSON standardisé :

```json
{
  "status": "fail",
  "message": "Description claire de l'erreur métier"
}
```

* **Codes 400 :** Paramètres manquants, validation Mongoose échouée, ID MongoDB invalide.
* **Code 401 :** Token JWT absent, invalide ou expiré.
* **Code 404 :** Ressource introuvable ou route indéfinie.
* **Code 409 :** Conflit d'unicité (email utilisateur ou référence machine dupliquée).
* **Code 500 :** Erreur interne inattendue.

---

## Tests & Collection Postman

Une collection complète est fournie à la racine du projet :  
**`MachineCare.postman_collection.json`**

### Comment l'utiliser :
1. Ouvrez **Postman** (ou **Bruno**).
2. Cliquez sur **Import** et sélectionnez le fichier `MachineCare.postman_collection.json`.
3. Lancez la requête **1. Authentification > Login Admin**.
4. Copiez le token reçu dans la variable de collection `token` pour exécuter toutes les requêtes sécurisées en un clic !

---

## Workflow Git

Le projet applique les standards de **GitFlow** avec traçabilité Jira :
* `main` : Branche de production stable.
* `Dev` : Branche d'intégration continue des fonctionnalités.
* `feature/MAC-XX-...` : Branches dédiées par Story Jira avec Smart Commits.
