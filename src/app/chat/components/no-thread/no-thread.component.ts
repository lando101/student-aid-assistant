import { Component } from '@angular/core';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";

@Component({
    selector: 'app-no-thread',
    standalone: true,
    templateUrl: './no-thread.component.html',
    styleUrl: './no-thread.component.sass',
    imports: [LoaderComponent]
})
export class NoThreadComponent {

}
