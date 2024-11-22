---
title: Application Workflows
nav_order: 6
---

# Application Workflows 📜

## Sequence Diagrams

The following sequence diagrams illustrate the interactions between buyers, sellers, the app, and the server.

### Buyer Login and Location Flow

```mermaid
sequenceDiagram
    participant Buyer
    participant App
    participant Server
    participant Seller

    %% Buyer Login and Location Flow
    Note over  Server, Buyer: Buyer Login  
    Buyer->>App: Login
    App->>Server: Authenticate buyer
    Server-->>App: Authentication success
    App-->>Buyer: Redirect to map view

    Buyer->>App: Send current location (on login)
    App->>Server: Save buyer's location
    Server-->>App: Acknowledge location update

    %% Seller Login and Location Flow
    Note over  App, Seller: Seller Login  
    Seller->>App: Login
    Server->>Seller: Broadcast buyer's presence and location (via WebSocket)
    App->>Server: Authenticate seller
    Server-->>App: Authentication success
    App-->>Seller: Redirect to map view

    loop Periodic Updates
        Seller->>App: Send current location (interval-based)
        App->>Server: Update seller's location
        Server-->>App: Acknowledge location update
        Server->>Buyer: Broadcast seller's presence and location (via WebSocket)
    end

    %% Ping Notification System
    
    Note over Buyer, Seller: Ping Strategy
    Buyer->>App: Send "ping" to seller
    App->>Server: Broadcast ping notification
    Server->>Seller: Notify "ping" with buyer details
    Seller-->>Server: Acknowledge ping
    Server->>Buyer: Confirm ping delivered

    %% Real-Time Updates on Map
    Note over Buyer,Seller: Map displays real-time locations of counterparts
    Server-->>Buyer: Stream sellers' updated locations

```

## Use Cases

| Feature              | Screenshot                     |
|----------------------|---------------------------------|
| Auth Map             | ![Auth  View](https://github.com/user-attachments/assets/a3677269-4d81-4c03-9a70-d2265abb583e) |
| Customer Map View    | ![Customer Map View](https://github.com/user-attachments/assets/65410963-fe23-470a-9018-e465d6c8f4f6) |
| Seller Interaction   | ![Seller Map View](https://github.com/user-attachments/assets/2a8f014f-6885-4b18-8692-0de5c03ecedd) |