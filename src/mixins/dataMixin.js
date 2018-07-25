DataMixin = (superClass) => class extends superClass {
    constructor() {
        super();
    }

    // static get properties() {
    //     return {
    //         currentRecordIndex: {
    //             type: Number,
    //             value: 0
    //         }
    //     };
    // }

    _convertToArray(thing) {
        if (typeof thing === 'undefined') return;
        if (Object.prototype.toString.call(thing) === '[object Array]') return thing;
        var newArray = [];
        for (var field in thing) {
            if (thing.hasOwnProperty(field)) {
                thing[field].key = field;
                newArray.push(thing[field]);
            }
        }
        return newArray;
    }
    _aggregateConsumptionsToNutrientUsages(consumptions) {
        var nutrientsArray = [];
        for (var i = 0; i < consumptions.length; i++) {
            var currentNutrients = consumptions[i].nutrientsOfInterest;
            for (var j = 0; j < currentNutrients.length; j++) {
                var currentValue = this.getUnavailableValue(currentNutrients[j].value) * consumptions[i].multiplier;
                if (i === 0) {
                    currentNutrients[j].value = currentValue;
                    nutrientsArray.push(currentNutrients[j]);
                }
                else {
                    for (var k = 0; k < nutrientsArray.length; k++) {
                        if (nutrientsArray[k].nutrient_id === currentNutrients[j].nutrient_id) {
                            nutrientsArray[k].value += currentValue;
                            break;
                        }
                    }
                }
            }
        }
        return nutrientsArray;
    }
    getUnavailableValue(value) {
        if (value === "--") {
            return 0;
        }
        else {
            return value;
        }
    }
    cloneIt(anObject) {
        return (JSON.parse(JSON.stringify(anObject)));
    }
}
