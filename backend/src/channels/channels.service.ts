import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dto-channels/create-channel.dto';
import { Channel } from './entities/channel.entity';
import { User } from 'src/users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { console } from 'inspector';

@Injectable()
export class ChannelsService {
    private s3: S3Client;

    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
    ) {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }

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
        console.log(this.channelRepository.find())
        return this.channelRepository.find();
    }

    async remove(id: string): Promise<void> {
        await this.channelRepository.delete(id);
    }

    async findOneById(id: string): Promise<Channel & { videoCount: number }> {
        const channel = await this.channelRepository.findOneBy({ channel_id: id });
        if (!channel) throw new NotFoundException(`Canal con ID ${id} no encontrado.`);
        const videoCount = await this.getVideoCount(id);
        return { ...channel, videoCount };
    }

    async findOneByUrl(url: string): Promise<Channel & { videoCount: number }> {
        const channel = await this.channelRepository.findOneBy({ url });
        if (!channel) throw new NotFoundException(`Canal con URL @${url} no encontrado.`);
        const videoCount = await this.getVideoCount(channel.channel_id);
        return { ...channel, videoCount };
    }

    async update(id: string, updateChannelDto: CreateChannelDto): Promise<Channel> {
        const channelToUpdate = await this.channelRepository.findOneBy({ channel_id: id });
        if (!channelToUpdate) throw new NotFoundException(`El canal con ID ${id} no fue encontrado.`);

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

    // ---------------- AWS S3 ----------------
    private async uploadToS3(file: Express.Multer.File, folder: string): Promise<string> {
        try {
            const bucketName = process.env.AWS_BUCKET_NAME!;
            const key = `${folder}/${uuidv4()}_${file.originalname}`;

            console.log('Key que se usará en S3:', key);

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3.send(command);

            console.log('URL pública generada:', `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`);

            return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        } catch (err) {
            console.error('S3 upload error:', err);
            throw new InternalServerErrorException('Failed to upload file to S3');
        }
    }

    async uploadBanner(id: string, file: Express.Multer.File): Promise<Channel> {
        const channel = await this.channelRepository.findOneBy({ channel_id: id });
        if (!channel) throw new NotFoundException(`Canal con ID ${id} no encontrado.`);

        const bannerUrl = await this.uploadToS3(file, 'banners');
        channel.bannerUrl = bannerUrl;

        console.log('Banner actualizado en DB:', bannerUrl);

        return this.channelRepository.save(channel);
    }

    async uploadPhoto(id: string, file: Express.Multer.File): Promise<Channel> {
        const channel = await this.channelRepository.findOneBy({ channel_id: id });
        if (!channel) throw new NotFoundException(`Canal con ID ${id} no encontrado.`);

        const photoUrl = await this.uploadToS3(file, 'profile');
        channel.photoUrl = photoUrl;
        console.log('Foto de perfil actualizada en DB:', photoUrl);

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

    async getVideoCount(channelId: string): Promise<number> {
        const result = await this.channelRepository
            .createQueryBuilder('channel')
            .leftJoin('channel.videos', 'video')
            .where('channel.channel_id = :channelId', { channelId })
            .select('COUNT(video.id)', 'count')
            .getRawOne();

        return parseInt(result.count);
    }
}
