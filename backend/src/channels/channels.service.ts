    import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { CreateChannelDto } from './dto-channels/create-channel.dto';
import { Channel } from './entities/channel.entity';
import { User } from 'src/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChannelsService {

constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
) { }

    async create(createChannelDto: CreateChannelDto, user: User): Promise<Channel> {
    const newChannel = this.channelRepository.create({
        channel_name: createChannelDto.channel_name,
        description: createChannelDto.description,
        url: createChannelDto.url,
        user: user,
    });

    // Asignar avatar por defecto basado en la primera letra del nombre del canal
    const firstLetter = newChannel.channel_name.charAt(0).toUpperCase();
    newChannel.photoUrl = `/assets/images/profile/${firstLetter}.png`;

    return this.channelRepository.save(newChannel);
}

    findAll(): Promise<Channel[]> {
        return this.channelRepository.find();
    }

    async remove(id: string): Promise<void> {
        await this.channelRepository.delete(id);
    }

    async findOneById(id: string): Promise<Channel> {
        const channel = await this.channelRepository.findOneBy({ channel_id: id });

        if (!channel) {
            throw new NotFoundException(`Canal con ID ${id} no encontrado.`);
        }

        return channel;
    }

    async findOneByUrl(url: string): Promise<Channel> {
        const channel = await this.channelRepository.findOneBy({ url: url });

        if (!channel) {
            throw new NotFoundException(`Canal con URL @${url} no encontrado.`);
        }

        return channel;
    }

    async update(id: string, updateChannelDto: CreateChannelDto): Promise<Channel> {
        const channelToUpdate = await this.channelRepository.findOneBy({ channel_id: id });

        if (!channelToUpdate) {
            throw new NotFoundException(`El canal con ID ${id} no fue encontrado.`);
        }

        if (updateChannelDto.url) {
            const newUrl = updateChannelDto.url.toLowerCase().trim();
            const existingChannel = await this.channelRepository.findOne({ where: { url: newUrl } });
            if (existingChannel && existingChannel.channel_id !== id) {
                throw new ConflictException(`La URL @${newUrl} ya está en uso.`);
            }
        }

        Object.assign(channelToUpdate, updateChannelDto);

        return this.channelRepository.save(channelToUpdate);
    }

    async uploadBanner(id: string, file: any): Promise<Channel> {
        const channel = await this.channelRepository.findOneBy({ channel_id: id });

        if (!channel) {
            throw new NotFoundException(`Canal con ID ${id} no encontrado.`);
        }

        // Guardar archivo en carpeta uploads del backend
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'banners');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Si ya existe un banner previo que no sea el por defecto, eliminarlo para ahorrar espacio
        if (channel.bannerUrl && !channel.bannerUrl.startsWith('/assets/images/studio_media/')) {
            const oldFilePath = path.join(__dirname, '..', '..', channel.bannerUrl);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        const filename = `${id}_${Date.now()}_${file.originalname}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, file.buffer);

        // Actualizar la entidad con la ruta o URL del banner
        channel.bannerUrl = `/uploads/banners/${filename}`;

        return this.channelRepository.save(channel);
    }

    async uploadPhoto(id: string, file: any): Promise<Channel> {
        const channel = await this.channelRepository.findOneBy({ channel_id: id });

        if (!channel) {
            throw new NotFoundException(`Canal con ID ${id} no encontrado.`);
        }

        // Guardar archivo en carpeta uploads del backend
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profile');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Si ya existe una foto previa que no sea la por defecto, eliminarla para ahorrar espacio
        if (channel.photoUrl && !channel.photoUrl.startsWith('/assets/images/profile/')) {
            const oldFilePath = path.join(__dirname, '..', '..', channel.photoUrl);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        const filename = `${id}_${Date.now()}_${file.originalname}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, file.buffer);

        // Actualizar la entidad con la ruta o URL de la foto
        channel.photoUrl = `/uploads/profile/${filename}`;

        return this.channelRepository.save(channel);
    }

    async setDefaultPhoto(id: string): Promise<Channel> {
        const channel = await this.findOneById(id);

        const firstLetter = channel.channel_name.charAt(0).toUpperCase();
        channel.photoUrl = `/assets/images/profile/${firstLetter}.png`;

        return this.channelRepository.save(channel);
    }

    async setDefaultBanner(id: string): Promise<Channel> {
        const channel = await this.findOneById(id);

        channel.bannerUrl = `/assets/images/studio_media/catube-pc.png`;

        return this.channelRepository.save(channel);
    }
}
