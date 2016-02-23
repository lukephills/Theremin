// Empty function
export const noOp: any = () => {};


//TODO: rename to something better

export class IdentifierIndexMap {
	private identifiers: Map<number, number> = new Map();

	public GetIndexFromIdentifier(identifier) {
		return this.identifiers.get(identifier);
	}

	public Remove(identifier) {
		delete this.identifiers.delete(identifier)
	}

	public Add(identifier) {
		var num = 0;
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


