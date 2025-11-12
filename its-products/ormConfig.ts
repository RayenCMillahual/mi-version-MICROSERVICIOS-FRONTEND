// its-products/ormconfig.ts
import { DataSourceOptions } from 'typeorm';
import { Product } from './src/entities/product.entity';
import { ProductReservation } from './src/entities/product-reservation.entity';
import { envs } from './src/config/envs';

const config: DataSourceOptions = {
  type: 'mysql',
  host: envs.database.host,        // ← CAMBIO: db → database
  port: envs.database.port,        
  username: envs.database.username, 
  password: envs.database.password, 
  database: envs.database.database, 
  entities: [Product, ProductReservation],
  synchronize: true,
};

export default config;