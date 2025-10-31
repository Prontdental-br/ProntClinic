import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { TenantService } from 'src/tenant/tenant/tenant.service';

import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { OpportunityColumn } from './entities/opportunity-columns.entity';
import { OpportunityTask } from './entities/opportunity-tasks.entity';
import { OpportunityLabel } from './entities/opportunity-label.entity';
import { MoveTaskDtoOpportunity } from './dto/move-task.dto';

@Injectable({ scope: Scope.REQUEST })
export class OpportunityService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(OpportunityColumn)
  private readonly columnModel: typeof OpportunityColumn;

  @TenantModel(OpportunityTask)
  private readonly taskModel: typeof OpportunityTask;

  @TenantModel(OpportunityLabel)
  private readonly labelModel: typeof OpportunityLabel;

  async createColumn(title: string, color?: string): Promise<OpportunityColumn> {
    const lastColumn = await this.columnModel.findOne({
      where: { accountId: this.tenantService.tenant.id },
      order: [['order', 'DESC']],
    });

    const newOrder = lastColumn ? lastColumn.order + 1 : 0;

    return this.columnModel.create({
      title,
      color,
      accountId: this.tenantService.tenant.id,
      order: newOrder,
    });
  }

  async findAllColumns(): Promise<OpportunityColumn[]> {
    return this.columnModel.findAll({
      where: { accountId: this.tenantService.tenant.id },
      include: [{ model: this.taskModel, as: 'tasks' }],
      order: [
        ['order', 'ASC'],
        [{ model: this.taskModel, as: 'tasks' }, 'created_at', 'DESC'],
      ],
    });
  }

  async updateOrderColumn(id: string, order: number) {
    return await this.columnModel.update({ order }, { where: { id } });
  }

  async findColumnById(id: string): Promise<OpportunityColumn> {
    const column = await this.columnModel.findByPk(id, {
      include: [OpportunityTask],
      order: [['order', 'ASC']],
    });
    if (!column) throw new NotFoundException('Coluna não encontrada');
    return column;
  }

  async updateColumn(id: string, title: string, color?: string): Promise<OpportunityColumn> {
    const column = await this.findColumnById(id);
    await column.update({
      title,
      color,
      where: { accountId: this.tenantService.tenant.id },
    });
    return column;
  }

  async deleteColumn(id: string): Promise<void> {
    const column = await this.columnModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
    });

    await column.destroy();
  }

  async createTask(
    columnId: string,
    data: Partial<OpportunityTask>,
  ): Promise<OpportunityTask> {
    return this.taskModel.create({
      ...data,
      columnId,
      accountId: this.tenantService.tenant.id,
    });
  }

  async findTasksByColumn(columnId: string): Promise<OpportunityTask[]> {
    return this.taskModel.findAll({
      where: { columnId, accountId: this.tenantService.tenant.id },
      order: [['order', 'ASC']],
    });
  }

  async updateOrderTasks(
    tasks: { id: string; order: number }[],
  ): Promise<void> {
    await Promise.all(
      tasks.map(async (task) => {
        await this.taskModel.update(
          { order: task.order },
          { where: { id: task.id } },
        );
      }),
    );
  }

  async moveTask(dto: MoveTaskDtoOpportunity): Promise<void> {
      const { tasks, columnId } = dto;

/*       console.log('------------------------------------------');
      console.log('MOVETASK INICIADO');
      console.log(`NOVA COLUNA DE DESTINO (columnId): ${columnId}`);
      console.log(`TOTAL DE TAREFAS RECEBIDAS PARA A NOVA COLUNA: ${tasks.length}`);
      console.log('DADOS COMPLETOS RECEBIDOS (tasks):', tasks);
      console.log('------------------------------------------'); */

      await Promise.all(
          tasks.map(async (task, index) => {
              //console.log(`ATUALIZANDO TAREFA ID: ${task.id} | NOVA COLUNA: ${columnId} | NOVA ORDEM (index): ${index}`);
              
              await this.taskModel.update(
                  { columnId, order: index },
                  { where: { id: task.id } },
              );
          }),
      );
      
      //console.log('MOVETASK CONCLUÍDO');
  }

  async findTaskById(id: string): Promise<OpportunityTask> {
    const task = await this.taskModel.findByPk(id);
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async updateTask(
    id: string,
    data: Partial<OpportunityTask>,
  ): Promise<OpportunityTask> {
    const task = await this.taskModel.findOne({
      where: {
        id,
        // account_id: this.tenantService.tenant.id,
      },
    });

    console.log('task', task);

    await task.update(data);

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.findTaskById(id);
    await task.destroy();
  }

  async findAllLabels() {
    return this.labelModel.findAll({
      where: { accountId: this.tenantService.tenant.id },
    });
  }

  async findOneLabel(id: string) {
    return this.labelModel.findByPk(id);
  }

  async createLabel(name: string, color?: string) {
    return this.labelModel.create({
      name,
      color,
      accountId: this.tenantService.tenant.id,
    });
  }

  async updateLabel(id: string, name?: string, color?: string) {
    const label = await this.findOneLabel(id);
    if (!label) return null;

    if (name) label.name = name;
    if (color) label.color = color;

    await label.save();
    return label;
  }

  async deleteLabel(id: string) {
    const label = await this.findOneLabel(id);
    if (!label) return null;

    await label.destroy();
    return { message: 'Label deleted successfully' };
  }
}
