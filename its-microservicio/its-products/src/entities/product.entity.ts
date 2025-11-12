// its-products/src/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index, // ✅ AGREGAR
} from 'typeorm';
import { ProductReservation } from './product-reservation.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index() // ✅ Índice para búsquedas por nombre
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @Index() // ✅ Índice para ordenar por precio
  price: number;

  @Column('int')
  @Index() // ✅ Índice para filtrar por stock
  stock: number;

  @CreateDateColumn()
  @Index() // ✅ Índice para ordenar por fecha
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductReservation, reservation => reservation.product)
  reservations: ProductReservation[];
}