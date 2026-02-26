import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

export function authInterceptor(
	req: HttpRequest<unknown>,
	next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
	const authService = inject(AuthService);
	const token = authService.getAccessToken();

	if (!token) {
		return next(req);
	}

	const authReq = req.clone({
		setHeaders: {
			Authorization: `Bearer ${token}`,
		},
	});

	return next(authReq);
}
