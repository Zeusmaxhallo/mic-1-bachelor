import { Component, OnInit } from '@angular/core';
import { RegProviderService } from 'src/app/Controller/reg-provider.service';
import { Register } from 'src/app/Model/Registers';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  register: Register = null;

  constructor(regProvider: RegProviderService) { 
    this.register = regProvider.getRegister("PC");
  }

  ngOnInit(): void {
  }

}
