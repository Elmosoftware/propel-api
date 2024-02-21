//Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { ErrorHandler } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

//Angular Material Components:
import { MatLegacySlideToggleModule as MatSlideToggleModule } from "@angular/material/legacy-slide-toggle";
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

// 3rd party libraries:
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrModule } from 'ngx-toastr';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { NgxChartsModule } from '@swimlane/ngx-charts';

//Services & Others
import { CoreService } from '../services/core.service';
import { NavigationService } from '../services/navigation.service';
import { AppPages } from '../services/app-pages.service';
import { ErrorHandlerService } from "../services/error-handler.service";
import { ToasterService } from '../services/toaster.service';
import { DataService } from '../services/data.service';
import { DialogService } from "../services/dialog.service";
import { RunnerService } from '../services/runner.service';
import { LoaderInterceptor } from '../core/loader-interceptor';
import { AuthInterceptor } from '../core/auth-interceptor';
import { DataLossPreventionGuard } from '../core/data-loss-prevention-guard';
import { ParamInferenceService } from "../services/param-inference.service";
import { InfiniteScrollingModule } from '../core/infinite-scrolling-module';
import { APIStatusService } from "../services/api-status.service";

//Dialogs
import { WorkflowStepDialogComponent } from './dialogs/workflow-step-dlg/workflow-step-dlg.component';
import { CustomFieldDialogComponent } from './dialogs/custom-field-dlg/custom-field-dlg.component';
import { CustomValueDialogComponent } from './dialogs/custom-value-dlg/custom-value-dlg.component';

//Components
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { HomeComponent } from './home/home.component';
import { SandboxComponent } from './sandbox/sandbox.component';
import { RootComponent } from './root/root.component';
import { RunComponent } from './run/run.component';
import { TargetComponent } from './target/target.component';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { ScriptComponent } from './script/script.component';
import { FileDropperComponent } from './file-dropper/file-dropper.component';
import { ScriptParametersComponent } from './script-parameters/script-parameters.component';
import { QuickTaskComponent } from './quick-task/quick-task.component';
import { WorkflowStepComponent } from './workflow-step/workflow-step.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { ConsoleLineComponent } from './console-line/console-line.component';
import { StatusIconComponent } from './status-icon/status-icon.component';
import { ResultsComponent } from './results/results.component';
import { DynamicTableComponent } from './dynamic-table/dynamic-table.component';
import { SearchComponent } from './search/search.component';
import { SearchWorkflowLineComponent } from './search-workflow-line/search-workflow-line.component';
import { SearchScriptLineComponent } from './search-script-line/search-script-line.component';
import { SearchTargetLineComponent } from './search-target-line/search-target-line.component';
import { HistoryComponent } from './history/history.component';
import { OfflineComponent } from './offline/offline.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { CredentialComponent } from './credential/credential.component';
import { WindowsSecretComponent } from './credential/windows-secret/windows-secret.component';
import { AWSSecretComponent } from "./credential/aws-secret/aws-secret.component";
import { SearchCredentialLineComponent } from './search-credential-line/search-credential-line.component';
import { APIKeySecretComponent } from './credential/apikey-secret/apikey-secret.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { SearchUserAccountLineComponent } from './search-user-account-line/search-user-account-line.component';
import { SecurityService } from '../services/security.service';
import { SecurityGuard } from '../services/security-guard';
import { CoolSpinerComponent } from './cool-spiner/cool-spiner.component';
import { DatabaseSecretComponent } from './credential/database-secret/database-secret.component';
import { ObjectEditorComponent } from './object-editor/object-editor.component';

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
        CustomValueDialogComponent,
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
        CoolSpinerComponent,
        DatabaseSecretComponent,
        ObjectEditorComponent
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
        ParamInferenceService,
        APIStatusService,
        SecurityService,
        SecurityGuard
    ],
    bootstrap: [RootComponent]
})
export class AppModule { }
