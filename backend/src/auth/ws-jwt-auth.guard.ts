import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io'; // Importar Socket para tipado y acceso a handshake

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('jwt') {

    getRequest(context: ExecutionContext) {
        // 1. Obtiene el contexto del socket
        const client: Socket = context.switchToWs().getClient();

        // 2. Extrae el token del 'auth' que envías desde el frontend
        const token = client.handshake.auth?.token;

        // 3. Devuelve un objeto fake-request que el JwtStrategy pueda procesar
        return {
            headers: {
                authorization: `Bearer ${token}`,
            },
        };
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {

        if (err || !user) {
            const client: Socket = context.switchToWs().getClient();
            const token = client.handshake.auth?.token || 'TOKEN_NO_ENVIADO';

            console.error(`Token recibido (Primeros 30 chars): ${token.substring(0, 30)}...`);

            if (info && info.name) {
                console.error(`Razón del fallo: ${info.name}. Mensaje: ${info.message}`);
            } else {
                console.error('Error genérico:', err || info);
            }
            console.error('-------------------------------------------');
            throw err || new WsException('Fallo de autenticación: El token no es válido o está ausente.');
        }

        const client: Socket = context.switchToWs().getClient();
        (client as any).user = user;

        return user;
    }
}