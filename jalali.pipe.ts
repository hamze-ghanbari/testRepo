import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'jalali-moment';

@Pipe({ name: 'jalali' })
export class JalaliPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value || value === '0001-01-01T00:00:00') { return ''; }
    const MomentDate = moment(value);
    if (MomentDate.isBefore('0622-03-22')) {
      return '';
    }
    return MomentDate.format('jYYYY/jM/jD');
  }
}
@Pipe({ name: 'jalaliTime' })
export class JalaliTimePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value || value === '0001-01-01T00:00:00') { return ''; }
    const MomentDate = moment(value);
    if (MomentDate.isBefore('0622-03-22')) {
      return '';
    }
    var result = MomentDate.format('HH:mm:ss');
    if (result === '00:00:00') { result = ''; }
    return result;
  }
}

// @Pipe({ name: 'jalaliDate' })
// export class jalaliDate implements PipeTransform {
//   transform(value: any, args?: any): any {
//     if (!value || value === '0001-01-01T00:00:00') { return ''; }
//     const MomentDate = moment(value);
//     if (MomentDate.isBefore('0622-03-22')) {
//       return '';
//     }

//     const month = value.split('/')[1];
//     console.log(month);




  // }
// }