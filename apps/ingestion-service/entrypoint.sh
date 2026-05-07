#!/bin/sh

# On attend que la BDD soit prête
echo "Attente de la base de données..."
# On pourrait utiliser un outil comme wait-for-it.sh, mais on va faire simple
sleep 5

# On applique les migrations Prisma
echo "Application des migrations Prisma..."
pnpm exec prisma migrate deploy

# On lance l'app
echo "Démarrage de l'application..."
node apps/ingestion-service/dist/main
