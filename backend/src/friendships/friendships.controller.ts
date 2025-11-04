import { Controller, Post, Body, UseGuards, Req, Delete, Put, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendshipService } from './friendships.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';

@Controller('friendships')
@UseGuards(JwtAuthGuard) // Protege TODAS las rutas en este controlador
export class FriendshipsController {
    constructor(private readonly friendshipService: FriendshipService) { }

    // 1. ENVIAR SOLICITUD DE AMISTAD (POST /friendships)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async sendRequest(
        @Body() createFriendshipDto: CreateFriendshipDto,
        @Req() req: any
    ) {
        const senderId = req.user.id;
        const receiverId = createFriendshipDto.receiverId;

        // El servicio manejará las validaciones (si existe la relación, si es a sí mismo, etc.)
        return this.friendshipService.sendRequest(senderId, receiverId);
    }

    // 2. ACEPTAR SOLICITUD PENDIENTE (PUT /friendships/:friendshipId/accept)
    @Put(':friendshipId/accept')
    async acceptRequest(
        @Req() req: any,
        @Param('friendshipId') friendshipId: string,
    ) {
        const acceptorId = req.user.id;
        // Retorna la relación actualizada a 'ACCEPTED'
        return this.friendshipService.acceptRequest(friendshipId, acceptorId);
    }

    // 3. ELIMINAR AMISTAD / RECHAZAR SOLICITUD (DELETE /friendships/:friendshipId)
    // Usado para: rechazar una solicitud PENDING o eliminar una amistad ACCEPTED.
    @Delete(':friendshipId')
    @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content es ideal para DELETE exitosos
    async removeFriendship(
        @Req() req: any,
        @Param('friendshipId') friendshipId: string,
    ) {
        const currentUserId = req.user.id;
        // El servicio verifica la autorización antes de eliminar el registro.
        await this.friendshipService.removeFriendship(friendshipId, currentUserId);
    }

    // 4. OBTENER AMIGOS Y SOLICITUDES (GET /friendships)
    @Get()
    async getFriendsAndRequests(@Req() req: any) {
        const userId = req.user.id;
        
        // Ejecuta ambas promesas en paralelo para mayor velocidad.
        const [friends, receivedRequests] = await Promise.all([
            this.friendshipService.getFriends(userId),
            this.friendshipService.getPendingRequests(userId)
        ]);
        
        return {
            friends,
            receivedRequests,
        };
    }
}