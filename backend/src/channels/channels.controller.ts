import { Body, Controller,Delete,Get, Param, Post, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChannelDto } from './dto-channels/create-channel.dto';
import { ChannelsService } from './channels.service';
import { User } from 'src/users/entities/user.entity';

@Controller('channels')
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) {}

    @Post()
    createChannel(@Body() createChannelDto: CreateChannelDto, user: User) {

        return this.channelsService.create(createChannelDto, user);
    }

    @Get()
    findAll(){
        return this.channelsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.channelsService.findOneById(id);
    }

    @Get('url/:url')
    findOneByUrl(@Param('url') url: string) {
        return this.channelsService.findOneByUrl(url);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.channelsService.remove(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateChannelDto: CreateChannelDto
    ) {
        return this.channelsService.update(id, updateChannelDto);
    }

    @Post(':id/photo')
    @UseInterceptors(FileInterceptor('photo'))
    uploadPhoto(@Param('id') id: string, @UploadedFile() file: any) {
        return this.channelsService.uploadPhoto(id, file);
    }

    @Post(':id/banner')
    @UseInterceptors(FileInterceptor('banner'))
    uploadBanner(@Param('id') id: string, @UploadedFile() file: any) {
        return this.channelsService.uploadBanner(id, file);
    }
}