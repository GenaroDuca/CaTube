import { Controller, Get, Post, Param, Query, UseGuards, Request, ForbiddenException, Body, UnauthorizedException, Req, HttpCode, Delete, HttpStatus, BadRequestException, Patch } from '@nestjs/common';
// Asegúrate de que esta ruta a JwtAuthGuard sea correcta
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { RoomsService } from '../rooms/rooms.service';
import { GetHistoryQueryDto } from './dto/get-history-query.dto';
import { CreateMessageDto } from './dto/create-message.dto'; // DTO para la creación REST
import { UpdateMessageDto } from './dto/update-message.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly roomsService: RoomsService
  ) { }

  @Post()
  async createMessage(
    @Body() payload: CreateMessageDto,
    @Request() req
  ) {
    const senderId = req.user.id;
    const { targetUserId, content } = payload;

    // 1. Obtener la Sala: Llama al método de tu RoomsService
    const room = await this.roomsService.getOrCreatePrivateRoom(senderId, targetUserId);

    // 2. Persistencia: Llama al método 'create' del MessagesService
    const savedMessage = await this.messagesService.create(
      senderId,
      room.room_id,
      content
    );

    return savedMessage;
  }

  @Patch(':messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() payload: UpdateMessageDto,
    @Request() req
  ) {
    const userId = req.user.id;
    const { content } = payload;

    if (!content) {
      throw new BadRequestException('El contenido del mensaje no puede estar vacío.');
    }

    const message = await this.messagesService.findOne(messageId);

    if (message.senderId !== userId) {
      throw new ForbiddenException("No tienes permiso para editar este mensaje.");
    }

    const updatedMessage = await this.messagesService.updateContent(
      messageId,
      content
    );

    return updatedMessage;
  }

  @Get(':roomId')
  async getMessageHistory(
    @Param('roomId') roomId: string,
    @Query() query: GetHistoryQueryDto, // DTO para la paginación
    @Request() req
  ) {
    const userId = req.user.id;

    // 1. VERIFICACIÓN DE MEMBRESÍA (Seguridad)
    const userRooms = await this.roomsService.findAllRoomsByUserId(userId);
    const isMember = userRooms.some(room => room.room_id === roomId);

    if (!isMember) {
      throw new ForbiddenException("Acceso denegado. No eres miembro de esta sala de chat.");
    }

    // 2. RECUPERAR EL HISTORIAL
    return this.messagesService.findRoomHistory(roomId);
  }

}