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
import { NgxChartsModule } from '@swimlane/ngx-charts';

//Services & Others
import { CoreService } from './services/core.service';
import { NavigationService } from './services/navigation.service';
import { AppPages } from './services/app-pages.service';
import { ErrorHandlerService } from "./services/error-handler.service";
import { ToasterService } from './services/toaster.service';
import { DataService } from './services/data.service';
import { DialogService } from "./services/dialog.service";
import { RunnerService } from './services/runner.service';
import { LoaderInterceptor } from './core/loader-interceptor';
import { AuthInterceptor } from './core/auth-interceptor';
import { DataLossPreventionGuard } from './core/data-loss-prevention-guard';
import { PSParametersInferrerService } from "./services/ps-parameters-inferrer.service";
import { InfiniteScrollingModule } from './core/infinite-scrolling-module';
import { APIStatusService } from "./services/api-status.service";

//Dialogs
import { WorkflowStepDialogComponent } from './app/dialogs/workflow-step-dlg/workflow-step-dlg.component';
import { CustomFieldDialogComponent } from './app/dialogs/custom-field-dlg/custom-field-dlg.component';

//Components
import { NavigationBarComponent } from './app/navigation-bar/navigation-bar.component';
import { HomeComponent } from './app/home/home.component';
import { SandboxComponent } from './app/sandbox/sandbox.component';
import { RootComponent } from './app/root/root.component';
import { RunComponent } from './app/run/run.component';
import { TargetComponent } from './app/target/target.component';
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
import { UnauthorizedComponent } from './app/unauthorized/unauthorized.component';
import { CredentialComponent } from './app/credential/credential.component';
import { WindowsSecretComponent } from './app/credential/windows-secret/windows-secret.component';
import { AWSSecretComponent } from "./app/credential/aws-secret/aws-secret.component";
import { SearchCredentialLineComponent } from './app/search-credential-line/search-credential-line.component';
import { APIKeySecretComponent } from './app/credential/apikey-secret/apikey-secret.component';
import { UserAccountComponent } from './app/user-account/user-account.component';
import { SearchUserAccountLineComponent } from './app/search-user-account-line/search-user-account-line.component';
import { SecurityService } from './services/security.service';
import { AuthenticationCodeComponent } from './app/authentication-code/authentication-code.component';
import { LoginComponent } from './app/login/login.component';
import { SecurityGuard } from './services/security-guard';

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
        UnauthorizedComponent,
        CredentialComponent,
        WindowsSecretComponent,
        AWSSecretComponent,
        SearchCredentialLineComponent,
        APIKeySecretComponent,
        UserAccountComponent,
        SearchUserAccountLineComponent,
        AuthenticationCodeComponent,
        LoginComponent
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
        NgxPageScrollModule,
        NgxChartsModule
    ],
    providers: [
        ErrorHandlerService,
        { provide: ErrorHandler, useExisting: ErrorHandlerService },
        NavigationService,
        AppPages,
        ToasterService,
        DataService,
        RunnerService,
        DialogService,
        CoreService,
        AuthInterceptor,
        { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        DataLossPreventionGuard,
        PSParametersInferrerService,
        APIStatusService,
        SecurityService,
        SecurityGuard
    ],
    bootstrap: [RootComponent]
})
export class AppModule { }
