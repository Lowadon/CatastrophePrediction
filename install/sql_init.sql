CREATE DATABASE IF NOT EXISTS esp_data;
Use esp_data;

DROP TABLE IF EXISTS devices;
CREATE TABLE IF NOT EXISTS devices(
    id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
    first_entry DATETIME,
    last_entry DATETIME
)ENIGNE = InnoDB;

DROP TABLE IF EXISTS entries;
CREATE TABLE IF NOT EXISTS entries(
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE,
    esp_id INT UNSIGNED NOT NULL,
    altitude FLOAT,
    pressure FLOAT,
    temperature FLOAT,
    humidity FLOAT,
    recorded_at DATETIME,
    CONSTRAINT 'fk_esp_id'
        FOREIGN KEY (esp_id) REFERENCES devices (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
)ENIGNE = InnoDB;