import { Whatsapp } from '../db/models';
import type { CreateWhatsapp } from '../whatsapp/interfaces';

class WhatsappRepository {
  async findAllCreatedByAdmin(): Promise<Whatsapp[]> {
    const connections = await Whatsapp.findAll({ where: { createdByAdmin: true }});

    return connections;
  }

  async create(data: CreateWhatsapp): Promise<void> {
    await Whatsapp.create({...data});
  }

  async findByPk(id: string): Promise<Whatsapp | null> {
    const data = await Whatsapp.findByPk(id)

    return data;
  }
}

export default new WhatsappRepository()
