#!/bin/bash
user=
host=

# Compress Folder Contents (uses .gitignore values)
git archive -o app.tar.gz main

# Transfer Files to said folder '~/auto-deploy'
scp app.tar.gz deploy.config.ts $user@$host:~/auto-deploy

rm -f app.tar.gz

ssh $user@$host << EOF
  cd ~/auto-deploy
  tar xvzf app.tar.gz

  mv deploy.config.ts config.ts

  docker network create degen_net

  docker run \
      --name degenerate_db \
      -e POSTGRES_PASSWORD=password \
      -v ~/degenerate/database:/var/lib/postgresql/data \
      -p 5555:5432 \
      -d --restart unless-stopped \
      postgres
      
  docker network connect degen_net degenerate_db


  docker run \
      --name degenerate_cache \
      -p 6666:6379 \
      -d --restart unless-stopped \
      redis

  docker network connect degen_net degenerate_cache    
  
  docker container rm -f degenerate_server
  docker image rm -f ytb/degenerate:latest

  # Build, Remove and Deploy Container
  docker build --no-cache=true -t ytb/degenerate:latest .
    
  docker run \
    --name degenerate_server \
    -e DISCORD_BOT_TOKEN="" \
    -e DATABASE_URL="postgresql://postgres:password@degenerate_db:5432/degenerate" \
    -e REDIS_HOST="degenerate_cache" \
    -dit \
    --restart=unless-stopped \
    ytb/degenerate:latest

  docker network connect degen_net degenerate_server

  # Cleanup Files
  rm -rf ~/auto-deploy/*

  # Check Docker
  docker ps | grep degenerate

  # Disconnect
  exit
EOF