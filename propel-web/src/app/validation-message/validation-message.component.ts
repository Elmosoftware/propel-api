import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidatorsHelper } from 'src/core/validators-helper';

@Component({
  selector: 'app-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.css']
})
export class ValidationMessageComponent implements OnInit {

  @Input() control: AbstractControl;
  
  constructor() { }

  ngOnInit(): void {
  }

  get isInvalid(): boolean {
    return this.control && this.control.invalid && this.control.touched;
  }

  get errorMessage(): string {
    if (this.isInvalid) {
      return ValidatorsHelper.getErrorText(this.control);
    }
  }
}
