import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AluService } from 'src/app/Controller/Emulator/alu.service';
import { ShifterService } from 'src/app/Controller/Emulator/shifter.service';
import { StackProviderService } from 'src/app/Controller/stack-provider.service';


@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.css'],
  animations: [
    trigger('flyInOut', [
      transition(':enter', [
        animate("0.5s",keyframes([
          style({ opacity: 0, border: 0, padding:0, margin:0, transform: "translateY(-20%)", height: "0px" , offset: 0}),
          style({ border: "1px solid #eb5e28", padding:"1%", margin:"1% 0 0 0", height:"auto", offset: 0.1}),
          style({ opacity: 0.25, transform: "translateY(0)", offset: 0.5}),
          style({ opacity: 1, transform: "translateY(0)", offset: 1})
        ]))
      ]),
      transition(':leave', [
        animate("0.25s", keyframes([
          style({ transform: 'translateX(0%)', opacity: 1, offset:0 }),
          style({ transform: 'translateX(100%)', opacity: 0, offset: 0.25 }),
          style({ height: "0px", padding: 0, border: 0, offset: 1})
        ]))
      ])
    ])
  ]

})
export class StackComponent implements OnInit {
  
  constructor(public stackProvider:StackProviderService) { }

  ngOnInit(): void {
  }

  push(): void{
    this.stackProvider.push(Math.floor(Math.random() * 10));
  }

  pop(): void{
    console.log(this.stackProvider.pop());
  }

}

