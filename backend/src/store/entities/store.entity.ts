import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Channel } from 'src/channels/entities/channel.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  store_id: string;

  @Column()
  store_name: string;

  @Column({ nullable: true })
  description: string;

  @OneToOne(() => Channel, channel => channel.store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
//   @Column({ unique: true }) // Esto asegura que no haya dos tiendas con el mismo channel_id
  channel: Channel;

  @OneToMany(() => Product, product => product.store)
  products: Product[];
}