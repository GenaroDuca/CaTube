import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('rooms') 
export class Room {
   @PrimaryColumn('varchar', { length: 75, name: 'room_id' }) 
    room_id: string;

    @Column({ type: 'varchar', default: 'private' })
    type: 'private'; 

    @ManyToMany(() => User, user => user.rooms)
    @JoinTable({ name: 'room_participants' }) 
    participants: User[]; 

    @OneToMany(() => Message, message => message.room, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    messages: Message[]; 
}