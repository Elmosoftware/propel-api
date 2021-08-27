import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PAGES } from "./services/navigation.service";
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

const routes: Routes = [
  {
    path: '',
    redirectTo: PAGES.Home,
    pathMatch: 'full'
  },
  {
    path: PAGES.Home,
    component: HomeComponent,
    data: {
      title: "Home"
    }
  },
  {
    path: `${PAGES.Run}/:id`,
    component: RunComponent,
    data: {
      title: "Run"
    }
  },
  {
    path: PAGES.Target,
    component: TargetComponent,
    data: {
      title: "New Target"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: `${PAGES.Target}/:id`,
    component: TargetComponent,
    data: {
      title: "Editing Target"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: PAGES.Script,
    component: ScriptComponent,
    data: {
      title: "New Script"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: `${PAGES.Script}/:id`,
    component: ScriptComponent,
    data: {
      title: "Editing Script"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: PAGES.QuickTask,
    component: QuickTaskComponent,
    data: {
      title: "New Quick task"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: PAGES.Workflow,
    component: WorkflowComponent,
    data: {
      title: "New Workflow"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: `${PAGES.Workflow}/:id`,
    component: WorkflowComponent,
    data: {
      title: "Editing Workflow"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: `${PAGES.Results}/:id`,
    component: ResultsComponent,
    data: {
      title: "Displaying execution results"
    }
  },
  {
    path: PAGES.Search,
    component: SearchComponent,
    data: {
      title: "New Search"
    }
  },
  {
    path: PAGES.BrowseWorkflows,
    component: SearchComponent,
    data: {
      title: "Browsing Workflows"
    }
  },
  {
    path: PAGES.BrowseScripts,
    component: SearchComponent,
    data: {
      title: "Browsing Scripts"
    }
  },
  {
    path: PAGES.BrowseTargets,
    component: SearchComponent,
    data: {
      title: "Browsing Targets"
    }
  },
  {
    path: PAGES.History,
    component: HistoryComponent,
    data: {
      title: "Seeing Execution History"
    }
  },
  {
    path: PAGES.Offline,
    component: OfflineComponent,
    data: {
      title: "There are connectivity issues"
    }
  },
  {
    path: PAGES.Credential,
    component: CredentialComponent,
    data: {
      title: "New Credential"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: `${PAGES.Credential}/:id`,
    component: CredentialComponent,
    data: {
      title: "Editing Credential"
    },
    canDeactivate: [DataLossPreventionGuard]
  },
  {
    path: PAGES.Sandbox,
    component: ((environment.production)? HomeComponent : SandboxComponent)
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
export class AppRoutingModule { }
