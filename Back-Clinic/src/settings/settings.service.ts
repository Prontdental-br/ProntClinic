import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Settings } from './entities/settings.entity';
import { CreateSettingsDto } from './dto/set-option.dto';


@Injectable()
export class SettingsService {
    constructor(
        @InjectModel(Settings) private settingsModel: typeof Settings,
    ){}

    async getOption(option: string, default_value: any = null): Promise<any | null>{
        const data = await this.settingsModel.findOne({
            where:{
                name: option
            }
        });
        
        try{
           return JSON.parse(data?.value)
        }catch(e){
            return data?.value || default_value;
        }
    }

    async setOptions(createOptionDto: CreateSettingsDto): Promise<boolean> {
        await Promise.all(Object.entries(createOptionDto).map(async ([option, value]) => {
            await this.setOption(option, value)
        }))

        return true;
    }
    

    async setOption(option: string, value: any){
        const register = await this.getOption(option);
        console.log(`Resultado da busca por ${option}: ${register}`)
        if(register !== null && register !== undefined){
            return await this.settingsModel.update(
                {
                    value: JSON.stringify(value)
                },
                {
                    where: {
                        name: option
                    },
                }
            )[0] > 0;
        }
        
        await this.settingsModel.create({
            name: option,
            value: JSON.stringify(value)
        })

        return true;
    }
    
}
