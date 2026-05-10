package config

import (
	"os"
)

type Config struct {
	ServerPort string
	DBPath     string
	JWTSecret  string
	RedisAddr  string
	RedisPass  string
	UploadDir  string
}

func Load() *Config {
	return &Config{
		ServerPort: getEnv("192.168.31.34", "8080"),
		DBPath:     getEnv("DB_PATH", "./data/math_association.db"),
		JWTSecret:  getEnv("JWT_SECRET", "math-association-secret-key-2024"),
		RedisAddr:  getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPass:  getEnv("REDIS_PASS", ""),
		UploadDir:  getEnv("UPLOAD_DIR", "./uploads"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
