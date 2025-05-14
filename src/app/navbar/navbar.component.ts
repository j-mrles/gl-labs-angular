import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isMenuOpen = false;

  // Toggle side menu visibility
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
