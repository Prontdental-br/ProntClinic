/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { InjectModel } from '@nestjs/sequelize';
import { KanbanColumn } from './entities/kanban-column.entity';
import { KanbanTask } from './entities/kanban-task.entity';
import { KanbanLabel } from './entities/kanban-label.entity';
import { MoveTaskDto } from './dto/move-task.dto';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';

@Injectable({ scope: Scope.REQUEST })
export class KanbanService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(KanbanColumn)
  private readonly columnModel: typeof KanbanColumn;

  @TenantModel(KanbanTask)
  private readonly taskModel: typeof KanbanTask;

  @TenantModel(KanbanLabel)
  private readonly labelModel: typeof KanbanLabel;

  async createColumn(title: string): Promise<KanbanColumn> {
    const lastColumn = await this.columnModel.findOne({
      where: { accountId: this.tenantService.tenant.id },
      order: [['order', 'DESC']],
    });

    const newOrder = lastColumn ? lastColumn.order + 1 : 0;

    return this.columnModel.create({
      title,
      accountId: this.tenantService.tenant.id,
      order: newOrder,
    });
  }

  async findAllColumns(): Promise<KanbanColumn[]> {
    return this.columnModel.findAll({
      where: { accountId: this.tenantService.tenant.id },
      include: [{ model: this.taskModel, as: 'tasks' }],
      order: [
        ['order', 'ASC'],
        [{ model: this.taskModel, as: 'tasks' }, 'order', 'ASC'],
      ],
    });
  }

  async updateOrderColumn(id: string, order: number) {
    return await this.columnModel.update({ order }, { where: { id } });
  }

  async findColumnById(id: string): Promise<KanbanColumn> {
    const column = await this.columnModel.findByPk(id, {
      include: [KanbanTask],
      order: [['order', 'ASC']],
    });
    if (!column) throw new NotFoundException('Coluna não encontrada');
    return column;
  }

  async updateColumn(id: string, title: string): Promise<KanbanColumn> {
    const column = await this.findColumnById(id);
    await column.update({
      title,
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
    data: Partial<KanbanTask>,
  ): Promise<KanbanTask> {
    return this.taskModel.create({
      ...data,
      columnId,
      accountId: this.tenantService.tenant.id,
    });
  }

  async findTasksByColumn(columnId: string): Promise<KanbanTask[]> {
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

  async moveTask(dto: MoveTaskDto): Promise<void> {
    const { tasks, columnId } = dto;

    await Promise.all(
      tasks.map(async (task, index) => {
        await this.taskModel.update(
          { columnId, order: index },
          { where: { id: task.id } },
        );
      }),
    );
  }

  async findTaskById(id: string): Promise<KanbanTask> {
    const task = await this.taskModel.findByPk(id);
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async updateTask(id: string, data: Partial<KanbanTask>): Promise<KanbanTask> {
    const task = await this.taskModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
    });
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
