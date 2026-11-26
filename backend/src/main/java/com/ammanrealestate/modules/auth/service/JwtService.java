package com.ammanrealestate.modules.auth.service;

import com.ammanrealestate.modules.auth.model.AdminUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Service for generating, signing, and validating JSON Web Tokens (JWT)
 * using HMAC-SHA256 with environment-configured secrets.
 */
@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationSeconds;

    public JwtService(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-seconds:900}") long expirationSeconds) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is required and must not be empty in production."
            );
        }

        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalArgumentException(
                    "JWT secret key must be at least 32 characters (256 bits) long for secure HMAC-SHA signing."
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(secretBytes);
        this.expirationSeconds = expirationSeconds;
    }

    /**
     * Generate a signed JWT token containing admin UUID as subject, custom claims, and expiration.
     */
    public String generateToken(AdminUser adminUser) {
        return generateTokenWithLifetime(adminUser, this.expirationSeconds);
    }

    /**
     * Generate a signed JWT token with a specific lifetime in seconds (useful for tests).
     */
    public String generateTokenWithLifetime(AdminUser adminUser, long lifetimeSeconds) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (lifetimeSeconds * 1000));

        return Jwts.builder()
                .subject(adminUser.getId().toString())
                .claim("email", adminUser.getEmail())
                .claim("role", adminUser.getRole().name())
                .claim("fullName", adminUser.getFullName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Validate the given token. Returns true if signature is valid and token has not expired.
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            return claims != null && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extract the admin user UUID from the token subject.
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    /**
     * Parse and extract all claims from a signed JWT token.
     */
    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }
}
