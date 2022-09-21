import { Component, OnInit } from '@angular/core';
import { RegProviderService } from 'src/app/Controller/reg-provider.service';
import { Register } from 'src/app/Model/Registers';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registers: Register[] = [];

  constructor(regProvider: RegProviderService) { 
    this.registers = regProvider.getRegisters();
  }

  ngOnInit(): void {
  }

}
