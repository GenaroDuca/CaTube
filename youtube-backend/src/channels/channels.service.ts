import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { CreateChannelDto } from './dto-channels/create-channel.dto';
import { Channel } from './entities/channel.entity';
import { User } from 'src/users/entities/user.entity';

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
}