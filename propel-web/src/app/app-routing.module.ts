import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SandboxComponent } from './sandbox/sandbox.component';
import { HomeComponent } from './home/home.component';
import { RunComponent } from './run/run.component';
import { TargetComponent } from './target/target.component';
import { DataLossPreventionGuard } from '../core/data-loss-prevention-guard';
import { ScriptComponent } from './script/script.component';
import { QuickTaskComponent } from './quick-task/quick-task.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { ResultsComponent } from './results/results.component';
import { SearchComponent } from './search/search.component';
import { HistoryComponent } from './history/history.component';
import { environment } from '../environments/environment';
import { OfflineComponent } from './offline/offline.component';
import { CredentialComponent } from './credential/credential.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { pages } from '../services/app-pages.service';
import { SecurityGuard } from '../services/security-guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { SystemJobsComponent } from './system-jobs/system-jobs.component';
import { ObjectPoolEventStatsComponent } from './object-pool-event-stats/object-pool-event-stats.component';

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
      title: pages.Home.title
    },
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Run.name}/:id`,
    component: RunComponent,
    data: {
      title: pages.Run.title
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Target.name,
    component: TargetComponent,
    data: {
      title: `New ${pages.Target.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Target.name}/:id`,
    component: TargetComponent,
    data: {
      title: `Editing ${pages.Target.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Script.name,
    component: ScriptComponent,
    data: {
      title: `New ${pages.Script.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Script.name}/:id`,
    component: ScriptComponent,
    data: {
      title: `Editing ${pages.Script.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.QuickTask.name,
    component: QuickTaskComponent,
    data: {
      title: pages.QuickTask.title
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.Workflow.name,
    component: WorkflowComponent,
    data: {
      title: `New ${pages.Workflow.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Workflow.name}/:id`,
    component: WorkflowComponent,
    data: {
      title: `Editing ${pages.Workflow.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.Results.name}/:id`,
    component: ResultsComponent,
    data: {
      title: `Displaying ${pages.Results.title}`
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseWorkflows.name,
    component: SearchComponent,
    data: {
      title: pages.BrowseWorkflows.title
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseScripts.name,
    component: SearchComponent,
    data: {
      title: pages.BrowseScripts.title
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseTargets.name,
    component: SearchComponent,
    data: {
      title: pages.BrowseTargets.title
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseCredentials.name,
    component: SearchComponent,
    data: {
      title: pages.BrowseCredentials.title
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.BrowseUserAccounts.name,
    component: SearchComponent,
    data: {
      title: pages.BrowseUserAccounts.title
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.History.name,
    component: HistoryComponent,
    data: {
      title: `Seeing ${pages.History.title}`
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
    path: pages.CredentialWindows.name,
    component: CredentialComponent,
    data: {
      title: `New ${pages.CredentialWindows.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.CredentialWindows.name}/:id`,
    component: CredentialComponent,
    data: {
      title: `Editing ${pages.CredentialWindows.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.CredentialAWS.name,
    component: CredentialComponent,
    data: {
      title: `New ${pages.CredentialAWS.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.CredentialAWS.name}/:id`,
    component: CredentialComponent,
    data: {
      title: `Editing ${pages.CredentialAWS.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.CredentialAPIKey.name,
    component: CredentialComponent,
    data: {
      title: `New ${pages.CredentialAPIKey.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.CredentialAPIKey.name}/:id`,
    component: CredentialComponent,
    data: {
      title: `Editing ${pages.CredentialAPIKey.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.CredentialDatabase.name,
    component: CredentialComponent,
    data: {
      title: `New ${pages.CredentialDatabase.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.CredentialDatabase.name}/:id`,
    component: CredentialComponent,
    data: {
      title: `Editing ${pages.CredentialDatabase.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.UserAccount.name,
    component: UserAccountComponent,
    data: {
      title: `New ${pages.UserAccount.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: `${pages.UserAccount.name}/:id`,
    component: UserAccountComponent,
    data: {
      title: `Editing ${pages.UserAccount.title}`
    },
    canDeactivate: [DataLossPreventionGuard],
    canActivate: [SecurityGuard]
  },
  {
    path: pages.SystemJobs.name,
    component: SystemJobsComponent,
    data: {
      title: pages.SystemJobs.title
    },
    canActivate: [SecurityGuard]
  },
  {
    path: pages.ObjectPoolStats.name,
    component: ObjectPoolEventStatsComponent,
    data: {
      title: pages.ObjectPoolStats.title
    },
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
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
