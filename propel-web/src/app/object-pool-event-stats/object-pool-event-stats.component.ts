import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoreService } from 'src/services/core.service';
import { ObjectPoolEventStats } from '../../../../propel-shared/models/object-pool-event-stats';
import { environment } from 'src/environments/environment';
import { APIStatus } from '../../../../propel-shared/models/api-status';

@Component({
  selector: 'app-object-pool-event-stats',
  templateUrl: './object-pool-event-stats.component.html',
  styleUrls: ['./object-pool-event-stats.component.css']
})
export class ObjectPoolEventStatsComponent implements OnInit {

  loading: boolean = true;
  apiStatus: APIStatus | null = null;
  stats: ObjectPoolEventStats | null = null;
  graphViewSize: any[] = [800, 400];
  graphColors: any = environment.graphs.colorScheme;
  graphColorsErrors: any = {
    domain: ["#ff0000"]
  }
  cardColor: string = '#232837';
  
  constructor(private core: CoreService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);

    this.refreshData()
    .then(() => {
      this.loading = false;
    })
    .catch((error) => {
      this.core.handleError(error)
    })
  }

  async refreshData(): Promise<void> {
    try {
      this.apiStatus = await this.core.status.getStatus();
      this.stats = await this.core.status.getObjectPoolStats();
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  refreshStats(): void {
    this.refreshData()
  }
}
