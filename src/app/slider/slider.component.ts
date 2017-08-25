import {AfterViewInit, Component, ElementRef, Input, NgZone, Renderer2, ViewChild} from '@angular/core';
import {DragDispatcher} from "clarity-angular/data/datagrid/providers/drag-dispatcher"
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'app-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
    providers: [DragDispatcher]
})
export class SliderComponent implements AfterViewInit {

    private subscriptions: Subscription[] = [];
    // private _sliderWidth: number = 0;
    private _slider: any;
    private _value: number = 0;

    constructor(private _ngZone: NgZone, private dragDispatcher: DragDispatcher, private renderer: Renderer2) {

        this.subscriptions.push(
            this.dragDispatcher.onDragMove.subscribe(($event) => {
                this.onMove($event.clientX);
            }));
    }

    get value(): number {
        return this._value;
    }

    @Input("clrValue")
    set value(val: number) {
        this._value = val;
    }

    @ViewChild("thumb")
    set thumb(value: ElementRef) {
        this.dragDispatcher.handleRef = value;
        this.dragDispatcher.addDragListener();
    }

    @ViewChild("slider")
    set slider(value: ElementRef) {
        this._slider = value;
    }

    ngAfterViewInit() {
        // this._sliderWidth = this._slider.nativeElement.getBoundingClientRect().width;
    }

    onMove(value: number): void {
        this._ngZone.runOutsideAngular(() => {
            this.renderer.setStyle(this.dragDispatcher.handleRef.nativeElement, "left", value + "px");
        });
    }
}
