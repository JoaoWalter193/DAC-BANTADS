import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RefreshService {
  private refreshSource = new Subject<void>();
  refresh$ = this.refreshSource.asObservable();

  triggerRefresh() {
    this.refreshSource.next();
  }
}
