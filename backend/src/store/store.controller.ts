import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post()
  create(@Body() createStoreDto: CreateStoreDto, @Request() req) {
    const userId = req.user.id;
    return this.storeService.create(createStoreDto, userId);
  }

  @Get('my-store')
  findMyStore(@Request() req) {
    const userId = req.user.id;
    return this.storeService.findStoreByUserId(userId);
  }

  @Delete('delete-my-store')
  async deleteMyStore(@Request() req) {
    const userId = req.user.id;
    return this.storeService.deleteMyStore(userId);
  }

  @Get()
  findAll() {
    return this.storeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.update(id, updateStoreDto);
  }

}
