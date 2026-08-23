package com.vetmonk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VetMonkApplication {

    public static void main(String[] args) {
        SpringApplication.run(VetMonkApplication.class, args);
    }
}
