import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalService {
  private myData: any;

  getMyData() {
    return this.myData;
  }

  setMyData(value: any) {
    this.myData = value;
  }
}
