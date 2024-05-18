import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyOhlc } from './daily-ohlc.model';
import { IntradayOhlc } from './intraday-ohlc.model';

@Injectable()
export class OhlcService {
  constructor(
    @InjectModel(DailyOhlc)
    private dailyOhlcModel: typeof DailyOhlc,

    @InjectModel(IntradayOhlc)
    private intradayOhlcModel: typeof IntradayOhlc,
  ) {}

  //TODO: fix this
  async importDaily(data): Promise<any> {}

  //TODO: fix this
  async importIntraday(data): Promise<any> {}
}
