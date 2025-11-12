// its-products/ormConfig.ts
import { DataSourceOptions } from 'typeorm';
import { Product } from './src/entities/product.entity';
import { ProductReservation } from './src/entities/product-reservation.entity';
import { envs } from './src/config/envs';

const config: DataSourceOptions = {
  type: 'mysql',
  host: envs.database.host,
  port: envs.database.port,
  username: envs.database.username,
  password: envs.database.password,
  database: envs.database.database,
  entities: [Product, ProductReservation],
  
  // ✅ CORREGIDO: Deshabilitar synchronize en producción
  synchronize: process.env.NODE_ENV === 'development',
  
  // ✅ AGREGAR: Configuración de migraciones
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
  
  // ✅ AGREGAR: Logging para debug
  logging: process.env.NODE_ENV === 'development',
  
  // ✅ AGREGAR: Opciones adicionales de seguridad
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,
};

export default config;