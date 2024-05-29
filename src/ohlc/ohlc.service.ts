import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyOhlc } from './dailyOhlc.model';
import { IntradayOhlc } from './intradayOhlc.model';

@Injectable()
export class OhlcService {
  constructor(
    @InjectModel(DailyOhlc)
    private dailyOhlcModel: typeof DailyOhlc,
    @InjectModel(IntradayOhlc)
    private intradayOhlcModel: typeof IntradayOhlc,
  ) {}

  dailyOhlcImported = [];
  intradayOhlcImported = [];

  async importDaily(data: any): Promise<any> {
    if (data[data.length - 1]?.header === 'done') {
      const pushData = data.slice(0, data.length - 1);
      this.dailyOhlcImported.push(...pushData);
      const newData = this.dailyOhlcImported;
      this.dailyOhlcImported = [];
      try {
        await this.dailyOhlcModel.truncate();
        const chunkSize = 2000; // Số lượng mục mỗi chunk
        const totalData = newData.length;
        let startIndex = 0;
        let results = [];

        while (startIndex < totalData) {
          const chunkData = newData.slice(startIndex, startIndex + chunkSize);
          const chunkResults = await this.dailyOhlcModel.bulkCreate(chunkData, {
            ignoreDuplicates: true,
          });
          results = results.concat(chunkResults);
          startIndex += chunkSize;
        }

        console.log('imported file length: ', results.length);
        return results;
      } catch (error) {
        throw error;
      }
    } else {
      this.dailyOhlcImported.push(...data);
    }
  }

  async importIntraday(data: any): Promise<any> {
    if (data[data.length - 1]?.header === 'done') {
      const pushData = data.slice(0, data.length - 1);
      this.intradayOhlcImported.push(...pushData);
      const newData = this.intradayOhlcImported;
      this.intradayOhlcImported = [];
      try {
        await this.intradayOhlcModel.truncate();
        const chunkSize = 2000; // Số lượng mục mỗi chunk
        const totalData = newData.length;
        let startIndex = 0;
        let results = [];

        while (startIndex < totalData) {
          const chunkData = newData.slice(startIndex, startIndex + chunkSize);
          const chunkResults = await this.intradayOhlcModel.bulkCreate(
            chunkData,
            {
              ignoreDuplicates: true,
            },
          );
          results = results.concat(chunkResults);
          startIndex += chunkSize;
        }

        console.log('imported file length: ', results.length);
        return results;
      } catch (error) {
        throw error;
      }
    } else {
      this.intradayOhlcImported.push(...data);
    }
  }

  async getDaily(ticker: string) {
    console.log(ticker);

    const ohlcs = await this.dailyOhlcModel.findAll({
      where: { ticker: ticker },
      order: [['time', 'ASC']],
    });
    return ohlcs;
  }

  async getIntraday(ticker: string) {
    console.log(ticker);

    const ohlcs = await this.intradayOhlcModel.findAll({
      where: { ticker: ticker },
      order: [['time', 'ASC']],
    });
    return ohlcs;
  }

  async removeSecondsBulk(instances: IntradayOhlc[]) {
    for (const instance of instances) {
      instance.time = this.adjustTime(instance.time);
    }
  }

  adjustTime(time: Date): Date {
    const newTime = new Date(time);
    newTime.setSeconds(0, 0); // Đặt giây và mili giây thành 0
    return newTime;
  }
}
