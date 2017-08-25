import {Component, ElementRef, Input, NgZone, Renderer2, ViewChild} from '@angular/core';
import {DragDispatcher} from "clarity-angular/data/datagrid/providers/drag-dispatcher"
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'app-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
    providers: [DragDispatcher]
})
export class SliderComponent {

    private subscriptions: Subscription[] = [];
    private _slider: any;
    private _value: number = 0;

    private _sliderClientRect: ClientRect;

    get sliderLeft(): number {
        return this._sliderClientRect.left;
    }

    get sliderRight(): number {
        return this._sliderClientRect.right;
    }

    constructor(private _ngZone: NgZone, private dragDispatcher: DragDispatcher, private renderer: Renderer2) {

        this.subscriptions.push(
            this.dragDispatcher.onDragStart.subscribe(($event) => {
                this._sliderClientRect = this._slider.nativeElement.getBoundingClientRect();
                console.log(this.sliderLeft);
                console.log(this.sliderRight);
            }));

        this.subscriptions.push(
            this.dragDispatcher.onDragMove.subscribe(($event) => {
                let clientX: any = $event.clientX;
                if ((clientX < this.sliderLeft) || (clientX > this.sliderRight)) {
                    return;
                } else {
                    this.onMove(clientX);
                }
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

    onMove(value: number): void {
        this._ngZone.runOutsideAngular(() => {
            this.renderer.setStyle(this.dragDispatcher.handleRef.nativeElement, "left", value + "px");
        });
    }
}
