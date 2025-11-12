// its-products/src/entities/product-reservation.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn,
  Index, // ✅ AGREGAR
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_reservations')
// ✅ AGREGAR ÍNDICES COMPUESTOS para mejor performance
@Index(['userId', 'isCompleted'])
@Index(['productId', 'isCompleted'])
@Index(['reservedAt', 'isCompleted'])
export class ProductReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index() // ✅ Índice individual
  productId: string;

  @Column()
  @Index() // ✅ Índice individual
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