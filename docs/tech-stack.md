---
title: Tech Stack
nav_order: 5
---

# Tech Stack 🛠️

![Higher Order Design](https://github.com/user-attachments/assets/6e87f10e-b262-4cf1-aa9c-542d732105a9)

## Frontend

- **React.js**: Core framework
- **Mantine UI**: Rich component library
- **Leaflet.js**: Interactive maps
- **React Router**: Navigation
- **Vite**: Build tooling

## Backend

- **Supabase Cloud**: Auth, database, and real-time API
- **PostgreSQL**: Database with PostGIS for geospatial queries

## DevOps

- Supabase Cloud for database and authentication
- VPS hosting for custom backend and proxy configurations
- CI/CD pipelines with GitHub Actions
- SonarCloud for code quality and coverage analysis

## Decisions

### Supabase over Firebase

I chose **Supabase** over **Firebase** to future-proof our application. Supabase is an open-source alternative that allows for self-hosting, giving us greater control over our data and infrastructure. This flexibility ensures that we can scale and customize our backend without being locked into a proprietary platform. Additionally, using PostgreSQL with Supabase provides advanced features like **PostGIS** for geospatial queries, which enhances our application's capabilities.

### Leaflet over Google Maps

Opting for **Leaflet.js** instead of **Google Maps** was a strategic decision to reduce costs. Leaflet is an open-source library that offers interactive mapping functionality without the licensing fees associated with Google's services. This choice allows us to implement map features while maintaining budget considerations, and it avoids potential limitations on usage that come with commercial APIs.

### Mantine UI

I selected **Mantine UI** due to its maturity and extensibility. Mantine provides a comprehensive set of customizable components out of the box, which speeds up development and ensures a consistent user interface. Its modern design principles and active community support enable us to build a responsive frontend that can adapt to future requirements.

### React over Angular/Vue

Choosing **React.js** over frameworks like **Angular** or **Vue** was based on its flexibility and extensive ecosystem. React's component-based architecture allows for reusable code and easier maintenance. Its popularity means there are numerous libraries and tools available, which can accelerate development. React's learning curve is also favorable, making it accessible for new team members in the future.

### DevOps Strategy

My DevOps strategy focuses on building a fast, functional app with an eye toward future scalability. I use **Supabase Cloud** for managed database and authentication services, ensuring reliability without the overhead of in-house maintenance. For custom backend and proxy configurations, I deploy on a **VPS**, opting for a lean server setup built with **GitHub Actions** to optimize resource usage. While containerization with Docker is not currently implemented, I recognize its benefits for scalability and consistency and may adopt it as the application grows.

### CI/CD Details

I have established **CI/CD pipelines** using **GitHub Actions** to automate the build, test, and deployment processes. This continuous integration ensures code changes are consistently merged and tested, reducing the likelihood of defects. I utilize **SonarCloud** for code quality and coverage analysis, enabling us to maintain high standards and quickly identify areas for improvement.