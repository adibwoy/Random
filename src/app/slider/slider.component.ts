import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
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
    private _translateX: number = 0;
    private _sliderWidth: number = 0;
    private _slider: any;
    private _value: number = 0;

    constructor(private dragDispatcher: DragDispatcher) {
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

    get translateX(): number {
        return this._translateX;
    }

    ngAfterViewInit() {
        this._sliderWidth = this._slider.nativeElement.getBoundingClientRect().width;
    }

    get translateValue(): string {
        return "translate3d(" + this.value + "px" + ", -50%, 0)";
    }

    onMove(value: number): void {
        this.value = value;
    }
}
