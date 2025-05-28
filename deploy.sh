#!/bin/bash

# Build the UI and server
echo "🔧 Building client"
# npm run build:ui

echo "🔧 Building server"
# npm run build:server

# Set the remote server IP
REMOTE_SERVER_IP="10.10.248.98"
REMOTE_SERVER_USERNAME="cs125"
REMOTE_SERVER_PASSWORD="Bamba@Cs56"

CLIENT_APP="insite-it-client"                   # <<< FILL ME >>>
SERVER_APP="insite-it-server"                   # <<< FILL ME >>>
NODE_PORT=3000                                      # <<< Optionally adjust
NGINX_CONF_NAME="insite-it-nginx-app"     


# to install sshpass    
# sudo apt-get install sshpass
# OR 
# curl -L https://raw.githubusercontent.com/kadwanev/bigboybrew/master/Library/Formula/sshpass.rb > sshpass.rb && brew install sshpass.rb && rm sshpass.rb

# Remove the existing directory
sshpass -p $REMOTE_SERVER_PASSWORD ssh $REMOTE_SERVER_USERNAME@$REMOTE_SERVER_IP << EOF
pm2 stop $SERVER_APP

sshpass -p $REMOTE_SERVER_PASSWORD sudo rm -rf ~/insite-it
EOF

# Copy the built files to the remote server
sshpass -p $REMOTE_SERVER_PASSWORD scp -r dist/apps $REMOTE_SERVER_USERNAME@$REMOTE_SERVER_IP:~/insite-it

sshpass -p $REMOTE_SERVER_PASSWORD scp .env $REMOTE_SERVER_USERNAME@$REMOTE_SERVER_IP:~/insite-it/frontend/.env
sshpass -p $REMOTE_SERVER_PASSWORD scp .env $REMOTE_SERVER_USERNAME@$REMOTE_SERVER_IP:~/insite-it/backend/.env
sshpass -p $REMOTE_SERVER_PASSWORD scp database/prisma/schema.prisma $REMOTE_SERVER_USERNAME@$REMOTE_SERVER_IP:~/insite-it/schema.prisma
sshpass -p $REMOTE_SERVER_PASSWORD scp nginx.conf $REMOTE_SERVER_USERNAME@$REMOTE_SERVER_IP:~/insite-it/nginx.conf


# SSH into the remote server and start the server
sshpass -p $REMOTE_SERVER_PASSWORD ssh $REMOTE_SERVER_USERNAME@$REMOTE_SERVER_IP << EOF

cd ~/insite-it/backend

echo "Installing Backend Dependencies"
npm ci --legacy-peer-deps

echo "Generating Prisma Client"
sshpass -p $REMOTE_SERVER_PASSWORD sudo prisma generate --schema ../schema.prisma

echo "Starting Backend Server"
pm2 delete $SERVER_APP || true
pm2 start main.js --name $SERVER_APP
pm2 save

cd ~/insite-it/frontend



echo "Installing Frontend Dependencies"
sshpass -p $REMOTE_SERVER_PASSWORD sudo npm ci --legacy-peer-deps

# Set up Nginx config
echo "📝 Configuring Nginx..."

# Enable Nginx config
sshpass -p $REMOTE_SERVER_PASSWORD sudo rm -fr /var/www/html/*

sshpass -p $REMOTE_SERVER_PASSWORD sudo mv ~/insite-it/nginx.conf /etc/nginx/sites-available/$NGINX_CONF_NAME
sshpass -p $REMOTE_SERVER_PASSWORD sudo mv ~/insite-it/frontend/* /var/www/html
sshpass -p $REMOTE_SERVER_PASSWORD sudo ln -sf /etc/nginx/sites-available/$NGINX_CONF_NAME /etc/nginx/sites-enabled/$NGINX_CONF_NAME
sshpass -p $REMOTE_SERVER_PASSWORD sudo nginx -t && sshpass -p $REMOTE_SERVER_PASSWORD sudo systemctl restart nginx

EOF

echo "✅ Deployment complete."

# sshpass -p $REMOTE_SERVER_PASSWORD sudo tee /etc/nginx/sites-available/$NGINX_CONF_NAME > /dev/null << 
