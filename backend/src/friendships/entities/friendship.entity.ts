import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Asegúrate que esta ruta es correcta

export enum FriendshipStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    BLOCKED = 'blocked',
}

@Entity('friendships')
export class Friendship {

    @PrimaryGeneratedColumn("uuid")
    friendship_id: string; // Clave primaria de la tabla friendship

    // --- Relación con el Usuario que ENVÍA (SENDER) ---
    @Column({ name: 'user_id_sender', type: 'uuid' }) 
    userIdSender: string;
    @ManyToOne(() => User, user => user.sentFriendships, { 
        onDelete: 'CASCADE', 
    }) 
    @JoinColumn({ name: 'user_id_sender', referencedColumnName: 'user_id' }) 
    sender: User;

    // --- Relación con el Usuario que RECIBE (RECEIVER) ---
    @Column({ name: 'user_id_receiver', type: 'uuid' }) 
    userIdReceiver: string; // Se eliminó 'ON DELETE CASCADE' de aquí
    @ManyToOne(() => User, user => user.receivedFriendships, { 
        onDelete: 'CASCADE', 
    }) 
    @JoinColumn({ name: 'user_id_receiver', referencedColumnName: 'user_id' }) 
    receiver: User;

    // --- Columna del Estado ---
    @Column({
        type: 'enum', 
        enum: FriendshipStatus,
        default: FriendshipStatus.PENDING,
    })
    status: FriendshipStatus;

    // --- Timestamps (Fechas) ---
    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}