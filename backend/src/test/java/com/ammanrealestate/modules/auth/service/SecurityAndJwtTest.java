package com.ammanrealestate.modules.auth.service;

import com.ammanrealestate.modules.auth.model.AdminRole;
import com.ammanrealestate.modules.auth.model.AdminUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityAndJwtTest {

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private final String secretKey = "CustomTestingSecretKeyForAmmanRealEstateAuth12345";

    @BeforeEach
    void init() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService(secretKey, 900);
    }

    @Test
    @DisplayName("BCrypt should hash and verify raw password")
    void verifyPasswordHashingAndMatching() {
        String rawPassword = "ThanjavurPropertyPassword98942";
        String hash = passwordEncoder.encode(rawPassword);

        assertThat(hash).isNotEqualTo(rawPassword);
        assertThat(hash).startsWith("$2a$");
        assertTrue(passwordEncoder.matches(rawPassword, hash));
        assertFalse(passwordEncoder.matches("WrongPasswordHere", hash));
    }

    @Test
    @DisplayName("Should create and validate JWT for an admin user")
    void createAndValidateJwtToken() {
        AdminUser admin = new AdminUser(
                "Agency Partner",
                "partner@ammanrealestate.com",
                "hashed",
                AdminRole.ROLE_ADMIN,
                true
        );
        admin.setId(UUID.randomUUID());

        String token = jwtService.generateToken(admin);
        assertThat(token).isNotBlank();

        assertTrue(jwtService.validateToken(token));
        assertThat(jwtService.getUserIdFromToken(token)).isEqualTo(admin.getId());
    }

    @Test
    @DisplayName("Should reject expired JWT token")
    void rejectExpiredJwt() {
        AdminUser admin = new AdminUser(
                "Agency Partner",
                "partner@ammanrealestate.com",
                "hashed",
                AdminRole.ROLE_ADMIN,
                true
        );
        admin.setId(UUID.randomUUID());

        String expiredToken = jwtService.generateTokenWithLifetime(admin, -10);
        assertFalse(jwtService.validateToken(expiredToken));
    }

    @Test
    @DisplayName("Should reject token signed with different key")
    void rejectForeignSignedToken() {
        AdminUser admin = new AdminUser(
                "Agency Partner",
                "partner@ammanrealestate.com",
                "hashed",
                AdminRole.ROLE_ADMIN,
                true
        );
        admin.setId(UUID.randomUUID());

        JwtService foreignJwtService = new JwtService(
                "ACompletelyDifferentSecretKeyForSigningAuthTokens777",
                900
        );
        String foreignToken = foreignJwtService.generateToken(admin);

        assertFalse(jwtService.validateToken(foreignToken));
    }

    @Test
    @DisplayName("Should reject malformed token string")
    void rejectMalformedToken() {
        assertFalse(jwtService.validateToken("invalid.token.payload"));
    }

    @Test
    @DisplayName("Should enforce minimum 256-bit secret length")
    void enforceSecretKeyLength() {
        assertThrows(IllegalArgumentException.class, () -> {
            new JwtService("too-short-secret", 900);
        });
    }
}
