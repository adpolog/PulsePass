package edu.unimag.pulsepass;

import org.springframework.test.context.DynamicPropertyRegistry;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * The JWT key is no longer stored in application.properties (H-16), so tests that start the
 * Spring context register a random key generated per run. No key is ever written to the repository.
 */
public final class TestJwtSecret {

    private static final String RANDOM_KEY = randomKey();

    private TestJwtSecret() {
    }

    public static void register(DynamicPropertyRegistry registry) {
        registry.add("pulsepass.security.jwt.secret-base64", () -> RANDOM_KEY);
    }

    private static String randomKey() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
}
