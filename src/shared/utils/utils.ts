import { format, parse } from 'date-fns';

export class Utils {
  static formatData(csvData) {
    const convertToISO = (dateString) => {
      // Tạo một đối tượng Date từ chuỗi ngày tháng đầu vào
      try {
        // const parsedDate = parse(dateString, 'M/d/yyyy HH:mm:ss', new Date());
        // const isoString = formatISO(parsedDate);
        // console.log(isoString);
        const inputFormat = 'M/d/yyyy HH:mm:ss';
        const outputFormat = 'yyyy-MM-dd';
        const parsedDate = parse(dateString, inputFormat, new Date());

        // Chuyển đổi đối tượng Date thành chuỗi trong định dạng mong muốn
        const outputDateString = format(parsedDate, outputFormat);

        return outputDateString;
      } catch (error) {
        return dateString;
      }
    };
    const headers = csvData.split('\r\n')[0].split(',');

    // Tách các dòng còn lại thành mảng các đối tượng
    const dataArray = csvData.split('\r\n').slice(1);

    const result = dataArray
      .map((row) => {
        const values = row.split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        return obj;
      })
      .filter((row) => row.Ticker !== '' && row.Ticker !== undefined)
      .map((row) => {
        return {
          ...row,
          'Date/Time': convertToISO(row['Date/Time']),
          // date: row['Date/Time'],
        };
      });

    return result;
  }
}
