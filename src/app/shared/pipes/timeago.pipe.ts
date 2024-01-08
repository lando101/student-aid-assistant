import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'timeago',
  standalone: true
})
export class TimeagoPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    const timeago = moment(value).fromNow()
    return timeago;
  }

}
