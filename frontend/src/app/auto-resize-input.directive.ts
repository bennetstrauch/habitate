import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  AfterViewInit
} from '@angular/core';

@Directive({
  selector: '[appAutoResizeInput]'
})
export class AutoResizeInputDirective implements AfterViewInit {
  private input!: HTMLInputElement;
  private formField!: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.input = this.el.nativeElement as HTMLInputElement;
    this.formField = this.input.closest('mat-form-field') as HTMLElement;

    this.resize(); // Initial resize based on placeholder or value
  }

  @HostListener('input')
  onInput() {
    this.resize();
  }

  private resize() {
    const length = this.input.value.length || this.input.placeholder.length || 1;
    const width = `${length + 1}ch`;

    this.renderer.setStyle(this.input, 'width', width);
    if (this.formField) {
      this.renderer.setStyle(this.formField, 'width', width);
    }
  }
}
