# WWF North Africa – site web (Tunisie)

Deux versions du même site sont fournies.

## 1. `standalone/index.html`
Un seul fichier (environ 8 Mo) : HTML, CSS, JavaScript, images et PDF intégrés.
Double-clic pour l'ouvrir, ou dépôt tel quel sur n'importe quel hébergement.

## 2. `site/` (code source lisible)
```
site/
├── index.html            structure de la page
├── css/styles.css        tout le style (variables de couleur en haut)
├── js/app.js             contenu, pages, recherche, panier, formulaires
├── js/images.js          liste des images et des PDF téléchargeables
├── js/vendor/leaflet.js  carte (Leaflet 1.9.4)
├── images/               photos, logos, produits
└── docs/                 formulaire de plainte + document du mécanisme (PDF)
```
Ouvrez `site/index.html` dans un navigateur (aucun serveur ni installation nécessaire).
Pour tester avec un serveur local : `python3 -m http.server` dans le dossier `site/`.

## Où modifier quoi (dans `js/app.js`)
- **Textes** : chaque texte est un tableau `["English","Français","العربية"]`.
- **Menu** : constante `NV`. **Projets** : `PR`. **Actualités** : `N` (dates au format AAAA-MM-JJ).
- **Équipe** : `TEAM`. **Produits et prix (DT)** : `P`. **Espèces** : `SP`.
- **Mécanisme de plaintes** : adresse `GRM_EMAIL`, textes `GCH` (canaux) et `GST` (étapes).
- **Newsletter** : `NL_ENDPOINT` (vide = ouvre un e-mail vers contact@wwfna.org). Renseignez l'adresse d'envoi de votre service (Mailchimp, Brevo…) pour une inscription automatique.
- **Images** : remplacez les fichiers dans `images/` en gardant les mêmes noms.

## À savoir
- La commande de la boutique (D17 / carte bancaire) est une démonstration : aucune donnée de paiement n'est collectée. Il faut brancher une vraie passerelle de paiement.
- Les images OpenStreetMap de la carte nécessitent une connexion Internet.
- Les polices (Oswald, Inter, Noto Sans Arabic) viennent de Google Fonts.

## Crédits et licences
- Carte : Leaflet (BSD-2) et © OpenStreetMap contributors.
- Silhouettes d'animaux : game-icons.net (CC BY 3.0) et Noto Emoji (Apache 2.0). Cette mention est affichée en bas de page : à conserver.
- Photos et logos : fournis par WWF Afrique du Nord et ses partenaires.
