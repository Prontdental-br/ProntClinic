import { Injectable, Res } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Report } from 'src/reports/entities/report.entity';

const transactionTypeMap = {
  revenue: 'Receita',
  expense: 'Despesa',
  overdue: 'Vencidas',
  paid: 'Pago',
  open: 'Aberto',
  all: 'Todos',
  'expense-paid': 'Despesa Paga',
  'expense-open': 'Despesa em Aberto',
  'revenue-month': 'Receita Mensal',
  'revenue-daily': 'Receita Diária',
  'paid-month': 'Pago Mensal',
};

const periodMap = {
  month: 'Mês',
  week: 'Semana',
  year: 'Ano',
  daily: 'Diário',
};

const typeTransaction = {
  E: 'Despesa',
  R: 'Receita',
};

@Injectable()
export class ExcelService {
  constructor() {
    //
  }

  async generate(transactions: Transaction[], res: Response, report: Report) {
    console.log('res', res);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DataSheet');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Descrição', key: 'description', width: 30 },
      { header: 'Data de Pagamento', key: 'payment_date', width: 30 },
      { header: 'Data de Vencimento', key: 'due_date', width: 30 },
      // { header: 'Período de referência', key: 'period', width: 30 },
      { header: 'Total', key: 'total', width: 30 },
      { header: 'Tipo', key: 'transaction_type', width: 30 },
      { header: 'Pago', key: 'paid', width: 30 },
    ];

    // Adicionando dados
    //console.log('transactions', transactions);
    //console.log('report', report);
    transactions.forEach((transaction) => {
      const isExpense = transaction.type === 'E';
      const value = Number(transaction.value);

      worksheet.addRow({
        description: transaction.description,
        payment_date: transaction.paymentDate
          ? new Date(transaction.paymentDate).toLocaleDateString('pt-BR')
          : '',
        due_date: transaction.dueDate
          ? new Date(transaction.dueDate).toLocaleDateString('pt-BR')
          : '',
        total: isExpense ? -value : value,
        transaction_type: typeTransaction[transaction.type] || '',
        paid: transaction.isPaid ? 'Sim' : 'Não',
        period: periodMap[report.period] || '',
      });
    });

    // Envia o arquivo Excel para o cliente
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');

    //await workbook.xlsx.write(res);
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  }

  async writeToCsv(data: any[], res: Response, filename: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DataSheet');
    worksheet.columns = [
      { header: 'Total de Entradas', key: 'totalEntries', width: 30 },
      { header: 'Total de Saídas', key: 'totalExpenses', width: 30 },
      { header: 'Saldo Parcial', key: 'parcialBalance', width: 30 },
      { header: 'Saldo Previsto', key: 'expectedBalance', width: 30 },
      { header: 'Pix', key: 'pix', width: 30 },
      { header: 'Cartão de Crédito', key: 'creditCard', width: 30 },
      { header: 'Cartão de Débito', key: 'debitCard', width: 30 },
      { header: 'Boleto', key: 'boleto', width: 30 },
      { header: 'Dinheiro', key: 'money', width: 30 },
      {
        header: 'Total de Confirmados',
        key: 'appointmentConfirmed',
        width: 30,
      },
      { header: 'Total de Desmarcados', key: 'appointmentCanceled', width: 30 },
      { header: 'Total de Atendidos', key: 'appointmentScheduled', width: 30 },
      { header: 'Total de Faltas', key: 'appointmentMissed', width: 30 },
      { header: 'Total de Orçamentos Aprovados', key: 'approved', width: 30 },
      {
        header: 'Valor Total dos Orçamentos Aprovados',
        key: 'approvedValue',
        width: 30,
      },
      {
        header: 'Ticket Médio dos Orçamentos Aprovados',
        key: 'approvedMediumValue',
        width: 30,
      },
      { header: 'Total de Orçamentos Rejeitados', key: 'rejected', width: 30 },
      {
        header: 'Valor Total dos Orçamentos Rejeitados',
        key: 'rejectedValue',
        width: 30,
      },
      {
        header: 'Ticket Médio dos Orçamentos Rejeitados',
        key: 'rejectedMediumValue',
        width: 30,
      },
      { header: 'Total de Orçamentos Em Aberto', key: 'open', width: 30 },
      {
        header: 'Valor Total dos Orçamentos Em Aberto',
        key: 'openValue',
        width: 30,
      },
      {
        header: 'Ticket Médio dos Orçamentos Em Aberto',
        key: 'openMediumValue',
        width: 30,
      },
    ];

    for (let index = 0; index < data.length; index += 1) {
      const current = data[index];
      worksheet.addRow({ ...current });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${filename}.xlsx`,
    );

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  }
}
