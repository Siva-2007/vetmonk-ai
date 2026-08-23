package com.vetmonk.config;

import com.vetmonk.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(cors -> {
                })

                .headers(headers ->
                        headers.frameOptions(
                                HeadersConfigurer.FrameOptionsConfig::disable
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .exceptionHandling(exceptions ->
                        exceptions.authenticationEntryPoint(
                                new HttpStatusEntryPoint(
                                        HttpStatus.UNAUTHORIZED
                                )
                        )
                )

                .authorizeHttpRequests(auth -> {

                    // =====================================================
                    // PUBLIC ENDPOINTS
                    // =====================================================

                    auth.requestMatchers(
                                    "/api/health",
                                    "/api/health/**"
                            )
                            .permitAll();

                    auth.requestMatchers(
                                    "/api/auth/**"
                            )
                            .permitAll();

                    auth.requestMatchers(
                                    HttpMethod.GET,
                                    "/api/clinics",
                                    "/api/clinics/*"
                            )
                            .permitAll();

                    // Public vacancy viewing only
                    auth.requestMatchers(
                                    HttpMethod.GET,
                                    "/api/vacancies",
                                    "/api/vacancies/*",
                                    "/api/vacancies/paged"
                            )
                            .permitAll();

                    auth.requestMatchers(
                                    HttpMethod.GET,
                                    "/api/medicines",
                                    "/api/medicines/*"
                            )
                            .permitAll();

                    auth.requestMatchers(
                                    "/api/public/**"
                            )
                            .permitAll();

                    auth.requestMatchers(
                                    "/v3/api-docs/**",
                                    "/swagger-ui/**",
                                    "/swagger-ui.html"
                            )
                            .permitAll();

                    auth.requestMatchers(
                                    "/h2-console/**"
                            )
                            .permitAll();


                    // =====================================================
                    // SUPER ADMIN
                    // =====================================================

                    auth.requestMatchers(
                                    "/api/audit/**"
                            )
                            .hasRole("SUPER_ADMIN");

                    auth.requestMatchers(
                                    "/api/admin/**"
                            )
                            .hasRole("SUPER_ADMIN");

                    auth.requestMatchers(
                                    HttpMethod.POST,
                                    "/api/clinics"
                            )
                            .hasRole("SUPER_ADMIN");

                    auth.requestMatchers(
                                    HttpMethod.DELETE,
                                    "/api/clinics/*"
                            )
                            .hasRole("SUPER_ADMIN");


                    // =====================================================
                    // VACANCIES
                    // CLINIC ADMIN + SUPER ADMIN
                    // =====================================================

                    auth.requestMatchers(
                                    HttpMethod.POST,
                                    "/api/vacancies"
                            )
                            .hasAnyRole(
                                    "CLINIC_ADMIN",
                                    "SUPER_ADMIN"
                            );

                    auth.requestMatchers(
                                    HttpMethod.PUT,
                                    "/api/vacancies/*"
                            )
                            .hasAnyRole(
                                    "CLINIC_ADMIN",
                                    "SUPER_ADMIN"
                            );

                    auth.requestMatchers(
                                    HttpMethod.DELETE,
                                    "/api/vacancies/*"
                            )
                            .hasAnyRole(
                                    "CLINIC_ADMIN",
                                    "SUPER_ADMIN"
                            );


                    // =====================================================
                    // CLINICAL ENDPOINTS
                    // =====================================================

                    auth.requestMatchers(
                                    HttpMethod.POST,
                                    "/api/consultations"
                            )
                            .hasAnyRole(
                                    "VETERINARIAN",
                                    "SUPER_ADMIN"
                            );

                    auth.requestMatchers(
                                    HttpMethod.POST,
                                    "/api/prescriptions"
                            )
                            .hasAnyRole(
                                    "VETERINARIAN",
                                    "SUPER_ADMIN"
                            );

                    auth.requestMatchers(
                                    HttpMethod.POST,
                                    "/api/medical-records"
                            )
                            .hasAnyRole(
                                    "VETERINARIAN",
                                    "SUPER_ADMIN"
                            );


                    // =====================================================
                    // EVERYTHING ELSE
                    // =====================================================

                    auth.anyRequest().authenticated();
                })

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig
    ) throws Exception {

        return authConfig.getAuthenticationManager();
    }
}