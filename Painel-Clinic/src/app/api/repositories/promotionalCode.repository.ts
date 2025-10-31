import { PromotionalCode } from "../db/models/PromotionalCode.model";


class PromotionalCodeRepository {
  async findAll(id: string, role: string): Promise<PromotionalCode[]> {

    if(id && role === 'admin') {
        const codes = await PromotionalCode.findAll();

        return codes;
    }


    return await PromotionalCode.findAll({ where: { id } })

  }

  async create(data: any): Promise<void> {
    await PromotionalCode.create({ ...data });
  }

  async edit(id: string, data: any): Promise<void> {
    await PromotionalCode.update(data, { where: { id } })
  }

  async findByPk(id: string): Promise<PromotionalCode | null> {
    const data = await PromotionalCode.findByPk(id)

    return data;
  }
}

export default new PromotionalCodeRepository()
