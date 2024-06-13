import { IsNumber, IsString } from 'class-validator';

export class TradeDataDto {
  @IsNumber()
  AvgPrice: number;

  @IsNumber()
  Ceiling: number;

  @IsNumber()
  Change: number;

  @IsNumber()
  EstMatchedPrice: number;

  @IsNumber()
  Floor: number;

  @IsNumber()
  Highest: number;

  @IsNumber()
  LastPrice: number;

  @IsNumber()
  LastVol: number;

  @IsNumber()
  Lowest: number;

  @IsNumber()
  PriorVal: number;

  @IsNumber()
  RatioChange: number;

  @IsNumber()
  RefPrice: number;

  @IsNumber()
  TotalVal: number;

  @IsNumber()
  TotalVol: number;

  @IsString()
  Exchange: string;

  @IsString()
  Isin: string;

  @IsString()
  MarketId: string;

  @IsString()
  RType: string;

  @IsString()
  Side: string;

  @IsString()
  Symbol: string;

  @IsString()
  TradingDate: string;

  @IsString()
  TradingSession: string;

  @IsString()
  TradingStatus: string;
}
