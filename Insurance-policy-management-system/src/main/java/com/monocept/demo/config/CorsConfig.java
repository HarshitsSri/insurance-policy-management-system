package com.monocept.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

// This class allows the React frontend (running on a different port, like
// http://localhost:5173) to call this backend's APIs from the browser.
//
// Without this, only /api/auth/** would work, because that is the only
// controller that already has @CrossOrigin on it. Every other controller
// (products, plans, policies, claims, payments, users) would be blocked
// by the browser's CORS rules.
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Add the address(es) your frontend runs on.
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173"
                
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
