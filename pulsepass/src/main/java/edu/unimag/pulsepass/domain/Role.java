package edu.unimag.pulsepass.domain;

public enum Role {
    USER,
    STAFF,
    ADMIN;

    public String getAuthority() {
        return "ROLE_" + name();
    }
}
