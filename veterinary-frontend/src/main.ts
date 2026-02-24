import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

try {
  await bootstrapApplication(App, appConfig);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err);
}
