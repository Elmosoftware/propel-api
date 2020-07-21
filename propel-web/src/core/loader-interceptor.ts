import { Injectable, Injector } from "@angular/core";
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor } from "@angular/common/http";
import { Observable } from "rxjs";
import { finalize, delay } from "rxjs/operators";
import { NavigationService } from 'src/services/navigation.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

    constructor(private nav: NavigationService) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        this.nav.httpReqStarted()
        
        return next.handle(req)
            .pipe(
                //Coment out below line to test delaying requests:
                delay(3000),
                finalize(() => {
                    this.nav.httpReqEnded();
                })
            );
    }
}