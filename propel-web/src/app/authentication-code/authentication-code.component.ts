import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-authentication-code',
  templateUrl: './authentication-code.component.html',
  styleUrls: ['./authentication-code.component.css']
})
export class AuthenticationCodeComponent implements OnInit {

  @Input() code: string;

  codeCopied: boolean = false;

  constructor(private clipboard: Clipboard) {

   }

  ngOnInit(): void {
  }

  copyToClipboard(): void {
    this.clipboard.copy(this.code);
    this.codeCopied = true
  }

  copyToClipboardTooltipMessage(): string {
    if (this.codeCopied) return "The authentication code was copied to the clipboard."
    else return "Copy to clipboard." 
  }


}
