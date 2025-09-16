import { Channel } from "src/channels/channel.entity";
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Store {
    [x: string]: any;
    @PrimaryGeneratedColumn()
    store_id: number;

    @Column()
    store_name: string;

    @Column({ nullable: true })
    description: string;

    @OneToOne(() => Channel, (channel) => channel.store)
    @JoinColumn({ name: 'channel_id' }) //clave foránea
    channel: Channel;
    
    @OneToMany(() => Product, (product) => product.store)
    products: Product[];
}
