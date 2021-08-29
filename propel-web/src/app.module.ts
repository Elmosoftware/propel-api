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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

// 3rd party libraries:
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrModule } from 'ngx-toastr';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxPageScrollModule } from 'ngx-page-scroll';

//Services & Others
import { CoreService } from './services/core.service';
import { NavigationService } from './services/navigation.service';
import { ErrorHandlerService } from "./services/error-handler.service";
import { ToasterService } from './services/toaster.service';
import { DataService } from './services/data.service';
import { DialogService } from "./services/dialog.service";
import { RunnerService } from './services/runner.service';
import { LoaderInterceptor } from './core/loader-interceptor';
import { DataLossPreventionGuard } from './core/data-loss-prevention-guard';
import { PSParametersInferrerService } from "./services/ps-parameters-inferrer.service";
import { InfiniteScrollingModule } from './core/infinite-scrolling-module';
import { APIStatusService } from "./services/api-status.service";

//Dialogs
import { StandardDialogComponent } from "./app/dialogs/standard-dialog/standard-dlg.component";
import { WorkflowStepDialogComponent } from './app/dialogs/workflow-step-dlg/workflow-step-dlg.component';
import { CustomFieldDialogComponent } from './app/dialogs/custom-field-dlg/custom-field-dlg.component';

//Components
import { NavigationBarComponent } from './app/navigation-bar/navigation-bar.component';
import { HomeComponent } from './app/home/home.component';
import { SandboxComponent } from './app/sandbox/sandbox.component';
import { RootComponent } from './app/root/root.component';
import { RunComponent } from './app/run/run.component';
import { TargetComponent } from './app/target/target.component';
import { EntityDialogComponent } from './app/dialogs/entity-group-dlg/entity-dlg.component';
import { ValidationMessageComponent } from './app/validation-message/validation-message.component';
import { ScriptComponent } from './app/script/script.component';
import { FileDropperComponent } from './app/file-dropper/file-dropper.component';
import { ScriptParametersComponent } from './app/script-parameters/script-parameters.component';
import { QuickTaskComponent } from './app/quick-task/quick-task.component';
import { WorkflowStepComponent } from './app/workflow-step/workflow-step.component';
import { WorkflowComponent } from './app/workflow/workflow.component';
import { ConsoleLineComponent } from './app/console-line/console-line.component';
import { StatusIconComponent } from './app/status-icon/status-icon.component';
import { ResultsComponent } from './app/results/results.component';
import { DynamicTableComponent } from './app/dynamic-table/dynamic-table.component';
import { SearchComponent } from './app/search/search.component';
import { SearchWorkflowLineComponent } from './app/search-workflow-line/search-workflow-line.component';
import { SearchScriptLineComponent } from './app/search-script-line/search-script-line.component';
import { SearchTargetLineComponent } from './app/search-target-line/search-target-line.component';
import { HistoryComponent } from './app/history/history.component';
import { OfflineComponent } from './app/offline/offline.component';
import { CredentialComponent } from './app/credential/credential.component';
import { WindowsVaultItemComponent } from './app/credential/windows-vault-item/windows-vault-item.component';
import { AWSVaultItemComponent } from "./app/credential/aws-vault-item/aws-vault-item.component";
import { SearchCredentialLineComponent } from './app/search-credential-line/search-credential-line.component';

@NgModule({
  declarations: [
    RootComponent,
    HomeComponent,
    SandboxComponent,
    RunComponent,
    NavigationBarComponent,
    ConsoleLineComponent,
    StatusIconComponent,
    TargetComponent,
    EntityDialogComponent,
    ValidationMessageComponent,
    ScriptComponent,
    FileDropperComponent,
    ScriptParametersComponent,
    QuickTaskComponent,
    WorkflowStepComponent,
    WorkflowComponent,
    WorkflowStepDialogComponent,
    CustomFieldDialogComponent,
    ResultsComponent,
    DynamicTableComponent,
    SearchComponent,
    SearchWorkflowLineComponent,
    SearchScriptLineComponent,
    SearchTargetLineComponent,
    HistoryComponent,
    OfflineComponent,
    CredentialComponent,
    WindowsVaultItemComponent,
    AWSVaultItemComponent,
    SearchCredentialLineComponent
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
      timeOut: 2000
    }),
    HttpClientModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    DragDropModule,
    MatExpansionModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    InfiniteScrollingModule,
    NgxPageScrollCoreModule,
    NgxPageScrollModule
  ],
  providers: [
    ErrorHandlerService,
    { provide: ErrorHandler, useExisting: ErrorHandlerService },    
    NavigationService,
    ToasterService,
    DataService,
    RunnerService,
    DialogService,
    CoreService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    DataLossPreventionGuard,
    PSParametersInferrerService,
    APIStatusService
  ],
  entryComponents: [
    StandardDialogComponent,
    WorkflowStepDialogComponent,
    CustomFieldDialogComponent
  ],
  bootstrap: [RootComponent]
})
export class AppModule { }
