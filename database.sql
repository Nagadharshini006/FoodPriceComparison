-- CREATE DATABASE IF NOT EXISTS food_comparator;

-- USE food_comparator;

CREATE TABLE IF NOT EXISTS users (

id INT AUTO_INCREMENT PRIMARY KEY,

email VARCHAR(255) NOT NULL UNIQUE,

password_hash VARCHAR(255) NOT NULL,

role ENUM('user','admin') NOT NULL DEFAULT 'user',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE IF NOT EXISTS comparisons (

id INT AUTO_INCREMENT PRIMARY KEY,

user_id INT NOT NULL,

food_name VARCHAR(150) NOT NULL,

state VARCHAR(100) NOT NULL,

city VARCHAR(100) NOT NULL,

area VARCHAR(150) NOT NULL,

zomato_restaurant VARCHAR(200),

zomato_price DECIMAL(10,2),

zomato_rating DECIMAL(3,1),

zomato_delivery INT,

swiggy_restaurant VARCHAR(200),

swiggy_price DECIMAL(10,2),

swiggy_rating DECIMAL(3,1),

swiggy_delivery INT,

winner VARCHAR(20),

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS orders (

id INT AUTO_INCREMENT PRIMARY KEY,

user_id INT NOT NULL,

food_item VARCHAR(150) NOT NULL,

platform ENUM('zomato','swiggy') NOT NULL,

restaurant VARCHAR(200),

price DECIMAL(10,2),

rating DECIMAL(3,1),

delivery_time INT,

state VARCHAR(100) NOT NULL,

city VARCHAR(100) NOT NULL,

area VARCHAR(150) NOT NULL,

order_url TEXT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS food_items (

id INT AUTO_INCREMENT PRIMARY KEY,

food_name VARCHAR(150) NOT NULL,

platform ENUM('zomato', 'swiggy') NOT NULL,

restaurant VARCHAR(200) NOT NULL,

state VARCHAR(100) NOT NULL,

city VARCHAR(100) NOT NULL,

area VARCHAR(150) NOT NULL,

price DECIMAL(10,2) NOT NULL,

rating DECIMAL(3,1) NOT NULL,

delivery_time INT NOT NULL,

reviews INT DEFAULT 0,

order_url TEXT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
