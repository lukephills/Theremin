import * as React from 'react';
import { connect } from 'react-redux';

interface IRangeSliderGroupProps {
}

class RangeSliderGroup extends React.Component<IRangeSliderGroupProps, {}> {

	public render(): React.ReactElement<{}> {

		return (
			<section>
				<div>
					<span>Delay Time</span>
					<input type="range" />
				</div>
				<div>
					<span>Feedback</span>
					<input type="range" />
				</div>
				<div>
					<span>Scuzz</span>
					<input type="range" />
				</div>
			</section>
		);
	}

}
export default RangeSliderGroup;
