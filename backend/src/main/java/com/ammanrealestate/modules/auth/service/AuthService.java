package com.ammanrealestate.modules.auth.service;

import com.ammanrealestate.modules.auth.dto.AdminSummaryDto;
import com.ammanrealestate.modules.auth.dto.LoginRequest;
import com.ammanrealestate.modules.auth.dto.LoginResponse;
import com.ammanrealestate.modules.auth.model.AdminUser;
import com.ammanrealestate.modules.auth.repository.AdminUserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/**
 * Authentication service handling administrative login verification,
 * secure BCrypt password checking, and JWT issuance.
 */
@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Authenticates an admin user.
     * Throws BadCredentialsException with the exact same message for unknown email,
     * invalid password, or disabled/inactive account to avoid account enumeration.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail() != null
                ? request.getEmail().trim().toLowerCase(Locale.ROOT)
                : "";

        AdminUser user = adminUserRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!user.isActive()) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user);
        AdminSummaryDto summary = new AdminSummaryDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(token, jwtService.getExpirationSeconds(), summary);
    }
}
