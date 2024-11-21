---
title: Project Structure
nav_order: 4
---

# **Project Structure 📁**

 

## Root Configuration Files
- `package.json`: Dependency management and scripts
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build configuration
- `vitest.config.ts`: Testing configuration
- `eslint.config.js`: Linting configuration 
- `commitlint.config.js`: Commit message linting
- `sonar-project.properties`: SonarQube configuration

## Project Architecture
```
bakso-app/
├── docs/                # Documentation
├── src/                # Vite React application
|   ├── models/         # Data models and type definitions
|   ├── views/          # React components and views
|   ├── viewmodels/     # Business logic and services 
|   └── shared/         # Reusable utilities and hooks
└── public/             # Static assets and diagrams 
```

## Architectural Overview

### Model-View-ViewModel (MVVM)

- **Model**: Represents the data and business logic of the application. It defines the structures for data storage and retrieval, independent of the user interface.
- **View**: Consists of the user interface components. It displays data to the user and captures user interactions.
- **ViewModel**: Acts as an intermediary between the Model and the View. It handles the presentation logic, prepares data for display, and processes user input.


### Model

- **Purpose**: Encapsulates the application's data structures and business entities.
- **Characteristics**:
  - **Independence**: Does not rely on external components or frameworks.
  - **Reusability**: Can be utilized across different parts of the application or even in other projects.
- **Responsibilities**:
  - Define data models and types.
  - Implement core business logic and validation.
  - Interact with data sources, such as APIs or databases, abstracting the details from other layers.

### ViewModel

- **Purpose**: Serves as the application's presentation logic layer, mediating between the Model and the View.
- **Characteristics**:
  - **State Management**: Holds and manages the state required by the View.
  - **Binding**: Exposes data and commands to the View through observable properties.
- **Responsibilities**:
  - Fetch and manipulate data from the Model.
  - Process user input from the View.
  - Implement application-specific logic, such as form validation or navigation handling.
  - Ensure that the View remains as passive as possible, focusing solely on rendering UI elements.

### View

- **Purpose**: Renders the user interface and handles user interactions.
- **Characteristics**:
  - **Declarative UI**: Defines what the UI should look like based on the current state provided by the ViewModel.
  - **Event Handling**: Captures user interactions and forwards them to the ViewModel.
- **Responsibilities**:
  - Bind to the ViewModel's properties and commands.
  - Display data to the user.
  - Collect user input and pass it to the ViewModel.
  - Maintain a clear separation from business logic to simplify UI changes.
 