import { Component, ElementRef, Input, NgZone, Renderer2, ViewChild } from '@angular/core';
import { DragDispatcher } from "clarity-angular/data/datagrid/providers/drag-dispatcher"
import { Subscription } from "rxjs/Subscription";

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
    minValue: number = 0;
    maxValue: number = 100;

    @Input("clrStep") noOfSteps: number = 1300;

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

    get currentThumbPosOnPath(): number {
        return this.pathLength * (this.currentValue / this.maxValue);
    }

    get valueIncrement(): number {
        return this.maxValue / this.noOfSteps;
    }

    getMousePosOnPath($event: MouseEvent): number {
        return $event.clientX - this.sliderLeft;
    }

    getDragDistance(mousePosition: number): number {
        return mousePosition - this.currentThumbPosOnPath;
    }

    constructor(private _ngZone: NgZone, private dragDispatcher: DragDispatcher, private renderer: Renderer2) {

        this.subscriptions.push(
            this.dragDispatcher.onDragStart.subscribe(() => {
                this._sliderClientRect = this._slider.nativeElement.getBoundingClientRect();
            }));

        this.subscriptions.push(
            this.dragDispatcher.onDragMove.subscribe(($event) => {

                const newMousePosOnPath: number = this.getMousePosOnPath($event);

                if ((newMousePosOnPath < 0) || (newMousePosOnPath > this.pathLength)) {
                    return;
                } else {

                    // dragged distance in PX -> dragged distance in Steps -> dragged distance in Value

                    const dragDistanceInPX: number = this.getDragDistance(newMousePosOnPath);

                    const whichRounded = dragDistanceInPX > 0 ? "ceil" : "floor";

                    const dragDistanceInSteps = Math[whichRounded](dragDistanceInPX / this.stepDistance) * this.stepDistance;

                    const dragValue: number = dragDistanceInSteps / this.pathLength * this.maxValue;

                    if (Math.abs(dragDistanceInPX) > this.stepDistance / 2) {

                        this.currentValue = this.currentValue + dragValue;
                        this.onMove(this.currentThumbPosOnPath);

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
