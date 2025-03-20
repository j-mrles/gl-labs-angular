import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet
import { NavbarComponent } from "./navbar/navbar.component";
import { HomepageComponent } from './homepage/homepage.component';
import { FooterComponent } from "./footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterOutlet], // Import RouterOutlet
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'galaxylabs';
}

