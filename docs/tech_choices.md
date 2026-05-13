# Choix Technologiques - Plateforme de Télémédecine (ClinicFlow)

Ce document récapitule les technologies choisies pour le projet et les raisons de ces choix techniques stratégiques.

## 1. Stack Principale
- **Frontend : React (Vite.js)**
  - *Pourquoi ?* React offre une gestion d'état fluide et une grande réutilisabilité des composants. Vite est choisi pour sa rapidité de développement (HMR quasi instantané).
- **Backend : Node.js (Express)**
  - *Pourquoi ?* Performance asynchrone excellente pour les notifications en temps réel et facilité de partage de code (JavaScript partout).
- **Base de Données : PostgreSQL**
  - *Pourquoi ?* Base de données relationnelle robuste, parfaite pour gérer des relations complexes (Médecin <-> Patient <-> Rendez-vous) avec une intégrité des données stricte.

## 2. Visioconférence (Consultation en Direct)
- **Jitsi Meet External API**
  - *Pourquoi ?* 
    - **Sécurité** : Jitsi offre un chiffrement de bout en bout et des salons sécurisés par ID unique.
    - **Open Source & Gratuit** : Pas de frais par minute comme sur Twilio ou Agora, ce qui rend le modèle économique de ClinicFlow viable.
    - **Intégration** : Facile à intégrer dans une interface React via une iFrame contrôlée, offrant des fonctionnalités natives (partage d'écran, chat, lever la main).
    - **Performance** : Utilise l'infrastructure mondiale de Jitsi pour une latence minimale.

## 3. Intelligence Artificielle (Assistant Médical)
- **Groq (Llama 3.3 70B)**
  - *Pourquoi ?*
    - **Vitesse Extrême** : Groq est actuellement le moteur d'inférence le plus rapide du marché, permettant des réponses instantanées pour l'analyse de symptômes.
    - **Modèle de Pointe** : Utilisation de Llama 3.3 (70B), l'un des modèles open-source les plus performants, offrant un raisonnement médical précis.
    - **Fiabilité** : Intégré avec un système de **Fallback sur Gemini 2.0 Flash**, garantissant que l'assistant reste disponible même en cas de panne d'un fournisseur.

## 4. Design & Expérience Utilisateur (UI/UX)
- **Système de Thème Binaire (Pure White / Deep Night)**
  - *Pourquoi ?*
    - **Confort Visuel** : Le mode "Deep Night" (#020617) réduit la fatigue oculaire pour les médecins utilisant la plateforme toute la journée. Le mode "Pure White" offre une clarté maximale pour les patients.
    - **Branding Premium** : L'utilisation de Tailwind CSS avec `darkMode: 'class'` permet une transition instantanée et un design haute-fidélité qui inspire confiance (aspect institutionnel et moderne).
- **Lucide React & Framer Motion**
  - *Pourquoi ?* Iconographie cohérente et animations fluides pour transformer une application fonctionnelle en une expérience utilisateur "Premium".

## 5. Authentification et Sécurité
- **JWT (JSON Web Tokens)**
  - *Pourquoi ?* Permet une authentification "stateless", idéale pour le déploiement. Facile à stocker et à vérifier sans surcharger la base de données.
- **Bcrypt.js**
  - *Pourquoi ?* Standard de l'industrie pour le hashage sécurisé des mots de passe.
- **Prisma (ORM)**
  - *Pourquoi ?* Offre un typage fort et simplifie les interactions avec PostgreSQL tout en garantissant la sécurité des requêtes (protection native contre les injections SQL).

## 6. Communication en Temps Réel
- **Socket.io**
  - *Pourquoi ?* Utilisé pour le chat médical et les notifications instantanées (début de consultation, réception d'ordonnance), assurant une synchronisation parfaite entre le médecin et le patient.
