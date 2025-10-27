// src/friendships/friendships.controller.ts

import { Controller, Post, Body, UseGuards, Req, Delete, Put, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendshipService } from './friendships.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';

// Importamos GetUser si lo creaste, sino usamos @Req()

@Controller('friendships')
@UseGuards(JwtAuthGuard) // Protege TODAS las rutas en este controlador
export class FriendshipsController {
    constructor(private readonly friendshipService: FriendshipService) { }

    // 1. ENVIAR SOLICITUD DE AMISTAD
    // POST /friendships
    @Post()
    async sendRequest(
        @Body() createFriendshipDto: CreateFriendshipDto, // Usamos el DTO para el cuerpo
        @Req() req: any
    ) {
        // Obtenemos el ID del usuario autenticado
        const senderId = req.user.id;
        const receiverId = createFriendshipDto.receiverId; // Obtenemos el ID del DTO

        return this.friendshipService.sendRequest(senderId, receiverId);
    }

    // 2. ACEPTAR SOLICITUD PENDIENTE
    // PUT /friendships/:friendshipId/accept
    @Put(':friendshipId/accept')
    async acceptRequest(
        @Req() req: any,
        @Param('friendshipId') friendshipId: string,
    ) {
        const acceptorId = req.user.id;
        return this.friendshipService.acceptRequest(friendshipId, acceptorId);
    }

    // 3. OBTENER SOLICITUDES RECIBIDAS PENDIENTES
    // GET /friendships/requests/received
    @Get('requests/received')
    async getPendingRequests(@Req() req: any) {
        const receiverId = req.user.id;
        return this.friendshipService.getPendingRequests(receiverId);
    }

    // 4. OBTENER LISTA DE AMIGOS
    // GET /friendships/my-friends
    @Get('my-friends')
    async getMyFriends(@Req() req: any) {
        const userId = req.user.id;
        return this.friendshipService.getFriends(userId);
    }
}