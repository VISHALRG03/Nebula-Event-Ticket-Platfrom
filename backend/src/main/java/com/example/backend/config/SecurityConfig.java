package com.example.backend.config;

import com.example.backend.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                // Enable CORS with configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Set session to stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Configure authorization
                .authorizeHttpRequests(auth -> auth
                        //  Allow these endpoints WITHOUT authentication
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/events/**").permitAll()   // GET events
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/api/scan/status/**").permitAll()
                        .requestMatchers("/error").permitAll()        // Allow error page
                        .requestMatchers("/api/scan/public/status/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/images/**").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()

                        // ✅ Require ADMIN role endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                       // Admin can create/delete

                        // ✅ Require USER role endpoints
                        .requestMatchers("/api/booking/**").hasRole("USER")
                        .requestMatchers("/api/tickets/**").hasRole("USER")
                        .requestMatchers("/api/qr/**").hasRole("USER")

                        // ✅ Require TICKET_CHECKER role endpoints
                        .requestMatchers("/api/scan/**").hasRole("TICKET_CHECKER")
                        .requestMatchers("/api/scan/validate").hasRole("TICKET_CHECKER")

                        // All other requests need authentication
                        .anyRequest().authenticated()
                )

                // Add JWT filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


}