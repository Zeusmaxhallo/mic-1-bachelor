import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.css']
})
export class ScreenComponent implements AfterViewInit {
  @ViewChild('canvas') private canvas: ElementRef = {} as ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D

  private readonly WIDTH = 320;
  private readonly HEIGHT = 200;

  constructor() { }

  ngAfterViewInit(): void {
    // blank canvas
    this.ctx = this.canvas.nativeElement.getContext("2d");
    this.ctx.fillStyle = "rgb(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height); 
  }

  public setPixel(x: number, y: number, color: string) {
    this.ctx.fillStyle = color;

    // calc how big a pixel is
    let PixelWidth = this.canvas.nativeElement.width / this.WIDTH;
    let PixelHeight = this.canvas.nativeElement.height / this.HEIGHT;

    x = PixelWidth * x;
    y = PixelHeight * y;

    this.ctx.fillRect(x, y, PixelWidth, PixelHeight);
  }



}
