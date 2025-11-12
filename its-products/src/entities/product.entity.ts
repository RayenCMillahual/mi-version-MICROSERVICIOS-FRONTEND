import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductReservation } from './product-reservation.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @OneToMany(() => ProductReservation, reservation => reservation.product)
  reservations: ProductReservation[];
}