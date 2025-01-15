import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [mode]="'side'"
          [opened]="true">
        <mat-toolbar>Menu</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/products" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Products</span>
          </a>
          <a mat-list-item routerLink="/invoices" routerLinkActive="active">
            <mat-icon matListItemIcon>receipt</mat-icon>
            <span matListItemTitle>Invoices</span>
          </a>
          <a mat-list-item routerLink="/clients" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Clients</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>Invoice Management System</span>
          <span class="toolbar-spacer"></span>
          <button mat-icon-button *ngIf="isLoggedIn" (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        <div class="content-container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    
    .sidenav {
      width: 250px;
    }
    
    .toolbar-spacer {
      flex: 1 1 auto;
    }
    
    .content-container {
      padding: 20px;
    }
    
    .active {
      background: rgba(0, 0, 0, 0.1);
    }
  `]
})
export class AppComponent {
  constructor(private authService: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
