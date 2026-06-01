import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-visitor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-visitor.html',
  styleUrls: ['./home-visitor.css']
})
export class HomeVisitorComponent {
  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}