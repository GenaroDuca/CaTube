import { Injectable, Inject, forwardRef, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto-users/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ChannelsService } from 'src/channels/channels.service';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @Inject(forwardRef(() => ChannelsService))
        private channelsService: ChannelsService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const capitalizedUsername = createUserDto.username.charAt(0).toUpperCase() + createUserDto.username.slice(1);

        const existingUser = await this.usersRepository.findOne({
            where: { username: capitalizedUsername },
        });
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = this.usersRepository.create({
            username: capitalizedUsername,
            email: createUserDto.email,
            password: hashedPassword,
        });

        const savedUser = await this.usersRepository.save(newUser);

        const defaultChannelDto = {
            channel_name: savedUser.username,
            description: `Bienvenido al canal de ${savedUser.username}`,
            url: savedUser.username.toLowerCase(),
        };

        await this.channelsService.create(defaultChannelDto, savedUser);

        return savedUser;
    }
    
    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOneByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { username },
            relations: ['channel'],
        });
    }

    findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { user_id: id },
            relations: ['channel'], 
        });
    }

    async remove(id: string): Promise<void> {
        try {
            const user = await this.usersRepository.findOne({
                where: { user_id: id },
                relations: ['channel'],
            });

            if (!user) {
                throw new Error('User not found');
            }

            if (user.channel) {
                await this.channelsService.remove(user.channel.channel_id);
            }

            await this.usersRepository.delete(id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}
