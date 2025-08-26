import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, } from 'typeorm';

@Entity('users') // 'usuarios' es el nombre de la tabla en la base de datos
export class User {
    @PrimaryGeneratedColumn()
    usuario_id: number;

    @Column()
    username: string;

    @Column({ unique: true }) // El email debe ser único
    email: string;

    @Column()
    password: string; // ¡Importante! Más adelante, aquí guardaremos un hash, no el texto plano.

    @CreateDateColumn() // TypeORM llenará esta columna automáticamente
    registration_date: Date;

    @Column({ name: 'user_type', default: 'client' }) // Un valor por defecto
    user_type: string;
}
