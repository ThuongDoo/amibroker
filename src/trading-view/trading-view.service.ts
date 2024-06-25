import { Injectable } from '@nestjs/common';

@Injectable()
export class TradingViewService {
  constructor() {}

  configurationData = {
    supports_search: true,
    supports_group_request: false,
    supports_marks: true,
    supports_timescale_marks: true,
    supports_time: true,
    exchanges: [
      { value: '', name: 'All Exchanges', desc: '' },
      { value: 'NasdaqNM', name: 'NasdaqNM', desc: 'NasdaqNM' },
      { value: 'NYSE', name: 'NYSE', desc: 'NYSE' },
    ],
    symbols_types: [
      { name: 'All types', value: '' },
      { name: 'Stock', value: 'stock' },
      { name: 'Index', value: 'index' },
    ],
    supported_resolutions: ['D', '2D', '3D', 'W', '3W', 'M', '6M'],
  };

  getConfig() {
    return this.configurationData;
  }

  async getSymbolInfo() {}

  async getSymbols(symbol: string) {}

  async getSearch(searchQuery) {}

  async getHistory(
    symbol: string,
    from: string,
    to: string,
    resolution: string,
  ) {}
}
