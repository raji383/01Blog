import { Component } from '@angular/core';
import { Navbar } from './navbar/navbar';
import { Feed } from './feed/feed';
import { Rightbar } from './rightbar/rightbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, Feed, Rightbar],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
}
