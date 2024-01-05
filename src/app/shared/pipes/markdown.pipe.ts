import { Pipe, PipeTransform } from '@angular/core';
import MarkdownIt from 'markdown-it';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  transform(value: string, ...args: unknown[]): string {
    return this.markdown.render(value);
  }

}
