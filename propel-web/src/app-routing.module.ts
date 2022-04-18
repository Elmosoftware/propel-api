import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SandboxComponent } from './app/sandbox/sandbox.component';
import { HomeComponent } from './app/home/home.component';
import { RunComponent } from './app/run/run.component';
import { TargetComponent } from './app/target/target.component';
import { DataLossPreventionGuard } from './core/data-loss-prevention-guard';
import { ScriptComponent } from './app/script/script.component';
import { QuickTaskComponent } from './app/quick-task/quick-task.component';
import { WorkflowComponent } from './app/workflow/workflow.component';
import { ResultsComponent } from './app/results/results.component';
import { SearchComponent } from './app/search/search.component';
import { HistoryComponent } from './app/history/history.component';
import { environment } from './environments/environment';
import { OfflineComponent } from './app/offline/offline.component';
import { CredentialComponent } from './app/credential/credential.component';
import { UserAccountComponent } from './app/user-account/user-account.component';
import { LoginComponent } from './app/login/login.component';
import { pages } from './services/app-pages.service';
import { SecurityGuard } from './services/security-guard';
import { UnauthorizedComponent } from './app/unauthorized/unauthorized.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: pages.Home.name,
    pathMatch: 'full'
  },
  {
    path: pages.Home.name,
    component: HomeComponent,
    data: {
      title: "Home"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Login.name,
    component: LoginComponent,
    data: {
      title: "User login"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Run.name}/:id`,
    component: RunComponent,
    data: {
      title: "Run"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Target.name,
    component: TargetComponent,
    data: {
      title: "New Target"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Target.name}/:id`,
    component: TargetComponent,
    data: {
      title: "Editing Target"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Script.name,
    component: ScriptComponent,
    data: {
      title: "New Script"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Script.name}/:id`,
    component: ScriptComponent,
    data: {
      title: "Editing Script"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.QuickTask.name,
    component: QuickTaskComponent,
    data: {
      title: "New Quick task"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Workflow.name,
    component: WorkflowComponent,
    data: {
      title: "New Workflow"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Workflow.name}/:id`,
    component: WorkflowComponent,
    data: {
      title: "Editing Workflow"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Results.name}/:id`,
    component: ResultsComponent,
    data: {
      title: "Displaying execution results"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseWorkflows.name,
    component: SearchComponent,
    data: {
      title: "Browsing Workflows"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseScripts.name,
    component: SearchComponent,
    data: {
      title: "Browsing Scripts"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseTargets.name,
    component: SearchComponent,
    data: {
      title: "Browsing Targets"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseCredentials.name,
    component: SearchComponent,
    data: {
      title: "Browsing Credentials"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseUserAccounts.name,
    component: SearchComponent,
    data: {
      title: "Browsing User Accounts"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.History.name,
    component: HistoryComponent,
    data: {
      title: "Seeing Execution History"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Offline.name,
    component: OfflineComponent,
    data: {
      title: "There are connectivity issues"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Unauthorized.name,
    component: UnauthorizedComponent,
    data: {
      title: "Access is forbidden"
    },
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Credential.name}/:id`,
    component: CredentialComponent,
    data: {
      title: "Editing Credential"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.CredentialWindows.name,
    component: CredentialComponent,
    data: {
      title: "New Windows Credential"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.CredentialAWS.name,
    component: CredentialComponent,
    data: {
      title: "New AWS Credential"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.CredentialAPIKey.name,
    component: CredentialComponent,
    data: {
      title: "New Generic API Key Credential"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.UserAccount.name,
    component: UserAccountComponent,
    data: {
      title: "New User account"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.UserAccount.name}/:id`,
    component: UserAccountComponent,
    data: {
      title: "Editing User account"
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Sandbox.name,
    component: ((environment.production)? HomeComponent : SandboxComponent),
    data: {
      title: "SANDBOX... feel free to create!"
    }
  },
  {
    path: '**',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
