import { Body, Controller,Delete,Get, Param, ParseIntPipe, Post, Patch } from '@nestjs/common';
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
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.channelsService.findOneById(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.channelsService.remove(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: string,
        @Body() updateChannelDto: CreateChannelDto
    ) {
        return this.channelsService.update(id, updateChannelDto);
    }
}
