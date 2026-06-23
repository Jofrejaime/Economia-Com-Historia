// src/app/pipes/markdown.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Converter **texto** para <strong>texto</strong>
    let html = value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Converter *texto* para <em>texto</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Converter __texto__ para <u>texto</u>
    html = html.replace(/__(.*?)__/g, '<u>$1</u>');
    
    // Converter quebras de linha para <br>
    html = html.replace(/\n/g, '<br>');
    
    // Converter listas: linhas começando com "1." ou "-"
    html = html.replace(/^(\d+)\.\s/gm, '<span class="list-item">$1. </span>');
    html = html.replace(/^-\s/gm, '<span class="list-item">• </span>');
    
    return html;
  }
}