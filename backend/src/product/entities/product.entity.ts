import { Store } from "src/store/entities/store.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    product_id: string;

    @Column()
    product_name: string;

    @Column({ nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column()
    stock: number;

    @Column({ nullable: true })
    image_url: string;

    @ManyToOne(() => Store, (store) => store.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' }) //clave foránea
    store: Store;
}
