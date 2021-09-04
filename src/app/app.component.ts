import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 's1-virtualities';
  constructor(
    @Inject(DOCUMENT) private document,
    private renderer: Renderer2,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }))
      .pipe(filter((route) => route.outlet === 'primary'))
      .pipe(mergeMap((route) => route.data))
      .subscribe((event) => this.updateBodyClass(event.bodyClass));
  }
 
  /**
   * Muda a classe do Body dinâmicamente
   */
  private updateBodyClass(customBodyClass?: string) {
    this.renderer.setAttribute(this.document?.body, 'class', '');
    if (customBodyClass) {
      this.renderer.addClass(this.document?.body, customBodyClass);
    } else {
      this.renderer.addClass(this.document?.body, 'home');
    }
  }
}
