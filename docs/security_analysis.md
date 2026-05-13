# Analyse de Sécurité ClinicFlow (STRIDE & CIA)

Ce document détaille l'application des principes de sécurité sur la plateforme ClinicFlow.

## 1. Triade CIA (Confidentialité, Intégrité, Disponibilité)
| Pilier | Menace Spécifique | Contre-mesure Implémentée |
| :--- | :--- | :--- |
| **Confidentialité** | Accès non autorisé aux salles vidéo ou paiements. | **Vérification A01** : Filtrage strict par ID utilisateur propriétaire dans chaque contrôleur. |
| **Intégrité** | Manipulation des transactions Stripe. | Validation croisée des métadonnées Stripe et des données de session côté serveur. |
| **Disponibilité** | Attaques par force brute ou DoS. | **Rate Limiting** global et spécifique sur les routes sensibles (Login/Register). |

## 2. Système RBAC (Role Based Access Control)
Le système repose sur deux rôles principaux : `doctor` et `patient`.
- **Contrôles de propriété** : Chaque ressource (Rendez-vous, Paiement, Dossier) est liée à un `user_id`. Le backend rejette toute requête dont le token JWT ne correspond pas au propriétaire.

## 3. Analyse STRIDE sur le Flux de Consultation
Composant analysé : **Tunnel de Paiement & Visioconférence**.

| Menace | Description | Solution |
| :--- | :--- | :--- |
| **Spoofing** | Accéder à la salle d'un autre patient. | Vérification du lien Patient <-> Appointment avant d'autoriser la redirection Jitsi. |
| **Tampering** | Payer 0 MAD pour un RDV à 300 MAD. | Le montant est calculé dynamiquement par le serveur à partir du profil docteur, pas par le client. |
| **Repudiation** | Contester un paiement effectué. | Archivage des `stripe_payment_intent_id` et génération de reçus Stripe. |
| **Info Disclosure** | Fuite de clé API Stripe. | Utilisation de variables d'environnement (`.env`) et exclusion de Git. |
| **Denial of Service** | Inondation de tentatives de paiement. | Rate Limit strict sur `/api/payment`. |
| **Elevation of Privilege** | Accès aux outils docteurs par un patient. | Middleware `authorize('doctor')` sur les routes de prescription. |

## 4. Conformité OWASP Top 10 (Audit du 10/05/2026)
| Catégorie | État | Mesure Implémentée |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | ✅ | Middlewares `protect` + vérification de propriété manuelle dans `consultationController` et `paymentController`. |
| **A02: Cryptographic Failures** | ✅ | HTTPS (prod), Bcrypt (mots de passe) et signatures Stripe vérifiées. |
| **A03: Injection** | ✅ | Prisma (Anti-SQLi) et CSP stricte (Anti-XSS). |
| **A04: Insecure Design** | ✅ | Logique de paiement sécurisée (calcul serveur). |
| **A05: Security Misconfig.** | ✅ | **Helmet.js** activé. Suppression des headers `X-Powered-By`. |
| **A06: Vulnerable Components**| ⚠️ | Audit régulier requis via `npm audit`. |
| **A07: Identification Failures**| ✅ | **Rate Limiting** (10 tentatives max / heure) pour bloquer le Brute-Force. |
| **A08: Software Integrity** | ✅ | Intégrité des dépendances via `package-lock.json`. |
| **A09: Logging Failures** | ✅ | Logs structurés des tentatives de connexion et transactions financières. |
| **A10: SSRF** | ✅ | Pas d'appels externes dynamiques basés sur des entrées utilisateur. |

## 5. Protection par en-têtes (CSP)
Une politique de sécurité de contenu (CSP) stricte a été déployée via `helmet` pour limiter l'exécution de scripts aux sources suivantes :
- `self` (Notre propre code)
- `js.stripe.com` (Paiements)
- `meet.jit.si` (Vidéos)
- `fonts.googleapis.com` (Design)
