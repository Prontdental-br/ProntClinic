import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/set-option.dto';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService){}
    
    @Get('/:option')
    getOption(option: string){
        return this.settingsService.getOption(option);
    }

    @Post()
    setOption(@Body() createOptionDto: CreateSettingsDto){
        return this.settingsService.setOptions(createOptionDto)
    }

}
