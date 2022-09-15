import { Injectable } from '@angular/core';
import { Stack } from '../Model/Stack';

@Injectable({
  providedIn: 'root'
})
export class StackProviderService extends Stack<number> {}
