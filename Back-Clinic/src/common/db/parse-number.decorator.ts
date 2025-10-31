import { addAttributeOptions } from 'sequelize-typescript';

export function ParseNumber(target: any, propertyKey: string): any {
  addAttributeOptions(target, propertyKey, {
    get(): any {
      return +this.getDataValue(propertyKey);
    },
  });
}