package edu.unimag.pulsepass;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class PulsepassApplicationTests {

	@DynamicPropertySource
	static void jwtSecret(DynamicPropertyRegistry registry) {
		TestJwtSecret.register(registry);
	}

	@Test
	void contextLoads() {
	}

}
