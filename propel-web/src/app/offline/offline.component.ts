import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/services/core.service';
import { ConnectivityStatus } from 'src/services/connectivity.service';
import { st } from 'stopword';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.component.html',
  styleUrls: ['./offline.component.css']
})
export class OfflineComponent implements OnInit {

  status: ConnectivityStatus

  constructor(private core: CoreService) {
    this.evaluateStatus(core.connectivity.status);
  }

  ngOnInit(): void {
    this.core.connectivity.getConnectivityStatusChangeSubscription()
      .subscribe((status: ConnectivityStatus) => {
        this.evaluateStatus(status);
      })
  }

  evaluateStatus(status?: ConnectivityStatus) {

    if (status) {
      this.status = status;
    }
    
    if (!this.status) return;

    if (this.status.networkOn && this.status.apiOn) {
      this.core.navigation.toHome(true)
    }
  }

  retry() {
    this.core.connectivity.updateStatus()
  }
}
