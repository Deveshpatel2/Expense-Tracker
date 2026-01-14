package com.expensetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CacheConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Check if we're in development mode
        boolean isDevelopment = System.getProperty("spring.profiles.active", "").contains("dev") ||
                System.getProperty("spring.profiles.active", "").contains("development");

        if (isDevelopment) {
            // Development: minimal caching
            registry.addResourceHandler("/static/**")
                    .addResourceLocations("classpath:/static/")
                    .setCachePeriod(0); // No caching in development

            registry.addResourceHandler("/images/**")
                    .addResourceLocations("classpath:/static/images/")
                    .setCachePeriod(0);

            registry.addResourceHandler("/css/**", "/js/**")
                    .addResourceLocations("classpath:/static/css/", "classpath:/static/js/")
                    .setCachePeriod(0);
        } else {
            // Production: aggressive caching
            registry.addResourceHandler("/static/**")
                    .addResourceLocations("classpath:/static/")
                    .setCachePeriod(31536000); // 1 year in seconds

            registry.addResourceHandler("/images/**")
                    .addResourceLocations("classpath:/static/images/")
                    .setCachePeriod(2592000); // 1 month in seconds

            registry.addResourceHandler("/css/**", "/js/**")
                    .addResourceLocations("classpath:/static/css/", "classpath:/static/js/")
                    .setCachePeriod(604800); // 1 week in seconds
        }
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:3000", "http://localhost:3004")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Cache preflight requests for 1 hour
    }
}
