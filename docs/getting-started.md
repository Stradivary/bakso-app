---
title: Getting Started
nav_order: 2
---

# **Getting Started 🚀**

## Prerequisites 📋

- **Git**: Version control system
- **Node.js (v18 or above)**: JavaScript runtime environment
- **Vite**: Frontend build tool
- **Supabase Account**: Backend services

## Setup Instructions 🛠️

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bakso-app.git
   cd bakso-app
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   - Update `.env` with your configurations:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - Other necessary variables

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up Supabase**
   - Create a new project on [Supabase](https://supabase.io/).
   - Obtain your API URL and anon key.
   - Set up authentication and database schemas as per the [Database Design](/docs/database-design.md).

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm run test
   ```

7. **Build for production**
   ```bash
   npm run build
   ```

8. **Access the application**
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

## **Troubleshooting**

- **Common Issues**
  - If you encounter module not found errors, ensure all dependencies are installed.
  - For environment variable issues, double-check your `.env` file.

- **Getting Help**
  - Refer to the [Contributing Guide](/docs/contributing.md) for support.
  - Open an issue on the [GitHub repository](https://github.com/Stradivary/bakso-app/issues).

---