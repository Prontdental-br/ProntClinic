import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { Medicines } from './entities/medicines.entity';

const headers = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  authorization:
    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.WzYwMTkyOSwiOWM1OTM4ODE0OTEzYTEwYTE3ZTFjNWUyNjViMDU4NTUiLCIyMDI0LTEwLTA0IiwicGxhdGFmb3JtYSJd.YSKYWzdUG4woS9g3LquslTtHeEZq-a_nUzUrGk7i5Ns',
  'cache-control': 'no-cache',
  'if-modified-since': 'Mon, 26 Jul 1997 05:00:00 GMT',
  pragma: 'no-cache',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  cookie:
    'FGTServer=77E1DC77AE2F953D7ED796A08A630A01A53CF6FE5FD0E106412591871F9A9BBCFBDEA0AD564FD89D3BDE8278200B; FGTServer=77E1DC77AE2F953D7ED796A08A630A01A53CF6FE5FD0E106412591871F9A9BBCFBDEA0AD564FD89D3BDE8278200B; FGTServer=77E1DC77AE2F953D7ED796A08A630A01A53CF6FE5FD0E106412591871F9A9BBCFBDEA0AD564FD89D3BDE8278200B; _pk_id.42.210e=8eca716434ce3237.1690380888.; FGTServer=77E1DC77AE2F953D7ED796A08A630A01A53CF6FE5FD0E106412591871F9A9BBCFBDEA0AD564FD89D3BDE8278200B; _cfuvid=L.SzxLLxZoWYrYqhaiRgS5MTkV77mwE5uIyLNWvyufk-1690462598410-0-604800000; _pk_ref.42.210e=%5B%22%22%2C%22%22%2C1690462669%2C%22https%3A%2F%2Fwww.google.com%2F%22%5D; _pk_ses.42.210e=1; cf_clearance=tk5QcLSYPlUQfr8s2bTGXyvC2KZdHcEIYU8r6HCgNvQ-1690462689-0-160.0.0',
  Referer: 'https://consultas.anvisa.gov.br/',
  'Referrer-Policy': 'no-referrer-when-downgrade',
};
@Injectable()
export class MedicinesService {
  constructor(
    @InjectModel(Medicines)
    private MedicinesModel: typeof Medicines,
  ) {}

  isMoreThan30Days(inputDate: Date): boolean {
    if (isNaN(inputDate.getTime())) {
      return false;
    }

    const currentDate: Date = new Date();

    const diffInMilliseconds: number =
      currentDate.getTime() - inputDate.getTime();

    const diffInDays: number = diffInMilliseconds / (1000 * 60 * 60 * 24);
    return Math.abs(diffInDays) > 30;
  }

  async getPosologia(id: string) {
    try {
      const timestamp = Date.now();
      const { data } = await axios.get(
        `https://api.memed.com.br/v1/posologias?filter[medicamento]=${id}&origem=Prescri%C3%A7%C3%A3o&_=${timestamp}`,
        { headers },
      );
      if (data.data.length === 0) return '';
      return data.data[0].attributes.text;
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async findByName(name: string) {
    try {
      const searchValues = await this.MedicinesModel.findOne({
        where: {
          searchValue: name,
        },
      });
      if (
        searchValues
        // this.isMoreThan30Days(searchValues.updatedAt) === false
      ) {

        console.log('SEARCH_VALUES', searchValues);

        return searchValues.data;
      }
      const timestamp = Date.now();
      const res = await axios.get(
        `https://gateway.memed.com.br/v2/search/items?groupType=industry&q=${name}&origem=Prescri%C3%A7%C3%A3o&_=${timestamp}`,
        { headers },
      );
      const items = res.data.results.items;
      const dataArray = [];
      for (
        let index = 0;
        index < items.length && dataArray.length < 3;
        index += 1
      ) {
        const current = items[index];
        try {
          const posologia = await this.getPosologia(current.document.data.id);
          if (posologia !== '') {
            dataArray.push({
              name: current.document.data.description,
              usage: posologia,
            });
            continue;
          }
          if (
            current.document.data.extra &&
            current.document.data.extra.leaflet.link.split('v1')[1] !==
              undefined
          ) {
            const link =
              current.document.data.extra.leaflet.link.split('v1')[1];
            dataArray.push({
              name: current.document.data.description,
              usage: 'https://api.memed.com.br/v1' + link,
            });
          } else {
            const bula = await axios.get(
              `https://api.memed.com.br/v1/apresentacoes/${current.document.id}?_=${timestamp}`,
              { headers },
            );
            if (
              bula.data.data.attributes.extra.bula_profissional.link.includes(
                '/bulas/pdf',
              )
            ) {
              dataArray.push({
                name: current.document.data.description,
                usage: bula.data.data.attributes.extra.bula_profissional.link,
              });
            }
          }
          continue;
        } catch (error) {
          continue;
        }
      }
      const values: any = {
        searchValue: name,
        data: dataArray,
      };
      if (searchValues) {
        values.id = searchValues.id;
      }
      await this.MedicinesModel.upsert(values);
      return dataArray;
    } catch (error) {
      console.error(error);
      const data = await this.MedicinesModel.findOne({
        where: { searchValue: name },
      });
      const values = data.data ?? [];
      return values;
    }
  }
}
