import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-standard-dialog',
  templateUrl: './standard-dlg.component.html',
  styleUrls: ['./standard-dlg.component.css']
})
export class StandardDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<StandardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

  closeDlg(id): void {
    this.dialogRef.close(id);
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}

export class StandardDialogConfiguration {

    constructor(title:string, content:string, firstButtonText?:string, secondButtonText?:string) { 
      this.title = (title) ? title : "Confiration required";
      this.content = (content) ? content : "Are you sure to continue?";
      this.firstButtonText = (firstButtonText) ? firstButtonText : "Ok";
      this.secondButtonText = (secondButtonText) ? secondButtonText : "Cancel";
    }
  
    title: string;
    content: string;
    firstButtonText: string;
    secondButtonText: string;
  }
  
