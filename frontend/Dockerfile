# Dev-oriented image: runs the Vite dev server (matches `npm run dev`
# locally), not a production nginx build -- that's a separate task.
FROM node:22-slim

WORKDIR /app

# Installed before the rest of the source is copied so this layer is
# cached unless package*.json changes.
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host so Vite listens on all interfaces inside the container;
# otherwise it only binds localhost and the port mapping is unreachable.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
