import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_reservations')
export class ProductReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  userId: string;

  @Column('int')
  quantity: number;

  @CreateDateColumn()
  reservedAt: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => Product, product => product.reservations)
  product: Product;
}