# Stage 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG REACT_APP_API_BASE_URL=/api
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Simple Nginx config to serve index.html for any path (for client-side routing if added later)
RUN echo "server { \
      listen 80; \
      root /usr/share/nginx/html; \
      index index.html; \
      location / { \
        try_files \$uri /index.html; \
      } \
    }" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]