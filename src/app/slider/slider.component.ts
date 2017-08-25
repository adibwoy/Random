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

    get pathLength(): number {
        return (this.sliderRight - this.sliderLeft - this.thumbWidth);
    }

    constructor(private _ngZone: NgZone, private dragDispatcher: DragDispatcher, private renderer: Renderer2) {

        this.subscriptions.push(
            this.dragDispatcher.onDragStart.subscribe(() => {
                this._sliderClientRect = this._slider.nativeElement.getBoundingClientRect();
            }));

        this.subscriptions.push(
            this.dragDispatcher.onDragMove.subscribe(($event) => {
                let clientX: any = $event.clientX - this.sliderLeft;
                if ((clientX < 0) || (clientX > this.pathLength)) {
                    return;
                } else {
                    this.value = clientX;
                    this.onMove(this.value);
                }
            }));
    }

    @Input("clrValue")
    set value(val: number) {
        // TODO: Add type guards for left and right value
        this._value = val;
        this
            .renderer
            .setStyle(
                this.thumbElement, "transform", `translate3d(${val}px, -50%, 0)`);
    }

    @ViewChild("thumb")
    set thumb(value: ElementRef) {
        this.dragDispatcher.handleRef = value;
        this.dragDispatcher.addDragListener();
    }

    get thumbElement(): any {
        return this.dragDispatcher.handleRef.nativeElement;
    }

    get thumbWidth(): number {
        return 10;
    }

    @ViewChild("slider")
    set slider(value: ElementRef) {
        this._slider = value;
    }

    onMove(value: number): void {
        this._ngZone.runOutsideAngular(() => {
            this
                .renderer
                .setStyle(
                    this.thumbElement, "transform", `translate3d(${value}px, -50%, 0)`);
        });
    }
}
