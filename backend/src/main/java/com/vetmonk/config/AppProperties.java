package com.vetmonk.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Storage storage = new Storage();
    private Ai ai = new Ai();
    private Cors cors = new Cors();
    private boolean seedDemoData = true;

    public static class Jwt {
        private String secret = "";
        private long expirationMs = 86400000L;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMs() {
            return expirationMs;
        }

        public void setExpirationMs(long expirationMs) {
            this.expirationMs = expirationMs;
        }
    }

    public static class Storage {
        private String uploadDir = "./uploads";

        public String getUploadDir() {
            return uploadDir;
        }

        public void setUploadDir(String uploadDir) {
            this.uploadDir = uploadDir;
        }
    }

    public static class Ai {
        private String apiKey = "";
        private String model = "gemini-1.5-flash";
        private String endpoint = "https://generativelanguage.googleapis.com/v1beta/models";

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getEndpoint() {
            return endpoint;
        }

        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }
    }

    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173");

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Storage getStorage() {
        return storage;
    }

    public void setStorage(Storage storage) {
        this.storage = storage;
    }

    public Ai getAi() {
        return ai;
    }

    public void setAi(Ai ai) {
        this.ai = ai;
    }

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public boolean isSeedDemoData() {
        return seedDemoData;
    }

    public void setSeedDemoData(boolean seedDemoData) {
        this.seedDemoData = seedDemoData;
    }
}
