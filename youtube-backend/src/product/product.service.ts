import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Store } from 'src/store/entities/store.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number) {
    // 1. Encontrar la tienda del usuario.
    const store = await this.storeRepository.findOne({
      where: { channel: { user: { user_id: userId } } },
    });

    if (!store) {
      throw new NotFoundException(`Store for user with ID ${userId} not found.`);
    }

    // 2. Crear la nueva instancia del producto y asociarla a la tienda.
    const newProduct = this.productRepository.create({ ...createProductDto, store });

    // 3. Guardar el producto en la base de datos.
    return this.productRepository.save(newProduct);
  }

  findAll() {
    return `This action returns all product`;
  }

  async findMyProducts(userId: number): Promise<Product[]> {
    // 1. Encontrar la tienda del usuario.
    const store = await this.storeRepository.findOne({
      where: { channel: { user: { user_id: userId } } },
    });

    if (!store) {
      throw new NotFoundException(`Store for user with ID ${userId} not found.`);
    }

    // 2. Devolver los productos de esa tienda específica.
    return this.productRepository.find({ where: { store: { store_id: store.store_id } } });
  }

  async findOne(id: number, userId: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { product_id: id },
      relations: ['store', 'store.channel', 'store.channel.user'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    if (product.store.channel.user.user_id !== userId) {
      throw new UnauthorizedException('You are not authorized to view this product.');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, userId: number): Promise<Product> {
    // Usamos findOne para asegurarnos de que el usuario es el propietario antes de actualizar.
    const productToUpdate = await this.findOne(id, userId);

    // Mezclamos los datos nuevos con los existentes.
    Object.assign(productToUpdate, updateProductDto);

    return this.productRepository.save(productToUpdate);
  }

  remove(id: number) {
    return this.productRepository.delete(id);
  }

  async removeProductAsOwner(productId: number, userId: number) {
    // 1. Buscar el producto y cargar la relación con la tienda y el canal.
    const product = await this.productRepository.findOne({
      where: { product_id: productId },
      relations: ['store', 'store.channel', 'store.channel.user'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    // 2. Verificar que el usuario que hace la petición es el dueño del producto.
    if (product.store.channel.user.user_id !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this product.');
    }

    // 3. Si la verificación es correcta, eliminar el producto.
    await this.productRepository.remove(product);
  }
}
