import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomsService } from './rooms.service';

//req.user = { userId: string, username: string }
interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard) 
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  /**
   * Obtiene la lista de todas las salas (conversaciones) del usuario autenticado.
   * Usado para cargar la barra lateral de chats.
   */
  @Get('my-rooms')
  async findMyRooms(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;

    // Llama al método de tu servicio.
    return this.roomsService.findAllRoomsByUserId(userId);
  }

  /**
   * Inicia o recupera una conversación privada con otro usuario por su ID.
   */
  @Post('private')
  async createOrGetPrivateRoom(
    @Body('targetUserId') targetUserId: string,
    @Request() req
  ) {
    const userId = req.user.id;

    if (userId === targetUserId) {
      throw new ForbiddenException("No puedes crear una sala contigo mismo.");
    }

    if (!userId || !targetUserId) {
      throw new BadRequestException("Ambos IDs de usuario son requeridos para la sala privada.");
    }

    return this.roomsService.getOrCreatePrivateRoom(userId, targetUserId);
  }
}
