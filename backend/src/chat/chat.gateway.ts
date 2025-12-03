import { WebSocketGateway, SubscribeMessage, WebSocketServer, ConnectedSocket, MessageBody, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { RoomsService } from '../rooms/rooms.service';
import { MessagesService } from '../messages/messages.service';
import { WsJwtAuthGuard } from '../auth/ws-jwt-auth.guard'; 

interface AuthenticatedUserPayload {
    id: string;
}

@WebSocketGateway({
    cors: { origin: '*' },
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly roomsService: RoomsService,
        private readonly messagesService: MessagesService,
    ) { }

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage('chat message')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { toUserId: string, content: string }
    ) {
        const userPayload: AuthenticatedUserPayload = (client as any).user;
        if (!userPayload || !userPayload.id) {
            throw new WsException('Fallo de autenticación: El token no es válido o está ausente.');
        }

        const senderId = userPayload.id; 
        const receiverId = payload.toUserId;

        // 1. Obtener la sala (Crear si no existe)
        const room = await this.roomsService.getOrCreatePrivateRoom(senderId, receiverId);

        // 2. Unir el socket a la sala
        client.join(room.room_id);

        // 3. Guardar el mensaje en la DB
        const savedMessage = await this.messagesService.create(
            senderId,
            room.room_id,
            payload.content
        );
        
        //Asegurarse de enviar el ID del mensaje
        const messageResponse = {
            id: savedMessage.message_id,
            content: savedMessage.content,
            senderId: senderId,
            sender: savedMessage.sender?.username || 'Usuario Desconocido',
            roomId: room.room_id,
            timestamp: savedMessage.timestamp,
        };

        // 4. Emitir el mensaje a todos los participantes de la sala
        this.server.to(room.room_id).emit('chat message', messageResponse);

        return messageResponse;
    }

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage('delete message')
    async handleDeleteMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { messageId: string } 
    ) {
        const userPayload: AuthenticatedUserPayload = (client as any).user;

        if (!userPayload || !userPayload.id) {
            throw new WsException('Fallo de autenticación.');
        }

        const userId = userPayload.id;
        const messageIdToDelete = payload.messageId;

        if (!messageIdToDelete) {
            throw new WsException('Falta el ID del mensaje.');
        }

        let deletedMessageRoomId: string;
        
        try {
            const message = await this.messagesService.findOne(messageIdToDelete);
            
            if (!message || message.senderId !== userId) {
                // Si el mensaje no existe o no es el dueño, lanza una excepción
                throw new WsException('No autorizado para eliminar este mensaje o mensaje no encontrado.');
            }

            deletedMessageRoomId = message.roomId;
            
            // 2. ELIMINAR DE LA BASE DE DATOS
            await this.messagesService.delete(messageIdToDelete); 
            
            // 3. EMITIR LA CONFIRMACIÓN A TODOS LOS PARTICIPANTES
            if (deletedMessageRoomId) {
                this.server.to(deletedMessageRoomId).emit('message deleted', {
                    id: messageIdToDelete, 
                    roomId: deletedMessageRoomId,
                    deletedBy: userId,
                });
            }
            
            // 4. Se devuelve el ID eliminado
            return { messageId: messageIdToDelete };

        } catch (error) {
            console.error('Error al intentar eliminar el mensaje:', error.message);
            if (error instanceof WsException) {
                throw error;
            }
            throw new WsException('Error interno al intentar eliminar el mensaje.');
        }
    }

    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage('edit message')
    async handleEditMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { messageId: string, newContent: string } 
    ) {
        const userPayload: AuthenticatedUserPayload = (client as any).user;

        if (!userPayload || !userPayload.id) {
            throw new WsException('Fallo de autenticación.');
        }

        const userId = userPayload.id;
        const { messageId, newContent } = payload;
        
        const trimmedContent = newContent ? newContent.trim() : '';

        if (!messageId || !trimmedContent) {
            throw new WsException('Faltan el ID del mensaje o el contenido.');
        }

        let updatedMessage: any; 
        
        try {
            // 1. Obtener el mensaje para verificar la propiedad
            // Usamos findOne que ya implementaste en MessagesService
            const messageToUpdate = await this.messagesService.findOne(messageId);
            
            if (!messageToUpdate || messageToUpdate.senderId !== userId) {
                // Si el mensaje no existe o no es el dueño, lanza una excepción
                throw new WsException('No autorizado para editar este mensaje.');
            }

            // 2. ACTUALIZAR EN LA BASE DE DATOS
            updatedMessage = await this.messagesService.updateContent(messageId, trimmedContent); 
            
            // 3. EMITIR LA CONFIRMACIÓN A TODOS LOS PARTICIPANTES
            if (messageToUpdate.roomId) {
                
                // El objeto que enviamos de vuelta al cliente para que actualice su estado
                const updatedMsgPayload = {
                    id: updatedMessage.message_id,
                    content: updatedMessage.content,
                    roomId: messageToUpdate.roomId,
                    isEdited: true,
                };
                
                this.server.to(messageToUpdate.roomId).emit('message updated', updatedMsgPayload);
            }
            
            return { messageId, content: trimmedContent };

        } catch (error) {
            console.error('Error al intentar editar el mensaje:', error.message);
            if (error instanceof WsException) {
                throw error;
            }
            throw new WsException('Error interno al intentar editar el mensaje.');
        }
    }
}