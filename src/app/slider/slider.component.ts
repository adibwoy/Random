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
    private _currentValue: number = 0;

    @Input("clrStep") noOfSteps: number = 10;

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

    get stepDistance(): number {
        return this.pathLength / this.noOfSteps;
    }

    get currentThumbPosition(): number {
        return this.pathLength * (this.currentValue / this.maxValue);
    }

    get valueIncrement(): number {
        return this.maxValue / this.noOfSteps;
    }

    minValue: number = 0;
    maxValue: number = 100;

    // +ve or -ve & if it is > stepDistance / 2 then move thumb
    getDragDistance(mousePosition: number): number {
        return mousePosition - this.currentThumbPosition;
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
                    const dist: number = this.getDragDistance(clientX);
                    if (dist > this.stepDistance / 2) {
                        this.currentValue = this.currentValue + this.valueIncrement;
                        this.onMove(this.currentThumbPosition);
                    } else if ((-1 * dist) > this.stepDistance / 2) {
                        this.currentValue = this.currentValue - this.valueIncrement;
                        this.onMove(this.currentThumbPosition);
                    }
                }
            }));
    }

    get currentValue(): number {
        return this._currentValue;
    }

    @Input("clrValue")
    set currentValue(val: number) {
        this._currentValue = val;
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
