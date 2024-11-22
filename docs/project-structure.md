---
title: Project Structure
nav_order: 4
---

# Project Structure 📁

## **Root Configuration Files**  

- **`package.json`**: Manages dependencies and scripts for the project.  
- **`tsconfig.json`**: Configures TypeScript compiler options.  
- **`vite.config.ts`**: Specifies Vite's build setup.  
- **`vitest.config.ts`**: Configuration for testing using Vitest.  
- **`eslint.config.js`**: Configures ESLint rules and linting behavior.  
- **`commitlint.config.js`**: Defines rules for commit message linting.  
- **`sonar-project.properties`**: Configuration for SonarCloud integration.  

## **Project Architecture**  

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

### **Model-View-ViewModel (MVVM)**  

The application follows the MVVM architectural pattern, ensuring clear separation of concerns between data, business logic, and the user interface.  

#### **Model**  

**Purpose**: Represents the application's data structures and core business logic.  
**Characteristics**:  

- **Independence**: Self-contained and decoupled from UI components.  
- **Reusability**: Can be shared across multiple parts of the application or other projects.  

**Responsibilities**:  

- Define and manage data models and types.  
- Implement validation and business rules.  
- Handle interactions with APIs or databases, abstracting complexities from the other layers.  

#### **ViewModel**  

**Purpose**: Acts as the intermediary layer, managing presentation logic and coordinating data flow between the Model and the View.  
**Characteristics**:  

- **State Management**: Maintains the View's required state.  
- **Binding**: Connects the View and Model, exposing observable properties.  

**Responsibilities**:  

- Fetch and transform data from the Model for display.  
- Process user interactions and update the Model accordingly.  
- Implement features like form validation, navigation, or business rules.  
- Keep the View passive and focused on rendering.  

#### **View**  

**Purpose**: Focused on UI rendering and user interaction handling.  
**Characteristics**:  

- **Declarative UI**: Dynamically renders the interface based on the ViewModel's state.  
- **Event Handling**: Collects user input and forwards it to the ViewModel.  

**Responsibilities**:  

- Bind to ViewModel properties and display data.  
- Render user-friendly layouts and components.  
- Forward user interactions (e.g., clicks, input) to the ViewModel for processing.  
- Avoid incorporating business logic to ensure ease of UI updates.  

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
