/**
 * Represets the information returned by any of the application dialogs.
 */
export class DialogResult<T> {

    /**
     * A number representing the button that was pressed. Starting with 
     * number 1 for first button, 2 for the second and go on.
     * If the user cancel the dialog by any medium, (clicking on cancel botton, clicking on 
     * the "X" close button, pressing ESC key or clicking in the backdrop), this propety will have the value 0.
     */
    button: number;
    
    /**
     * Boolean value that indicates if the user cancel the dialog.
     */
    isCancel: boolean;
    
    /**
     * In the case of click the firt button, (accept teh dialog), this property will hold the 
     * returned value.
     */
    value: T
    
    constructor(button: number, value: T) {
        this.button = button
        this.isCancel = (button !== 1);
        this.value = value;
    }
}
