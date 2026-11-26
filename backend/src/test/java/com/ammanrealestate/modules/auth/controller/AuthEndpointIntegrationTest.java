package com.ammanrealestate.modules.auth.controller;

import com.ammanrealestate.modules.auth.dto.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class AuthEndpointIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @DisplayName("Calling protected admin route without credentials should return HTTP 401 JSON")
    void verifyAdminRouteProtection() {
        ResponseEntity<Map> response = restTemplate.getForEntity("/api/v1/admin/properties", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("success")).isEqualTo(false);
        assertThat(response.getBody().get("message")).toString().contains("Authentication required");
    }

    @Test
    @DisplayName("Submitting empty login request should return HTTP 400 validation error")
    void verifyValidationFailureOnEmptyBody() {
        LoginRequest invalidRequest = new LoginRequest("", "");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<LoginRequest> entity = new HttpEntity<>(invalidRequest, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity("/api/v1/auth/login", entity, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("success")).isEqualTo(false);
        assertThat(response.getBody().get("message")).toString().contains("Validation failed");
    }

    @Test
    @DisplayName("Submitting unknown credentials should return HTTP 401 generic failure")
    void verifyUnknownCredentialsFailure() {
        LoginRequest unknownRequest = new LoginRequest("nonexistent.admin@ammanrealestate.com", "SecretPass123");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<LoginRequest> entity = new HttpEntity<>(unknownRequest, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity("/api/v1/auth/login", entity, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("success")).isEqualTo(false);
        assertThat(response.getBody().get("message")).isEqualTo("Invalid email or password.");
    }

    @Test
    @DisplayName("Health endpoint should return HTTP 200 and environment should be local")
    void verifyHealthEndpointReportsLocalProfile() {
        ResponseEntity<Map> response = restTemplate.getForEntity("/api/v1/health", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("UP");
        assertThat(response.getBody().get("environment")).isEqualTo("local");
    }
}
