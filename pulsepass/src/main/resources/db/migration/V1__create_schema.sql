CREATE TABLE venues (
                        id BIGINT PRIMARY KEY,
                        code VARCHAR(50) NOT NULL UNIQUE,
                        name VARCHAR(150) NOT NULL,
                        city VARCHAR(100) NOT NULL,
                        address VARCHAR(255) NOT NULL,
                        capacity INT NOT NULL CHECK (capacity > 0),
                        active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE events (
                        id BIGINT PRIMARY KEY,
                        event_code VARCHAR(50) NOT NULL UNIQUE,
                        name VARCHAR(150) NOT NULL,
                        description TEXT,
                        category VARCHAR(50) NOT NULL,
                        status VARCHAR(50) NOT NULL,
                        event_date TIMESTAMP NOT NULL,
                        minimum_age INT NOT NULL DEFAULT 0,
                        venue_id BIGINT NOT NULL,
                        CONSTRAINT fk_event_venue FOREIGN KEY (venue_id) REFERENCES venues(id)
);

CREATE TABLE artists (
                         id BIGINT PRIMARY KEY,
                         stage_name VARCHAR(100) NOT NULL UNIQUE,
                         country VARCHAR(100) NOT NULL,
                         genre VARCHAR(50) NOT NULL,
                         active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE event_artists (
                               event_id BIGINT NOT NULL,
                               artist_id BIGINT NOT NULL,
                               CONSTRAINT pk_event_artists PRIMARY KEY (event_id, artist_id),
                               CONSTRAINT fk_event_artists_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                               CONSTRAINT fk_event_artists_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE users (
                       id BIGINT PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       email VARCHAR(150) NOT NULL UNIQUE,
                       active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_profiles (
                               id BIGINT PRIMARY KEY,
                               first_name VARCHAR(100) NOT NULL,
                               last_name VARCHAR(100) NOT NULL,
                               phone VARCHAR(30),
                               city VARCHAR(100),
                               birth_date DATE,
                               user_id BIGINT NOT NULL UNIQUE,
                               CONSTRAINT fk_user_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tickets (
                         id BIGINT PRIMARY KEY,
                         ticket_code VARCHAR(50) NOT NULL UNIQUE,
                         type VARCHAR(50) NOT NULL,
                         price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
                         status VARCHAR(50) NOT NULL,
                         purchase_date TIMESTAMP NOT NULL,
                         user_id BIGINT NOT NULL,
                         event_id BIGINT NOT NULL,
                         CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users(id),
                         CONSTRAINT fk_ticket_event FOREIGN KEY (event_id) REFERENCES events(id)
);