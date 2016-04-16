// Empty function
export const noOp: any = () => {};

export class IdentifierIndexMap {
	private identifiers: Map<number, number> = new Map();

	public GetIndexFromIdentifier(identifier: number): number {
		return this.identifiers.get(identifier);
	}

	public Remove(identifier: number): void {
		delete this.identifiers.delete(identifier);
	}

	public Add(identifier: number): number {
		let num: number = 0;
		//loop through values stored
		for (let value of this.identifiers.values()) {
			if (value === num) {
				num++;
			}
		}
		this.identifiers.set(identifier, num);
		return num;
	}
}


export function isCordovaIOS() {
	return !!window.cordova && cordova.platformId === 'ios';
}

