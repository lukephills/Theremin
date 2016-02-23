const visibility = require('document-visibility');

interface IVisibility {
	visible(): boolean;
	onPageHide(): any;
	onChange(callback: (visible: boolean) => any): any;
	onVisible: () => any;
	onInvisible: () => any;
}

const Visibility: IVisibility = visibility();
Visibility.onVisible = () => {};
Visibility.onInvisible = () => {};

Visibility.onChange((visible) => {
	if (visible) {
		Visibility.onVisible();
	} else {
		Visibility.onInvisible();
	}
})

function onPageShow() {
	Visibility.onVisible();
}

window.addEventListener("pageshow", onPageShow);

export default Visibility;