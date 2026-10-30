import { Route } from '@angular/router';
import { NxWelcome } from './nx-welcome';

export const appRoutes: Route[] = [
  { path: '', component: NxWelcome },
  {
    path: 'products',
    loadChildren: () =>
      import('@org/shop/feature-products').then((m) => m.featureProductsRoutes),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('@org/shop/feature-product-detail').then(
        (m) => m.featureProductDetailRoutes,
      ),
  },
  { path: '**', redirectTo: '' },
];
