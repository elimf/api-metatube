## Commande Nest

Assurez-vous de remplacer nom-du-module par le nom du module/controller que vous souhaitez créer. Vous pouvez également ajouter des options supplémentaires à la commande :

```bash
--path : Vous permet de spécifier un chemin personnalisé pour le répertoire du module. Par défaut, le module est créé dans le répertoire source de l'application.
```

```bash
--flat : Crée le module sans créer de sous-répertoire pour celui-ci.
```

```bash
--no-spec : Exclut la génération de fichiers de test pour le module.
```

## Création d'un module avec Nest.js

Pour créer un module dans une application Nest.js, utilisez la commande suivante :

```bash
nest generate module nom-du-module --no-spec
```

## Générer un service dans un module

```bash
nest generate controller nom-du-controleur --no-spec
```

## Générer un service dans un module

```bash
nest generate service nom-du-service --path chemin-du-module
```

## Générer un filtre dans un module

```bash
nest generate filter nom-du-filtre
```

## Générer un intercepteur dans un module

```bash
nest generate interceptor nom-de-l'intercepteur
```
## Générer une ressource 
```bash 
nest g resource name --no-spec
```
# Réinstallez les dépendances

```rm -rf node_modules
rm package-lock.json
npm install```