import { Component, DOCUMENT, inject, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  encapsulation: ViewEncapsulation.None
})
export class App {
  constructor() {
    // Remove the inline script listening to ssr-reload websocket messages,
    // as this is conflicting with HMR. Removal will already happen server-side.
    inject(DOCUMENT).getElementById('nx-angular-ssr-reload')?.remove();
  }
}
