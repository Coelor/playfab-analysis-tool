# Backend Refactoring - Architecture Diagrams

## Current Architecture (Before Refactoring)

```mermaid
graph TD
    A[PlayersController] --> B[PlayFabService]
    B --> C[PlayFab Admin API]
    B --> D[PlayFab Data API]
    B --> E[PlayFab Authentication API]
    
    B --> F[Player Operations]
    B --> G[User Data Operations]
    B --> H[File Operations]
    B --> I[Object Operations]
    B --> J[Analytics Operations]
    
    K[PlayerAnalyticsService] --> B
    A --> K
    
    style B fill:#ff9999
    style B stroke:#ff0000
    style B stroke-width:3px
```

## Proposed Architecture (After Refactoring)

```mermaid
graph TD
    subgraph "Controllers Layer"
        A[PlayersController]
        B[FilesController]
        C[ObjectsController]
        D[AnalyticsController]
    end
    
    subgraph "Services Layer"
        subgraph "Core Services"
            E[PlayFabAuthService]
        end
        
        subgraph "Domain Services"
            F[PlayerService]
            G[FileService]
            H[ObjectService]
            I[AnalyticsService]
        end
    end
    
    subgraph "External APIs"
        J[PlayFab Admin API]
        K[PlayFab Data API]
        L[PlayFab Authentication API]
    end
    
    subgraph "Middleware"
        M[ErrorHandlingMiddleware]
        N[ValidationMiddleware]
    end
    
    A --> F
    B --> G
    C --> H
    D --> I
    
    F --> E
    G --> E
    H --> E
    I --> E
    
    E --> J
    E --> K
    E --> L
    
    M -.-> A
    M -.-> B
    M -.-> C
    M -.-> D
    
    N -.-> A
    N -.-> B
    N -.-> C
    N -.-> D
    
    style E fill:#90EE90
    style F fill:#87CEEB
    style G fill:#87CEEB
    style H fill:#87CEEB
    style I fill:#87CEEB
```

## Service Dependencies

```mermaid
graph LR
    subgraph "Service Dependencies"
        A[PlayerService] --> E[PlayFabAuthService]
        B[FileService] --> E
        C[ObjectService] --> E
        D[AnalyticsService] --> E
        
        D --> A
        D --> B
        D --> C
    end
    
    subgraph "External Dependencies"
        E --> F[PlayFab APIs]
        G[Configuration] --> A
        G --> B
        G --> C
        G --> D
        G --> E
    end
    
    style E fill:#FFD700
    style F fill:#FFA500
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant AuthService
    participant PlayFab
    
    Client->>Controller: HTTP Request
    Controller->>Service: Call Domain Service
    Service->>AuthService: Get Entity Token
    AuthService->>PlayFab: Authenticate
    PlayFab-->>AuthService: Entity Token
    AuthService-->>Service: Authenticated Context
    Service->>PlayFab: API Call with Token
    PlayFab-->>Service: Data Response
    Service-->>Controller: Processed Data
    Controller-->>Client: HTTP Response
```

## Folder Structure Diagram

```mermaid
graph TD
    A[PlayFabAnalytics/] --> B[Controllers/]
    A --> C[Services/]
    A --> D[Models/]
    A --> E[Configuration/]
    A --> F[Middleware/]
    A --> G[Common/]
    
    B --> B1[PlayersController]
    B --> B2[FilesController]
    B --> B3[ObjectsController]
    B --> B4[AnalyticsController]
    
    C --> C1[Core/]
    C --> C2[Players/]
    C --> C3[Files/]
    C --> C4[Objects/]
    C --> C5[Analytics/]
    
    C1 --> C11[PlayFabAuthService]
    C2 --> C21[PlayerService]
    C3 --> C31[FileService]
    C4 --> C41[ObjectService]
    C5 --> C51[AnalyticsService]
    
    D --> D1[DTOs/]
    D --> D2[Requests/]
    D --> D3[Responses/]
    D --> D4[Entities/]
    
    F --> F1[ErrorHandlingMiddleware]
    F --> F2[ValidationMiddleware]
    
    G --> G1[Extensions/]
    G --> G2[Validators/]
    G --> G3[Helpers/]
    
    style A fill:#E6E6FA
    style C fill:#F0F8FF
    style D fill:#F5F5DC
```

## Component Interaction Model

```mermaid
graph TD
    subgraph "Request Flow"
        A[HTTP Request] --> B[Controller]
        B --> C[Validation Middleware]
        C --> D[Domain Service]
        D --> E[Auth Service]
        E --> F[External API]
    end
    
    subgraph "Response Flow"
        F --> G[Raw Data]
        G --> H[Data Processing]
        H --> I[DTO Mapping]
        I --> J[Response Formatting]
        J --> K[Error Middleware]
        K --> L[HTTP Response]
    end
    
    subgraph "Cross-Cutting Concerns"
        M[Logging]
        N[Configuration]
        O[Caching]
    end
    
    B -.-> M
    D -.-> M
    E -.-> M
    
    B -.-> N
    D -.-> N
    E -.-> N
    
    D -.-> O
    E -.-> O
    
    style A fill:#FFB6C1
    style L fill:#98FB98
    style M fill:#DDA0DD
    style N fill:#F0E68C
    style O fill:#20B2AA
```

## Benefits of Refactored Architecture

### Key Improvements:
1. **Single Responsibility**: Each service handles one domain
2. **Dependency Inversion**: Services depend on abstractions
3. **Separation of Concerns**: Clear boundaries between layers
4. **Testability**: Easy to mock and unit test
5. **Maintainability**: Clear structure for future enhancements
6. **Scalability**: Easy to add new features without affecting existing code

### Pattern Benefits:
- **Repository Pattern**: Data access abstraction
- **Service Pattern**: Business logic separation  
- **Dependency Injection**: Loose coupling
- **Middleware Pattern**: Cross-cutting concerns
- **DTO Pattern**: Clean API contracts