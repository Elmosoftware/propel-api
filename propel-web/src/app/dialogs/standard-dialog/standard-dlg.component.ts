import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogResult } from 'src/core/dialog-result';

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

  closeDlg(id: number): void {
    this.dialogRef.close(new DialogResult<any>(id, null));
  }

  onNoClick(): void {
    this.dialogRef.close(new DialogResult<any>(0, null));
  }
}

export class StandardDialogConfiguration {

  constructor(title: string, content: string, firstButtonText?: string, secondButtonText?: string) {
    this.title = (title) ? title : "Confirmation required";
    this.content = (content) ? content : "Are you sure to continue?";
    this.firstButtonText = (firstButtonText) ? firstButtonText : "Ok";
    this.secondButtonText = (secondButtonText) ? secondButtonText : "Cancel";
  }

  title: string;
  content: string;
  firstButtonText: string;
  secondButtonText: string;
}

