import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Store } from 'src/store/entities/store.entity';
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from 'src/aws/s3.config';

@Injectable()
export class ProductService {
  private readonly s3Client = getS3Client();

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) { }

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

    // 4. subirlo a S3 la foto de lproducto
    if (file) {
      const extension = file.originalname.split('.').pop();
      const key = `products/${newProduct.product_id}_${Date.now()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      newProduct.image_url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

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
      return [];
    }

    // 2. Devolver los productos de esa tienda específica.
    return this.productRepository.find({ where: { store: { store_id: store.store_id } } });
  }

  async findProductsByChannel(channelId: string): Promise<Product[]> {
    // 1. Buscar la tienda asociada al canal
    const store = await this.storeRepository.findOne({
      where: { channel: { channel_id: channelId } },
    });

    // Si no tiene tienda → no tiene productos, devolver []
    if (!store) {
      return [];
    }

    // 2. Buscar productos de esa tienda
    return this.productRepository.find({
      where: { store: { store_id: store.store_id } },
    });
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

    // Si hay un archivo de imagen, subirlo a S3
    if (file) {
      const extension = file.originalname.split('.').pop();
      const key = `products/${id}_${Date.now()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const newImageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      // Si ya existe una imagen previa en S3, eliminarla
      if (productToUpdate.image_url && productToUpdate.image_url.includes('amazonaws.com')) {
        const oldKey = productToUpdate.image_url.split('/').pop();
        if (oldKey) {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `products/${oldKey}`
          }));
        }
      }

      // Actualizar la entidad con la nueva URL de la imagen
      productToUpdate.image_url = newImageUrl;
    }

    return this.productRepository.save(productToUpdate);
  }

  async remove(id: string) {
    // Buscar el producto para obtener la URL de la imagen
    const product = await this.productRepository.findOne({ where: { product_id: id } });

    // Eliminar imagen de S3 si existe
    if (product?.image_url && product.image_url.includes('amazonaws.com')) {
      try {
        const imageKey = product.image_url.split('/').pop();
        if (imageKey) {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `products/${imageKey}`
          }));
        }
      } catch (error) {
        console.error('Error deleting product image from S3:', error);
      }
    }

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

    // 3. Eliminar imagen de S3 si existe
    if (product.image_url && product.image_url.includes('amazonaws.com')) {
      try {
        const imageKey = product.image_url.split('/').pop();
        if (imageKey) {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `products/${imageKey}`
          }));
        }
      } catch (error) {
        console.error('Error deleting product image from S3:', error);
      }
    }

    // 4. Si la verificación es correcta, eliminar el producto.
    await this.productRepository.remove(product);
  }
}
