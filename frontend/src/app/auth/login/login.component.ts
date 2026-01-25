import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.credentials.username, this.credentials.password)
      .subscribe({
        next: (response: any) => {
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          this.isLoading = false;
        }
      });
  }
}
