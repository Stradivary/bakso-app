---
title: Setup and Deployment
nav_order: 8
---

# **Setup and Deployment 🐳**

## Development
1. Clone the repository and install dependencies.
2. Run the app locally with `npm run dev`.
3. The app is served at [localhost:5173](http://localhost:5173).

## Production
1. Deploy the frontend to your VPS or preferred hosting platform.
   ```bash
   npm run build
   rsync -avz dist/ your-vps:/var/www/html
   ```
2. Configure Nginx (or another reverse proxy) to serve the `dist/` folder.

3. Backend services (database and API) are managed via **Supabase Cloud**. Ensure your environment variables point to the live instance.