import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';
import { Channel } from 'src/channels/entities/channel.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private usersService: UsersService,
  ) {}

  async create(createStoreDto: CreateStoreDto, userId: string): Promise<Store> {
    const user = await this.usersService.findOneById(userId); // Necesitarás crear este método en UsersService
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    // Obtener el canal asociado al usuario
    const channel = user.channel;
    if (!channel) {
      throw new NotFoundException(`El usuario con ID ${userId} no tiene un canal asociado.`);
    }

    const existingStore = await this.storeRepository.findOne({ where: { channel: { channel_id: channel.channel_id } } });

    if (existingStore) {
      throw new ConflictException('Este canal ya tiene una tienda creada.');
    }

    const newStore = this.storeRepository.create({
      ...createStoreDto,
      channel: channel,
    });

    return this.storeRepository.save(newStore);
  }

  async findStoreByUserId(userId: string): Promise<Store> {
    const user = await this.usersService.findOneById(userId);
    if (!user || !user.channel) {
      // Si el usuario autenticado no tiene un canal, es una condición de error.
      throw new NotFoundException(`No se encontró un canal para el usuario con ID ${userId}.`);
    }

    const store = await this.storeRepository.findOne({
      where: { channel: { channel_id: user.channel.channel_id } },
    });

    if (!store) {
      // Lanzamos un error 404 explícito si no se encuentra la tienda.
      throw new NotFoundException(`No se encontró una tienda para el canal.`);
    }

    return store;
  }

  findAll() {
    return `This action returns all store`;
  }

  findOne(id: string) {
    return `This action returns a #${id} store`;
  }

  update(id: string, updateStoreDto: UpdateStoreDto) {
    return `This action updates a #${id} store`;
  }

  remove(id: string) {
    return `This action removes a #${id} store`;
  }
}
