import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'prettytime',
  standalone: true
})
export class PrettyDatePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    const timeago = moment(value).format('LL')
    return timeago;
  }

}
