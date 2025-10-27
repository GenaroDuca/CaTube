import { Injectable } from '@nestjs/common'; // ¡Necesario!
import { InjectRepository } from '@nestjs/typeorm'; // ¡Necesario!
import { Repository } from 'typeorm'; // Importar el tipo base de TypeORM

import { Friendship, FriendshipStatus } from './entities/friendship.entity';
import { User } from '../users/entities/user.entity';
import { FriendProfile } from "./friend-profile.interface";

@Injectable() // La clase debe ser Inyectable
export class FriendshipService {

  // REEMPLAZO COMPLETO: Usamos Inyección de Dependencias
  constructor(
    @InjectRepository(Friendship) // Inyecta el repositorio de Friendship
    private friendshipRepository: Repository<Friendship>,

    @InjectRepository(User) // Inyecta el repositorio de User
    private userRepository: Repository<User>,
  ) { }

  /**
   * Crea y envía una solicitud de amistad.
   */
  async sendRequest(senderId: string, receiverId: string): Promise<Friendship> {
    if (senderId === receiverId) {
      throw new Error('Cannot send a friendship request to yourself.');
    }

    // 1. Verificar si ambos usuarios existen. Consulta ahora válida.
    const receiver = await this.userRepository.findOne({ where: { user_id: receiverId } });
    if (!receiver) {
      throw new Error('Receiver user not found.');
    }

    // 2. Verificar si ya existe una relación (incluyendo pendientes, aceptadas o bloqueadas)
    const existingFriendship = await this.friendshipRepository.createQueryBuilder("friendship")
      .where("(friendship.userIdSender = :senderId AND friendship.userIdReceiver = :receiverId) OR (friendship.userIdSender = :receiverId AND friendship.userIdReceiver = :senderId)", { senderId, receiverId })
      .getOne();

    if (existingFriendship) {
      throw new Error(`A relationship already exists with status: ${existingFriendship.status}`);
    }

    // 3. Crear la nueva solicitud (estado 'pending' por defecto)
    const newFriendship = this.friendshipRepository.create({
      userIdSender: senderId,
      userIdReceiver: receiverId,
    });

    const savedFriendship = await this.friendshipRepository.save(newFriendship);

    // Lógica de notificación al receiverId

    return savedFriendship;
  }

  /**
   * Acepta una solicitud de amistad pendiente.
   * IDs: string (UUID)
   */
  async acceptRequest(friendshipId: string, acceptorId: string): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findOne({ where: { friendship_id: friendshipId } });

    if (!friendship) {
      throw new Error('Friendship request not found.');
    }

    // 1. Autorización: Solo el receptor (receiver) puede aceptar la solicitud.
    if (friendship.userIdReceiver !== acceptorId) {
      throw new Error('Unauthorized to accept this request.');
    }

    // 2. Estado: Solo se puede aceptar si está pendiente.
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new Error(`Cannot accept request in status: ${friendship.status}`);
    }

    // 3. Actualizar estado a 'accepted'
    friendship.status = FriendshipStatus.ACCEPTED;
    const acceptedFriendship = await this.friendshipRepository.save(friendship);

    // Lógica de notificación al senderId

    return acceptedFriendship;
  }

  /**
   * Elimina una amistad aceptada o rechaza una pendiente (borra el registro).
   * IDs: string (UUID)
   */
  async removeFriendship(friendshipId: string, currentUserId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({ where: { friendship_id: friendshipId } });

    if (!friendship) {
      throw new Error('Friendship relation not found.');
    }

    // 1. Autorización: Solo un usuario en la relación puede eliminarla/rechazarla.
    if (friendship.userIdSender !== currentUserId && friendship.userIdReceiver !== currentUserId) {
      throw new Error('Unauthorized to modify this relationship.');
    }

    // Borra el registro de la base de datos
    await this.friendshipRepository.delete(friendshipId);
  }

  // ----------------------------------------------------------------------------------
  // METODO CORREGIDO PARA UUID Y user_id
  // ----------------------------------------------------------------------------------

  /**
   * Obtiene todos los amigos (estado 'accepted') de un usuario.
   * IDs: string (UUID).
   */
  async getFriends(userId: string): Promise<FriendProfile[]> {
    const rawResults = await this.friendshipRepository.createQueryBuilder("friendship")
      .where("(friendship.userIdSender = :userId OR friendship.userIdReceiver = :userId) AND friendship.status = :status", {
        userId,
        status: FriendshipStatus.ACCEPTED
      })
      // CORRECCIÓN CLAVE: Usamos 'friend.user_id' en el JOIN
      .leftJoinAndSelect(
        User,
        "friend",
        // Aquí debes usar el nombre de la columna que usa tu entidad User (user_id, no id)
        "(friend.user_id = friendship.userIdSender AND friend.user_id != :userId) OR (friend.user_id = friendship.userIdReceiver AND friend.user_id != :userId)",
        { userId }
      )
      // CORRECCIÓN CLAVE: Seleccionamos 'friend.user_id'
      .select(["friend.user_id", "friend.username"])
      .getRawMany();

    // Mapeamos los resultados crudos a FriendProfile
    const friends: FriendProfile[] = rawResults.map(r => ({
      // Mapeamos friend_user_id al 'id' de la interfaz FriendProfile
      id: r.friend_user_id,
      username: r.friend_username
    } as FriendProfile));

    return friends;
  }

  // ----------------------------------------------------------------------------------

  /**
   * Obtiene solicitudes pendientes que el usuario actual ha recibido.
   * IDs: string (UUID)
   */
  async getPendingRequests(receiverId: string): Promise<Friendship[]> {
    return this.friendshipRepository.find({
      where: {
        userIdReceiver: receiverId,
        status: FriendshipStatus.PENDING
      },
      relations: ['sender'] // Para mostrar quién envió la solicitud
    });
  }
}