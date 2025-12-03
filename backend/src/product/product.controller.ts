import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createProductDto: CreateProductDto, @Request() req, @UploadedFile() file?: any) {
    const userId = req.user.id;
    return this.productService.create(createProductDto, userId, file);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-products')
  findMyProducts(@Request() req) {
    const userId = req.user.id;
    return this.productService.findMyProducts(userId);
  }

  // GET productos de un canal público (sin auth)
  @Get('channel/:channelId')
  async findProductsByChannel(@Param('channelId') channelId: string) {
    return this.productService.findProductsByChannel(channelId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.productService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req, @UploadedFile() file?: any) {
    const userId = req.user.id;
    return this.productService.update(id, updateProductDto, userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.productService.removeProductAsOwner(id, userId);
  }
}
