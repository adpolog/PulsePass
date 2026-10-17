package edu.unimag.pulsepass.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(prefix = "pulsepass.security.jwt")
@Getter
@Setter
public class JwtProperties {

    private String issuer = "pulsepass-api";
    private String secretBase64;
    private Duration accessTokenTtl = Duration.ofMinutes(15);
}