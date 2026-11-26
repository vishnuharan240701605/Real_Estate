package com.ammanrealestate.modules.auth.service;

import com.ammanrealestate.modules.auth.dto.LoginRequest;
import com.ammanrealestate.modules.auth.dto.LoginResponse;
import com.ammanrealestate.modules.auth.model.AdminRole;
import com.ammanrealestate.modules.auth.model.AdminUser;
import com.ammanrealestate.modules.auth.repository.AdminUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(adminUserRepository, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("Should successfully authenticate valid active admin and return login response")
    void testSuccessfulLogin() {
        UUID adminId = UUID.randomUUID();
        AdminUser admin = new AdminUser("Founder Admin", "founder@ammanrealestate.com", "encoded-hash", AdminRole.ROLE_ADMIN, true);
        admin.setId(adminId);

        when(adminUserRepository.findByEmail("founder@ammanrealestate.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("ValidPassword123", "encoded-hash")).thenReturn(true);
        when(jwtService.generateToken(admin)).thenReturn("mock.jwt.token");
        when(jwtService.getExpirationSeconds()).thenReturn(900L);

        LoginRequest request = new LoginRequest("founder@ammanrealestate.com", "ValidPassword123");
        LoginResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(900L);
        assertThat(response.getAdmin().getId()).isEqualTo(adminId);
        assertThat(response.getAdmin().getEmail()).isEqualTo("founder@ammanrealestate.com");
    }

    @Test
    @DisplayName("Should reject unknown email with generic BadCredentialsException")
    void testUnknownEmail() {
        when(adminUserRepository.findByEmail("unknown@ammanrealestate.com")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("unknown@ammanrealestate.com", "AnyPassword");
        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> authService.login(request));

        assertThat(ex.getMessage()).isEqualTo("Invalid email or password.");
    }

    @Test
    @DisplayName("Should reject incorrect password with generic BadCredentialsException")
    void testIncorrectPassword() {
        AdminUser admin = new AdminUser("Founder Admin", "founder@ammanrealestate.com", "encoded-hash", AdminRole.ROLE_ADMIN, true);
        when(adminUserRepository.findByEmail("founder@ammanrealestate.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("WrongPassword", "encoded-hash")).thenReturn(false);

        LoginRequest request = new LoginRequest("founder@ammanrealestate.com", "WrongPassword");
        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> authService.login(request));

        assertThat(ex.getMessage()).isEqualTo("Invalid email or password.");
    }

    @Test
    @DisplayName("Should reject inactive admin account with generic BadCredentialsException")
    void testInactiveAdmin() {
        AdminUser admin = new AdminUser("Disabled Admin", "disabled@ammanrealestate.com", "encoded-hash", AdminRole.ROLE_ADMIN, false);
        when(adminUserRepository.findByEmail("disabled@ammanrealestate.com")).thenReturn(Optional.of(admin));

        LoginRequest request = new LoginRequest("disabled@ammanrealestate.com", "ValidPassword");
        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> authService.login(request));

        assertThat(ex.getMessage()).isEqualTo("Invalid email or password.");
    }
}
