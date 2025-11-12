-- init-db/init-products.sql
-- Script de inicialización para MySQL (productos)

USE productos_db;

-- Crear tabla products si no existe
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL
);

-- Crear tabla product_reservations si no existe
CREATE TABLE IF NOT EXISTS product_reservations (
    id VARCHAR(36) PRIMARY KEY,
    productId VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    reservedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isCompleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (productId) REFERENCES products(id)
);

-- Insertar algunos productos de ejemplo
INSERT IGNORE INTO products (id, name, description, price, stock) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Laptop Dell XPS 13', 'Laptop ultrabook de alta gama', 1299.99, 10),
('550e8400-e29b-41d4-a716-446655440002', 'Mouse Logitech MX3', 'Mouse inalámbrico ergonómico', 79.99, 25),
('550e8400-e29b-41d4-a716-446655440003', 'Teclado Mecánico RGB', 'Teclado gaming con switches Cherry MX', 149.99, 15);