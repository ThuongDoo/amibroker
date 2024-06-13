import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://fc-data.ssi.com.vn/api/v2/Market/',

  // withCredentials: true,
});

export const endpoints = {
  GET_ACCESS_TOKEN: 'AccessToken',
  SECURITIES_DETAIL: 'SecuritiesDetails',
  INDEX_COMPONENT: 'IndexComponents',
  DAILY_OHLC: 'DailyOhlc',
  INTRADAY_OHLC: 'IntradayOhlc',
};

export default instance;
