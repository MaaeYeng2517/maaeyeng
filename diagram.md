# Diagram of AI Agent 


## Get Start
```mermaid
graph LR
    A[User Request] --> B[AI Agent]
    B --> C[Models API]
    B --> D[Tool]
    C --> E[Itinerary]
    D --> E
    E --> F[Result]
```