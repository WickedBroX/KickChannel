#!/bin/bash
SERVER=ubuntu@your-server-ip
APP_DIR=/var/www/gamerapp

echo "Deploying to $SERVER..."

# Build Frontend
cd ../frontend && npm install && npm run build
cd ..

# Sync Frontend
rsync -avz --delete frontend/dist/ $SERVER:$APP_DIR/frontend/

# Sync Backend
rsync -avz --delete backend/dist/ $SERVER:$APP_DIR/backend/dist/
rsync -avz backend/package.json $SERVER:$APP_DIR/backend/
rsync -avz backend/.env $SERVER:$APP_DIR/backend/

# Install deps and restart
ssh $SERVER "cd $APP_DIR/backend && npm install --production && sudo systemctl restart gamerapp-backend gamerapp-worker"
