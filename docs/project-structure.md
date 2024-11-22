---
title: Project Structure
nav_order: 4
---

# Project Structure 📁 

## **Root Configuration Files**  

At the core of the project are its configuration files—small but powerful components that define how the application behaves, builds, and maintains quality. Here's what each file brings to the table:  

- **`package.json`**: The central node for managing project dependencies and defining reusable scripts. It ensures a consistent development environment and smooth collaboration.  
- **`tsconfig.json`**: The blueprint for TypeScript configuration, governing type-checking, module resolution, and transpilation rules to maintain a robust type-safe codebase.  
- **`vite.config.ts`**: Defines how Vite handles development builds, optimizes assets, and configures plugins for a fast, modern frontend experience.  
- **`vitest.config.ts`**: A tailored setup for Vitest, allowing developers to write and run tests effectively, ensuring code correctness and stability.  
- **`eslint.config.js`**: Establishes linting rules to maintain code quality and enforce consistency across the project.  
- **`commitlint.config.js`**: Ensures commit messages follow a standardized format, improving collaboration and aiding in version tracking.  
- **`sonar-project.properties`**: Configures SonarCloud for automated static code analysis, catching bugs and improving maintainability early in the development lifecycle.  

---

## **Project Architecture**  

The application's architecture is designed for clarity and maintainability. Here’s a breakdown:  

```plaintext
bakso-app/  
├── docs/                  # Documentation files  
├── src/                   # Source code of the Vite React application  
│   ├── models/            # Data models and type definitions  
│   ├── views/             # React components and UI views  
│   ├── viewmodels/        # Presentation logic and application services  
│   └── shared/            # Shared utilities and abstractions  
│       ├── services/      # Service integrations and data fetchers  
│       ├── hooks/         # Custom React hooks  
│       ├── context/       # React Context API implementations  
│       └── utils/         # General-purpose utility functions  
└── public/                # Static assets and visual diagrams  
```  

---

## **Architectural Overview**  

The application is built on the Model-View-ViewModel (MVVM) pattern. This architecture enforces a clean separation of concerns, simplifying development and testing by isolating data, logic, and presentation layers.  

### **Model**

The **Model** is the backbone of the application. It defines the data structures, business rules, and mechanisms to interact with external systems like APIs or databases. This layer doesn’t concern itself with how data will be displayed; it only ensures that data is correct, consistent, and accessible.  

For example, if the application requires fetching a list of sellers within a certain radius, the Model encapsulates the logic for querying and structuring the data before handing it off to the ViewModel.  

---

### **ViewModel**  

Think of the **ViewModel** as the translator between the Model and the View. It fetches raw data from the Model, transforms it into a format suitable for display, and manages the state of the UI.  

The ViewModel plays a key role in keeping the View simple. It acts as a buffer, shielding the UI from the complexity of the business logic. For instance, when a buyer "pokes" a seller, the ViewModel updates the system state and ensures the View reflects this change seamlessly.  

---

### **View**  

The **View** is where the application meets the user. It is responsible for rendering the interface and capturing interactions, like button clicks or input changes. However, it avoids dealing with data or business logic directly.  

For example, a buyer's interaction with the "poke" button only triggers a method in the ViewModel. The View doesn’t need to know how the poke mechanism works—it just knows how to render the button and react to state changes. 

---

## **Comparing MVC and MVVM**

| Aspect                   | MVC                                         | MVVM                                        |
|--------------------------|---------------------------------------------|--------------------------------------------|
| **Data Flow**            | Controller explicitly manages interactions between the Model and View. | ViewModel mediates, enabling reactive data flow. |
| **UI Logic Handling**    | Scattered across Controllers and Views.     | Centralized in the ViewModel, improving modularity. |
| **React Integration**    | Not inherently aligned with React's hooks or declarative design. | Naturally fits with React's declarative and functional paradigms. |
| **Learning Curve**       | Familiar but can become verbose with multiple Controllers. | Slightly steeper but encourages reusable and testable logic. |
| **State Management**     | Relies on Controller to manage state changes explicitly. | ViewModel handles state with reactivity, often simplifying updates. |
| **Reusability**          | Controllers are tied to specific Views.     | ViewModels are more reusable across components. |
| **Scalability**          | Becomes complex as the application grows, especially with nested Controllers. | Scales better due to centralized UI logic and modularity. |
| **Performance**          | Can suffer from redundant state updates if not carefully managed. | Efficient state updates through React hooks and reactivity. |

---

## **Why Choose MVVM Over MVC in React?**

### **Alignment with React’s Paradigm**

- MVC originates from server-rendered environments and often requires additional effort to adapt to React’s reactive, client-side nature.
- MVVM naturally fits into React's component-based architecture, where state management and UI logic are often tied closely to functional components.

### **Simplified State Management**

- In MVC, state management often requires explicit handling in the Controller, leading to potential redundancy or complex interactions.
- MVVM consolidates UI-specific state in the ViewModel, reducing boilerplate and improving clarity.

### **Reusability and Testability**

- ViewModels are easier to decouple and reuse compared to Controllers in MVC.
- ViewModel logic can be tested without involving the View, whereas Controllers often tightly couple input/output logic to the View.

### **Modern Development Trends**

- MVVM aligns with modern front-end practices like React hooks, custom hooks, and state management libraries (e.g., Zustand or Redux).
- MVC feels outdated in client-side JavaScript, where reactive programming and declarative UI are dominant.
