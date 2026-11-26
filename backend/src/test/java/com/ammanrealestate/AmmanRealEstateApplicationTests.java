package com.ammanrealestate;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("local")
class AmmanRealEstateApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring ApplicationContext boots cleanly with local profile
    }
}
