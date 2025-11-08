CREATE TABLE IF NOT EXISTS products (
    product_id VARCHAR(36) PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    deleted BOOLEAN DEFAULT false
);