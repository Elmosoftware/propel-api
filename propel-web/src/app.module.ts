//Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { ErrorHandler } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

//Angular Material Components:
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// 3rd party libraries:
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrModule } from 'ngx-toastr';

//Services
import { CoreService } from './services/core.service';
import { NavigationService } from './services/navigation.service';
import { ErrorHandlerService } from "./services/error-handler.service";
import { ToasterService } from './services/toaster.service';
import { DataService } from './services/data.service';
import { DialogService } from "./services/dialog.service";
import { RunnerService } from './services/runner.service';

//Components
import { HomeComponent } from './app/home/home.component';
import { SandboxComponent } from './app/sandbox/sandbox.component';
import { RootComponent } from './app/root/root.component';
import { RunComponent } from './app/run/run.component';
import { NavigationBarComponent } from './app/navigation-bar/navigation-bar.component';

//Dialogs
import { StandardDialogComponent } from "./app/dialogs/standard-dialog/standard-dlg.component";
import { ConsoleLineComponent } from './app/console-line/console-line.component';
import { StatusIconComponent } from './app/status-icon/status-icon.component';

@NgModule({
  declarations: [
    RootComponent,
    HomeComponent,
    SandboxComponent,
    RunComponent,
    NavigationBarComponent,
    ConsoleLineComponent,
    StatusIconComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    ToastrModule.forRoot({
      maxOpened: 5,
      closeButton: true,
      positionClass: "toast-top-right",
      disableTimeOut: false,
      timeOut: 5000
    }),
    HttpClientModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    ErrorHandlerService,
    { provide: ErrorHandler, useExisting: ErrorHandlerService },    
    NavigationService,
    ToasterService,
    DataService,
    RunnerService,
    DialogService,
    CoreService
  ],
  entryComponents: [
    StandardDialogComponent
  ],
  bootstrap: [RootComponent]
})
export class AppModule { }
