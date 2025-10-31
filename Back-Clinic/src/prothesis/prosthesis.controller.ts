/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';

import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

import { MoveTaskDtoOpportunity } from './dto/move-task.dto';
import { ProsthesisColumn } from './entities/prosthesis-columns.entity';
import { UpdateColumnOrderDtoProsthesis } from './dto/update-column-order';
import { ProsthesisTask } from './entities/prosthesis-tasks.entity';
import { UpdateTaskOrderDtoProsthesis } from './dto/update-task-order';
import { ProsthesisService } from './prosthesis.service';

@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
@Controller('prosthesis')
export class ProsthesisController {
  constructor(private readonly kanbanService: ProsthesisService) {}

  // column
  @Post('columns')
  createColumn(@Body('title') title: string): Promise<ProsthesisColumn> {
    return this.kanbanService.createColumn(title);
  }

  @Get('columns')
  getAllColumns(): Promise<ProsthesisColumn[]> {
    return this.kanbanService.findAllColumns();
  }

  @Put('columns/order')
  async updateColumnOrder(
    @Body() updateColumnOrderDto: UpdateColumnOrderDtoProsthesis,
  ) {
    await Promise.all(
      updateColumnOrderDto.columns.map(async (column) => {
        await this.kanbanService.updateOrderColumn(column.id, column.order);
      }),
    );
    return { message: 'Ordem das colunas atualizada!' };
  }

  @Get('columns/:id')
  getColumn(@Param('id') id: string): Promise<ProsthesisColumn> {
    return this.kanbanService.findColumnById(id);
  }

  @Patch('columns/:id')
  updateColumn(
    @Param('id') id: string,
    @Body('title') title: string,
  ): Promise<ProsthesisColumn> {
    return this.kanbanService.updateColumn(id, title);
  }

  @Delete('columns/:id')
  deleteColumn(@Param('id') id: string): Promise<void> {
    return this.kanbanService.deleteColumn(id);
  }

  @Get('columns/:columnId/tasks')
  getTasksByColumn(
    @Param('columnId') columnId: string,
  ): Promise<ProsthesisTask[]> {
    return this.kanbanService.findTasksByColumn(columnId);
  }

  @Post('tasks')
  createTask(
    @Body()
    data: {
      columnId: string;
      title: string;
      badgeText?: string[];
      comments?: string;
      dueDate?: Date;
    },
  ): Promise<ProsthesisTask> {
    return this.kanbanService.createTask(data.columnId, data);
  }

  @Get('/tasks/:id')
  getTask(@Param('id') id: string): Promise<ProsthesisTask> {
    return this.kanbanService.findTaskById(id);
  }

  @Patch('/tasks/:id')
  updateTask(@Param('id') id: string, @Body() data: Partial<ProsthesisTask>) {
    console.log('data', data);
    return this.kanbanService.updateTask(id, data);
  }

  @Put('/tasks/order')
  async updateTaskOrder(
    @Body() updateTaskOrderDto: UpdateTaskOrderDtoProsthesis,
  ) {
    await this.kanbanService.updateOrderTasks(updateTaskOrderDto.tasks);
    return { message: 'Ordem das tasks atualizada!' };
  }

  @Put('/tasks/move')
  async moveTask(@Body() moveTaskDto: MoveTaskDtoOpportunity) {
    await this.kanbanService.moveTask(moveTaskDto);

    return { message: 'Task movida com sucesso!' };
  }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: string): Promise<void> {
    return this.kanbanService.deleteTask(id);
  }

  @Get('labels')
  findAll() {
    return this.kanbanService.findAllLabels();
  }

  @Get('labels/:id')
  findOne(@Param('id') id: string) {
    return this.kanbanService.findOneLabel(id);
  }

  @Post('labels')
  create(@Body() body: { name: string; color?: string }) {
    return this.kanbanService.createLabel(body.name, body.color);
  }

  @Patch('labels/:id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; color?: string },
  ) {
    return this.kanbanService.updateLabel(id, body.name, body.color);
  }

  @Delete('labels/:id')
  delete(@Param('id') id: string) {
    return this.kanbanService.deleteLabel(id);
  }
}
