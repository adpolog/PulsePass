# PulsePass 
### Integrantes: Andry Polo Granados, Daniel Ramos Heras

## 📌 Enlaces del Proyecto
### * [Feat/service layer by adpolog and daramosh * Pull Request #3](https://github.com/adpolog/PulsePass/pull/3)
#  API REST (Fase 3: Capa de Controladores)

API REST para la gestion de eventos, artistas y boleteria desarrollada con Spring Boot 4 y Java 21.

## Tecnologias

- Java 21
- Spring Boot 4 / Spring MVC
- Bean Validation (jakarta.validation)
- JUnit 5 / Mockito / MockMvc

## Endpoints

### Venues (/api/venues)
- GET /api/venues/{code}
- GET /api/venues/active

### Artistas (/api/artists)
- GET /api/artists/{id}
- GET /api/artists/by-stage-name
- GET /api/artists/active

### Usuarios (/api/users)
- POST /api/users
- GET /api/users/by-email
- GET /api/users/by-username

### Eventos (/api/events)
- POST /api/events
- GET /api/events/{eventCode}
- GET /api/events/published
- PATCH /api/events/{eventCode}/publish
- POST /api/events/{eventCode}/artists/{artistId}
- GET /api/events/by-artist

### Boletas (/api/tickets y /api/events)
- POST /api/tickets
- GET /api/tickets/{ticketCode}
- GET /api/tickets/by-user
- GET /api/events/{eventCode}/tickets/paid
- PATCH /api/tickets/{ticketCode}/cancel
- PATCH /api/tickets/{ticketCode}/use


}