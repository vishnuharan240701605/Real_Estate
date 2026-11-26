package com.ammanrealestate.modules.health;

import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Public health-check endpoint for system uptime and readiness verification.
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final Environment environment;

    public HealthController(Environment environment) {
        this.environment = environment;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        String[] profiles = environment.getActiveProfiles();
        String currentProfile = profiles.length > 0 ? profiles[0] : "local";

        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "AMMAN REAL ESTATE Backend API");
        health.put("version", "1.0.0");
        health.put("environment", currentProfile);
        health.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(health);
    }
}
