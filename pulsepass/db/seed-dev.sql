-- Development test data (PRD §23 plus extra cases). Not a Flyway migration.
-- Run: docker exec -i pulsepass_db psql -U postgres -d pulsepass < db/seed-dev.sql
-- Every user's password: PulsePass2026!

BEGIN;

INSERT INTO venues (code, name, city, address, capacity, active) VALUES
    ('VEN-SMR-01', 'Marina Convention Center', 'Santa Marta', 'Cra. 1 #10-20, El Rodadero', 3, TRUE),
    ('VEN-SMR-02', 'Sala Bolívar', 'Santa Marta', 'Calle 15 #3-40, Centro Histórico', 2, TRUE),
    ('VEN-BAQ-01', 'Centro de Convenciones Puerta de Oro', 'Barranquilla', 'Vía 40 #77B-57', 500, TRUE),
    ('VEN-CTG-01', 'Teatro Adolfo Mejía', 'Cartagena', 'Plaza de la Merced #38-10', 300, TRUE),
    ('VEN-BOG-01', 'Arena Bogotá', 'Bogotá', 'Av. NQS #63-65', 1000, TRUE),
    ('VEN-MDE-01', 'Plaza Mayor', 'Medellín', 'Calle 41 #55-80', 800, FALSE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO artists (stage_name, country, genre, active) VALUES
    ('Los Cumbiamberos', 'Colombia', 'Cumbia', TRUE),
    ('Andes Jazz Trio', 'Colombia', 'Jazz', TRUE),
    ('Retro Kid', 'Argentina', 'Indie', FALSE)
ON CONFLICT (stage_name) DO NOTHING;

INSERT INTO events (event_code, name, description, category, status, event_date, minimum_age, venue_id, streaming_url)
SELECT e.code, e.name, e.description, e.category, e.status, e.event_date::timestamp, e.minimum_age, v.id, e.streaming_url
FROM (VALUES
    ('CMF-2026', 'Caribbean Music Fest 2026', 'Tres noches de música caribeña frente a la bahía de Santa Marta.', 'MUSIC', 'PUBLISHED', '2026-12-12 20:00', 18, 'VEN-SMR-01', NULL),
    ('JAZZ-2026', 'Noche de Jazz y Cultura', 'Una velada de jazz latino en el corazón de Cartagena.', 'CULTURE', 'PUBLISHED', '2026-11-27 19:00', 0, 'VEN-CTG-01', NULL),
    ('TECH-2027', 'Cumbre Tech Caribe 2027', 'Charlas y talleres sobre IA, nube y desarrollo web.', 'TECHNOLOGY', 'PUBLISHED', '2027-01-20 09:00', 0, 'VEN-BAQ-01', 'https://stream.pulsepass.test/tech-2027'),
    ('ELEC-2027', 'Electro Night Bogotá', 'Lo mejor de la música electrónica en una sola noche.', 'MUSIC', 'PUBLISHED', '2027-02-14 21:00', 18, 'VEN-BOG-01', NULL),
    ('FUT-2027', 'Clásico Costeño', 'Partido de exhibición entre leyendas del fútbol caribe.', 'SPORTS', 'PUBLISHED', '2027-03-08 18:00', 0, 'VEN-BAQ-01', NULL),
    ('EDU-2027', 'Taller de Producción Musical', 'Aprende a producir tu primer track desde cero.', 'EDUCATION', 'DRAFT', '2027-04-10 10:00', 14, 'VEN-CTG-01', NULL),
    ('COMEDY-2026', 'Noche de Comedia', 'Stand-up con los mejores comediantes de la costa.', 'ENTERTAINMENT', 'SOLD_OUT', '2026-12-05 20:00', 16, 'VEN-SMR-02', NULL),
    ('ROCK-2026', 'Rock Caribe 2026', 'Festival de rock cancelado por logística.', 'MUSIC', 'CANCELLED', '2026-12-20 17:00', 0, 'VEN-BOG-01', NULL),
    ('VALL-2025', 'Festival Vallenato 2025', 'La edición pasada del festival vallenato.', 'MUSIC', 'FINISHED', '2025-04-30 19:00', 0, 'VEN-BAQ-01', NULL)
) AS e(code, name, description, category, status, event_date, minimum_age, venue_code, streaming_url)
JOIN venues v ON v.code = e.venue_code
ON CONFLICT (event_code) DO NOTHING;

INSERT INTO event_artists (event_id, artist_id)
SELECT ev.id, a.id
FROM (VALUES
    ('CMF-2026', 'Solar Beat'),
    ('CMF-2026', 'Neon Waves'),
    ('CMF-2026', 'Caribbean Sound'),
    ('JAZZ-2026', 'Andes Jazz Trio'),
    ('ELEC-2027', 'Digital Pulse'),
    ('ELEC-2027', 'Solar Beat'),
    ('EDU-2027', 'Ocean Drive'),
    ('ROCK-2026', 'Ocean Drive'),
    ('VALL-2025', 'Caribbean Sound'),
    ('VALL-2025', 'Los Cumbiamberos')
) AS x(event_code, stage_name)
JOIN events ev ON ev.event_code = x.event_code
JOIN artists a ON a.stage_name = x.stage_name
ON CONFLICT DO NOTHING;

INSERT INTO users (username, email, active) VALUES
    ('andrea', 'andrea@pulsepass.test', TRUE),
    ('carlos', 'carlos@pulsepass.test', TRUE),
    ('laura', 'laura@pulsepass.test', TRUE),
    ('miguel', 'miguel@pulsepass.test', FALSE),
    ('sofia', 'sofia@pulsepass.test', TRUE),
    ('admin', 'admin@pulsepass.test', TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_profiles (first_name, last_name, phone, city, birth_date, user_id)
SELECT p.first_name, p.last_name, p.phone, p.city, p.birth_date::date, u.id
FROM (VALUES
    ('andrea', 'Andrea', 'Ruiz', '3001112233', 'Santa Marta', '1998-04-15'),
    ('carlos', 'Carlos', 'Pérez', '3002223344', 'Barranquilla', '1990-08-21'),
    ('laura', 'Laura', 'Gómez', '3003334455', 'Cartagena', '2009-06-01'),
    ('miguel', 'Miguel', 'Torres', '3004445566', 'Bogotá', '1985-01-10'),
    ('sofia', 'Sofía', 'Martínez', '3005556677', 'Santa Marta', '1995-11-02'),
    ('admin', 'Admin', 'PulsePass', NULL, 'Santa Marta', '1992-03-30')
) AS p(username, first_name, last_name, phone, city, birth_date)
JOIN users u ON u.username = p.username
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_credentials (user_id, password_hash, password_changed_at)
SELECT id, '$2a$10$.yhqk7G.Jf7qbg0arAhcDupEigM1yM4t7c3U4V/aZufRq9kBbnQH2', NOW()
FROM users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT u.id, r.role
FROM (VALUES
    ('andrea', 'USER'),
    ('carlos', 'USER'),
    ('laura', 'USER'),
    ('miguel', 'USER'),
    ('sofia', 'STAFF'),
    ('admin', 'ADMIN')
) AS r(username, role)
JOIN users u ON u.username = r.username
ON CONFLICT DO NOTHING;

-- CMF-2026 keeps 1 of 3 seats free; COMEDY-2026 is full (2 of 2).
INSERT INTO tickets (ticket_code, type, price, status, purchase_date, user_id, event_id)
SELECT t.code, t.type, t.price, t.status, t.purchase_date::timestamp, u.id, ev.id
FROM (VALUES
    ('A1B2C3D4', 'VIP', 200.00, 'PAID', '2026-11-05 14:32', 'andrea', 'CMF-2026'),
    ('B7E91F20', 'GENERAL', 100.00, 'PAID', '2026-11-08 09:15', 'carlos', 'CMF-2026'),
    ('C4D5E6F7', 'GENERAL', 100.00, 'CANCELLED', '2026-11-01 18:40', 'andrea', 'JAZZ-2026'),
    ('E9F8A7B6', 'STUDENT', 100.00, 'PAID', '2026-11-10 11:00', 'carlos', 'ELEC-2027'),
    ('AB12CD34', 'GENERAL', 100.00, 'RESERVED', '2026-11-15 16:20', 'andrea', 'TECH-2027'),
    ('F1A2B3C4', 'GENERAL', 100.00, 'PAID', '2026-11-02 20:05', 'andrea', 'COMEDY-2026'),
    ('0A9B8C7D', 'VIP', 200.00, 'PAID', '2026-11-03 12:45', 'carlos', 'COMEDY-2026'),
    ('D0E1F2A3', 'BACKSTAGE', 500.00, 'USED', '2025-04-01 10:00', 'andrea', 'VALL-2025')
) AS t(code, type, price, status, purchase_date, username, event_code)
JOIN users u ON u.username = t.username
JOIN events ev ON ev.event_code = t.event_code
ON CONFLICT (ticket_code) DO NOTHING;

COMMIT;
