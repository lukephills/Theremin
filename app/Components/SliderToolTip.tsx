import * as React from 'react';

interface IProps {
	value: number;
	text: string;
	style: any;
	id: string;
}

class Slider extends React.Component<IProps, any> {

	constructor(props){
		super(props);
	}

	public render(): React.ReactElement<{}> {
		// console.log('render')

		return (
			<span id={this.props.id} style={this.props.style}>
				{ `${this.props.value} ${this.props.text}` }
			</span>
		);
	}

}

export default Slider;
