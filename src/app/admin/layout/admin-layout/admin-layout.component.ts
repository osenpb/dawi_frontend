import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarComponent } from "./sidebar/sidebar.component";

@Component({
  selector: 'app-admin-layout',
  imports: [SidebarComponent],
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent { }
