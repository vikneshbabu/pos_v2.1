# POS System v2.1 - Frontend Development Guide

## Current Status

✅ **Backend Complete** - All APIs, models, and services implemented
✅ **Angular Project Initialized** - Base Angular application created
🔄 **Angular Material Installing** - UI component library being added

## Next Steps for Frontend Development

### 1. Core Module Setup

Create the following core services and guards:

#### Authentication Service (`src/app/core/services/auth.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(username: string, password: string) {
    return this.http.post(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.currentUserSubject.next(response.user);
      }));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
  }

  private loadCurrentUser() {
    this.http.get(`${environment.apiUrl}/auth/me`)
      .subscribe(user => this.currentUserSubject.next(user));
  }
}
```

#### HTTP Interceptor (`src/app/core/interceptors/auth.interceptor.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

#### Auth Guard (`src/app/core/guards/auth.guard.ts`)
```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (user) return true;
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
```

### 2. Feature Modules to Create

#### Auth Module
- Login component with form validation
- Logout functionality
- Token management

#### Dashboard Module
- Main layout with sidebar navigation
- Quick stats cards (today's sales, low stock, etc.)
- Recent orders table
- Sales chart

#### Inventory Module
- Product list with search and filters
- Add/Edit product form
- Barcode scanner component
- Low stock alerts
- Stock adjustment dialog

#### POS Module
- Product search (by name, SKU, barcode)
- Shopping cart component
- Checkout form with payment method selection
- Receipt preview and print

#### Customers Module
- Customer list with search
- Customer detail view with purchase history
- Add/Edit customer form
- Loyalty points display

#### Reports Module
- Sales report with charts (Chart.js)
- Profit analysis
- Inventory report
- Export buttons (PDF/Excel)

### 3. Shared Components

Create reusable components:

- **Barcode Scanner** - Using @zxing/ngx-scanner
- **Data Table** - With pagination, sorting, filtering
- **Confirmation Dialog** - For delete actions
- **Loading Spinner** - For async operations
- **Error Display** - For form validation and API errors

### 4. Angular Material Components to Use

- **MatToolbar** - Top navigation bar
- **MatSidenav** - Side navigation menu
- **MatTable** - Data tables
- **MatPaginator** - Pagination
- **MatSort** - Table sorting
- **MatDialog** - Modal dialogs
- **MatFormField** - Form inputs
- **MatButton** - Buttons
- **MatIcon** - Icons
- **MatCard** - Card containers
- **MatChips** - Tags and labels
- **MatBadge** - Notification badges
- **MatSnackBar** - Toast notifications

### 5. Routing Structure

```typescript
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'inventory', loadChildren: () => import('./modules/inventory/inventory.module').then(m => m.InventoryModule) },
      { path: 'pos', loadChildren: () => import('./modules/pos/pos.module').then(m => m.PosModule) },
      { path: 'customers', loadChildren: () => import('./modules/customers/customers.module').then(m => m.CustomersModule) },
      { path: 'reports', loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule), canActivate: [RoleGuard], data: { roles: ['admin', 'manager'] } },
      { path: 'users', loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule), canActivate: [RoleGuard], data: { roles: ['admin'] } }
    ]
  }
];
```

### 6. State Management (Optional)

For complex state, consider using:
- **NgRx** - Redux pattern for Angular
- **Akita** - Simple state management
- **BehaviorSubject** - For simpler cases

### 7. Styling

Use SCSS with Angular Material theming:

```scss
// src/styles.scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// Custom theme colors
$primary-color: #3f51b5;
$accent-color: #ff4081;
$warn-color: #f44336;

// Global styles
body {
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
}

.container {
  padding: 20px;
}

.card {
  margin-bottom: 20px;
}
```

### 8. Testing

Create unit tests for:
- Services (AuthService, ProductService, etc.)
- Components (LoginComponent, ProductListComponent, etc.)
- Guards (AuthGuard, RoleGuard)

### 9. Build and Deploy

```bash
# Development
ng serve

# Production build
ng build --configuration production

# The output will be in dist/frontend
```

## Quick Commands

```bash
# Generate components
ng generate component modules/auth/login
ng generate component modules/dashboard/dashboard
ng generate component modules/inventory/product-list
ng generate component modules/pos/pos

# Generate services
ng generate service core/services/product
ng generate service core/services/order
ng generate service core/services/customer

# Generate guards
ng generate guard core/guards/role

# Generate modules
ng generate module modules/inventory --routing
ng generate module modules/pos --routing
ng generate module modules/customers --routing
ng generate module modules/reports --routing
```

## Mobile/Android Support

For mobile app:

1. **Install Capacitor**:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

2. **Add Android platform**:
```bash
npm install @capacitor/android
npx cap add android
```

3. **Build and sync**:
```bash
ng build
npx cap sync
npx cap open android
```

4. **Barcode Scanner** - Use @capacitor/camera for native camera access

## Performance Optimization

- Use lazy loading for feature modules
- Implement virtual scrolling for large lists
- Use OnPush change detection strategy
- Optimize images and assets
- Enable production mode and AOT compilation

## Security Best Practices

- Sanitize user inputs
- Use HTTPS in production
- Implement CSRF protection
- Validate data on both client and server
- Use environment variables for sensitive data
- Implement rate limiting on API calls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Recommended VS Code Extensions

- Angular Language Service
- Angular Snippets
- ESLint
- Prettier
- Material Icon Theme
- Auto Import

## Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [Chart.js](https://www.chartjs.org/)
- [Capacitor](https://capacitorjs.com/)
