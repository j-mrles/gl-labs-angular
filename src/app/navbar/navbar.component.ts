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
    // Prevent body scroll when menu is open
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Close menu when a link is clicked
  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }
}
