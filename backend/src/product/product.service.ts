import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Store } from 'src/store/entities/store.entity';
import * as fs from 'fs';
import * as path from 'path';
import { getUploadsPath } from 'src/utils/uploads-path';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string, file?: any) {
    // 1. Encontrar la tienda del usuario.
    const store = await this.storeRepository.findOne({
      where: { channel: { user: { user_id: userId } } },
    });

    if (!store) {
      throw new NotFoundException(`Store for user with ID ${userId} not found.`);
    }

    // 2. Crear la nueva instancia del producto y asociarla a la tienda.
    const newProduct = this.productRepository.create({ ...createProductDto, store });

    // 3. Guardar el producto en la base de datos primero para obtener el ID.
    await this.productRepository.save(newProduct);

    // 4. Si hay un archivo de imagen, guardarlo y asignar la ruta
    if (file) {
      const uploadDir = getUploadsPath('store', 'products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `${newProduct.product_id}_${Date.now()}_${file.originalname}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, file.buffer);

      newProduct.image_url = `/uploads/store/products/${filename}`;

      // Guardar nuevamente con la imagen
      await this.productRepository.save(newProduct);
    }

    return newProduct;
  }

  findAll() {
    return `This action returns all product`;
  }

  async findMyProducts(userId: string): Promise<Product[]> {
    // 1. Encontrar la tienda del usuario.
    const store = await this.storeRepository.findOne({
      where: { channel: { user: { user_id: userId } } },
    });

    if (!store) {
      // Return empty array instead of throwing error
      return [];
    }

    // 2. Devolver los productos de esa tienda específica.
    return this.productRepository.find({ where: { store: { store_id: store.store_id } } });
  }

  async findOne(id: string, userId: string): Promise<Product> {
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

  async update(id: string, updateProductDto: UpdateProductDto, userId: string, file?: any): Promise<Product> {
    // Usamos findOne para asegurarnos de que el usuario es el propietario antes de actualizar.
    const productToUpdate = await this.findOne(id, userId);

    // Mezclamos los datos nuevos con los existentes.
    Object.assign(productToUpdate, updateProductDto);

    // Si hay un archivo de imagen, guardarlo y actualizar la ruta de la imagen
    if (file) {
      // Guardar archivo en carpeta uploads del backend
      const uploadDir = getUploadsPath('store', 'products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Si ya existe una imagen previa, eliminarla para ahorrar espacio
      if (productToUpdate.image_url && !productToUpdate.image_url.startsWith('/assets/')) {
        const oldFilePath = path.join(__dirname, '..', '..', productToUpdate.image_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      const filename = `${id}_${Date.now()}_${file.originalname}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, file.buffer);

      // Actualizar la entidad con la ruta o URL de la imagen
      productToUpdate.image_url = `/uploads/store/products/${filename}`;
    }

    return this.productRepository.save(productToUpdate);
  }

  remove(id: string) {
    return this.productRepository.delete(id);
  }

  async removeProductAsOwner(productId: string, userId: string) {
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
