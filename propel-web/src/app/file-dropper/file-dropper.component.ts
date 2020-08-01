import { Component, OnInit, EventEmitter, HostListener, Output, Input } from '@angular/core';
import { trigger, state, animate, transition, style } from '@angular/animations';

const PROGRESS_MIN: number = 0
const PROGRESS_MAX: number = 100

@Component({
  selector: 'app-file-dropper',
  templateUrl: './file-dropper.component.html',
  styleUrls: ['./file-dropper.component.css'],
  animations: [
    trigger('ResetingForm', [
      state('start', style({ opacity: 1 })),
      state('finish', style({ opacity: 0 })),
      transition('start => finish', animate('2s'))
    ])
  ]
})
export class FileDropperComponent implements OnInit {

  selectedFiles: FileList;
  isHover: boolean = false;
  uploadInProgress: boolean = false;
  isReseting: boolean = false;
  private _progress: number = PROGRESS_MIN;

  @Input()
  set progress(value: number) {

    if (!isNaN(value)) {
      value = Math.round(value);

      if (value <= PROGRESS_MIN) {
        this._progress = PROGRESS_MIN;
      }
      else {
        this._progress = (value > PROGRESS_MAX) ? PROGRESS_MAX : value;
      }

      if (this.autoReset && this._progress == PROGRESS_MAX) {
        this.isReseting = true;
      }
    }
  }
  get progress(): number {
    return this._progress;
  }

  @Input() enabled: boolean = true;
  @Input() autoReset: boolean = true;
  @Output() filesDropped = new EventEmitter<FileList>();

  constructor() { }

  ngOnInit() {
    
  }

  @HostListener('drop', ['$event'])
  onDrop($event: any) {
    $event.preventDefault();

    if (this.enabled && $event.dataTransfer.files && $event.dataTransfer.files.length > 0) {
      this.uploadInProgress = true;
      this.filesDropped.emit($event.dataTransfer.files);
    }

    this.isHover = false;
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: any) {
    event.preventDefault();
    this.isHover = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: any) {
    this.isHover = false;
  }

  public forceReset() {
    this.uploadInProgress = false;
    this._progress = PROGRESS_MIN;
    this.isReseting = false;
  }

  autoResetDone($event) {
    if ($event.toState == "finish") {
      this.forceReset();
    }
  }
}
