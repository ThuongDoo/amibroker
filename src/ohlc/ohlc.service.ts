import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyOhlc } from './dailyOhlc.model';
import { IntradayOhlc } from './intradayOhlc.model';
import { startOfDay } from 'date-fns';

@Injectable()
export class OhlcService {
  constructor(
    @InjectModel(DailyOhlc)
    private dailyOhlcModel: typeof DailyOhlc,
    @InjectModel(IntradayOhlc)
    private intradayOhlcModel: typeof IntradayOhlc,
  ) {}

  async importDaily(data: any): Promise<void> {
    const randomOhlcs = await this.getRandomDailyOhlc(1000, 'SSI', 'hose');
    try {
      await this.dailyOhlcModel.truncate();
      const ohlcs = await this.dailyOhlcModel.bulkCreate(randomOhlcs, {
        ignoreDuplicates: true,
      });
      console.log(ohlcs);
    } catch (error) {
      console.log(error);
    }
  }

  async importIntraday(data: any): Promise<void> {
    const randomOhlcs = await this.getRandomDailyOhlc(10000, 'SSI', 'HOSE');
    await this.removeSecondsBulk(randomOhlcs);
    console.log(randomOhlcs);

    try {
      await this.intradayOhlcModel.truncate();
      const ohlcs = await this.intradayOhlcModel.bulkCreate(randomOhlcs, {
        ignoreDuplicates: true,
      });
      console.log(ohlcs.length);
    } catch (error) {
      console.log(error);
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

  //TODO: delete
  getRandomDateInRange() {
    const startDate = new Date(2024, 5, 20); // Ngày bắt đầu
    const endDate = new Date();
    const startTime = startOfDay(startDate).getTime();
    const endTime = startOfDay(endDate).getTime();

    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime);
  }

  async getRandomDailyOhlc(quantity: number, ticker: string, market: string) {
    const ohlcs = [];
    for (let i = 0; i < quantity; i++) {
      const ohlc = {
        ticker,
        time: this.getRandomDateInRange(),
        market,
        open: this.getRandomFloat(),
        high: this.getRandomFloat(),
        low: this.getRandomFloat(),
        close: this.getRandomFloat(),
        value: this.getRandomFloat(),
        volume: this.getRandomFloat(),
      };
      ohlcs.push(ohlc);
    }
    return ohlcs;
  }

  getRandomFloat() {
    const min = 10,
      max = 100;

    return Number((Math.random() * (max - min) + min).toFixed(2));
  }
}
