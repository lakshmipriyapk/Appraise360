package com.example.springapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain; // ✅ import this

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // disable CSRF for POST/PUT/DELETE in APIs
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/**").permitAll() // allow all user APIs
                .requestMatchers("/api/employeeProfiles/**").permitAll() // allow employee APIs
                .anyRequest().authenticated() // secure other endpoints
            )
            .httpBasic(withDefaults()); // ✅ use the static import, no need to define your own
        return http.build();
    }
}
