import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent {

}
