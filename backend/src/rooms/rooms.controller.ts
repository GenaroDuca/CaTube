import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException, BadRequestException } from '@nestjs/common';
// Asume que esta es la ruta correcta a tu Guard de autenticación
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomsService } from './rooms.service';

/**
 * El objeto Request (req) en NestJS con JwtAuthGuard tendrá la siguiente estructura:
 * req.user = { userId: string, username: string }
 */
interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard) // Protege todas las rutas de este controlador
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  /**
   * Endpoint GET /rooms/my-rooms
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
   * Endpoint POST /rooms/private
   * Inicia o recupera una conversación privada con otro usuario por su ID.
   * El servicio se encarga de calcular el ID compuesto (room_id).
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

    // VERIFICACIÓN ESTRICTA (Si targetUserId viene undefined/null, esto falla la request)
    if (!userId || !targetUserId) {
      throw new BadRequestException("Ambos IDs de usuario son requeridos para la sala privada.");
    }

    return this.roomsService.getOrCreatePrivateRoom(userId, targetUserId);
  }
}
