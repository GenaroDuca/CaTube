import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Friendship, FriendshipStatus } from './entities/friendship.entity';
import { User } from '../users/entities/user.entity';
import { FriendProfile } from "./friend-profile.interface";

import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly notificationsService: NotificationsService,
  ) { }

  /**
   * Crea y envía una solicitud de amistad.
   */
  async sendRequest(senderId: string, receiverId: string): Promise<Friendship> {
    if (senderId === receiverId) {
      throw new ForbiddenException('Cannot send a friendship request to yourself.');
    }

    const receiver = await this.userRepository.findOne({ where: { user_id: receiverId } });
    if (!receiver) {
      throw new NotFoundException('Receiver user not found.');
    }

    // Verificar si ya existe una relación (cualquier estado)
    const existingFriendship = await this.friendshipRepository.createQueryBuilder("friendship")
      .where("(friendship.userIdSender = :senderId AND friendship.userIdReceiver = :receiverId) OR (friendship.userIdSender = :receiverId AND friendship.userIdReceiver = :senderId)", { senderId, receiverId })
      .getOne();

    if (existingFriendship) {
      throw new ConflictException(`A relationship already exists with status: ${existingFriendship.status}.`);
    }

    // Crear la nueva solicitud (estado 'pending' por defecto)
    const newFriendship = this.friendshipRepository.create({
      userIdSender: senderId,
      userIdReceiver: receiverId,
    });

    const savedFriendship = await this.friendshipRepository.save(newFriendship);

    // NOTIFICACIÓN AL RECEPTOR (El usuario que recibió la solicitud)
    try {
      await this.notificationsService.createNotification(
        receiverId,
        senderId,
        NotificationType.FRIEND_REQUEST,
        'sent you a friend request!',
        `/profile/${senderId}`,
      );
    } catch (e) {
      console.error('Failed to create FRIEND_REQUEST notification:', e);
    }

    return savedFriendship;
  }

  /**
   * Acepta una solicitud de amistad pendiente.
   */
  async acceptRequest(friendshipId: string, acceptorId: string): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findOne({ where: { friendship_id: friendshipId } });

    if (!friendship) {
      throw new NotFoundException('Friendship request not found.');
    }

    // 1. Autorización: Solo el receptor (receiver) puede aceptar la solicitud.
    if (friendship.userIdReceiver !== acceptorId) {
      throw new ForbiddenException('Unauthorized to accept this request.');
    }

    // 2. Estado: Solo se puede aceptar si está pendiente.
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new ConflictException(`Cannot accept request in status: ${friendship.status}`);
    }

    // 3. Actualizar estado a 'accepted'
    friendship.status = FriendshipStatus.ACCEPTED;
    const acceptedFriendship = await this.friendshipRepository.save(friendship);

    // NOTIFICACIÓN AL EMISOR (El usuario cuya solicitud fue aceptada)
    try {
      const senderId = friendship.userIdSender;
      const newFriendId = acceptorId;

      await this.notificationsService.createNotification(
        senderId,
        newFriendId,
        NotificationType.FRIEND_ACCEPTED,
        'accepted your friend request!',
        `/profile/${newFriendId}`,
      );
    } catch (e) {
      console.error('Failed to create FRIEND_ACCEPTED notification:', e);
    }

    return acceptedFriendship;
  }

  /**
   * Elimina una amistad aceptada o rechaza una pendiente (borra el registro).
   */
  async removeFriendship(friendshipId: string, currentUserId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({ where: { friendship_id: friendshipId } });

    if (!friendship) {
      throw new NotFoundException('Friendship relation not found.');
    }

    // 1. Autorización: Solo un usuario en la relación puede eliminarla/rechazarla.
    if (friendship.userIdSender !== currentUserId && friendship.userIdReceiver !== currentUserId) {
      throw new ForbiddenException('Unauthorized to modify this relationship.');
    }

    // Borra el registro de la base de datos
    await this.friendshipRepository.delete(friendshipId);
  }

  /**
   * Obtiene todos los amigos (estado 'accepted') de un usuario.
   */
  async getFriends(userId: string): Promise<FriendProfile[]> {
    const rawResults = await this.friendshipRepository.createQueryBuilder("friendship")
      .where("(friendship.userIdSender = :userId OR friendship.userIdReceiver = :userId) AND friendship.status = :status", {
        userId,
        status: FriendshipStatus.ACCEPTED
      })
      .leftJoinAndSelect(
        User,
        "friend",
        "((friend.user_id = friendship.userIdSender AND friend.user_id != :userId) OR (friend.user_id = friendship.userIdReceiver AND friend.user_id != :userId))",
        { userId }
      )
      // Unión a la tabla de canales
      .leftJoin(
        'channels',
        "channel",
        "channel.user_id = friend.user_id" 
      )
      .select([
        "friend.user_id AS friend_id",
        "friend.username AS friend_username",
        "channel.channel_id AS friend_channelId",
        "channel.url AS friend_channelUrl",
        "friendship.friendship_id AS friendship_id",
        "friend.avatar_url AS friend_avatarUrl"
      ])
      .getRawMany();

    return rawResults.map(r => ({
      id: r.friend_id,
      username: r.friend_username,
      friendshipId: r.friendship_id,
      avatarUrl: r.friend_avatarUrl,
      channelId: r.friend_channelId,
      channelUrl: r.friend_channelUrl
    } as FriendProfile));
  }

  /**
   * Obtiene solicitudes pendientes que el usuario actual ha recibido.
   */
  async getPendingRequests(receiverId: string): Promise<Friendship[]> {
    return this.friendshipRepository.find({
      where: {
        userIdReceiver: receiverId,
        status: FriendshipStatus.PENDING
      },
      relations: ['sender']
    });
  }
}