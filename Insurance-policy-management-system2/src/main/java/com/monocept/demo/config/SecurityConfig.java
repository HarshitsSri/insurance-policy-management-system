package com.monocept.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.monocept.demo.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtFilter;

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth

					    .requestMatchers(
					            "/api/auth/**",
					            "/swagger-ui/**",
					            "/v3/api-docs/**")
					    .permitAll()

					    // User APIs
					    .requestMatchers("/api/users/**")
					    .hasRole("ADMIN")

					    // Product APIs
					    .requestMatchers(
					            HttpMethod.POST,
					            "/api/products")
					    .hasRole("ADMIN")

					    .requestMatchers(
					            HttpMethod.PUT,
					            "/api/products/**")
					    .hasRole("ADMIN")

					    .requestMatchers(
					            HttpMethod.PATCH,
					            "/api/products/**")
					    .hasRole("ADMIN")

					    .requestMatchers(
					            HttpMethod.GET,
					            "/api/products/**")
					    .hasAnyRole(
					            "ADMIN",
					            "AGENT",
					            "CUSTOMER")

					    .anyRequest()
					    .authenticated()
					)
				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {

		return config.getAuthenticationManager();
	}
}