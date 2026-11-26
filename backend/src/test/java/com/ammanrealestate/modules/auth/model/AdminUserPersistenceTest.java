package com.ammanrealestate.modules.auth.model;

import com.ammanrealestate.modules.auth.repository.AdminUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
class AdminUserPersistenceTest {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @BeforeEach
    void setUp() {
        adminUserRepository.deleteAll();
    }

    @Test
    @DisplayName("Should persist and retrieve an AdminUser entity")
    void testPersistAndRetrieveAdminUser() {
        AdminUser user = new AdminUser(
                "Thanjavur Admin",
                "admin@ammanrealestate.com",
                "$2a$10$dummyHashedPasswordForTestOnly1234567890",
                AdminRole.ROLE_ADMIN,
                true
        );

        AdminUser saved = adminUserRepository.saveAndFlush(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("admin@ammanrealestate.com");

        Optional<AdminUser> retrieved = adminUserRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getFullName()).isEqualTo("Thanjavur Admin");
    }

    @Test
    @DisplayName("Should normalize email to lowercase and trim spaces on persist")
    void testEmailNormalization() {
        AdminUser user = new AdminUser(
                "Test User",
                "  ADMIN.Owner@AmmanRealEstate.COM  ",
                "$2a$10$dummyHashedPasswordForTestOnly1234567890",
                AdminRole.ROLE_ADMIN,
                true
        );

        AdminUser saved = adminUserRepository.saveAndFlush(user);
        assertThat(saved.getEmail()).isEqualTo("admin.owner@ammanrealestate.com");

        Optional<AdminUser> byNormalized = adminUserRepository.findByEmail("admin.owner@ammanrealestate.com");
        assertThat(byNormalized).isPresent();
    }

    @Test
    @DisplayName("Should enforce email uniqueness constraint")
    void testEmailUniqueness() {
        AdminUser user1 = new AdminUser(
                "Admin One",
                "unique@ammanrealestate.com",
                "$2a$10$hash1",
                AdminRole.ROLE_ADMIN,
                true
        );
        adminUserRepository.saveAndFlush(user1);

        AdminUser user2 = new AdminUser(
                "Admin Two",
                "unique@ammanrealestate.com",
                "$2a$10$hash2",
                AdminRole.ROLE_ADMIN,
                true
        );

        assertThrows(DataIntegrityViolationException.class, () -> {
            adminUserRepository.saveAndFlush(user2);
        });
    }
}
