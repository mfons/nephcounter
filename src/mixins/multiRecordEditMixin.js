MultiRecordEditMixin = (superClass) => class extends superClass {
    constructor() {
        super();
    }

    static get properties() {
        return {
            currentRecordIndex: {
                type: Number,
                value: 0
            }
        };
    }

    previousRecord() {
        if (this.currentRecordIndex > 0) {
            this.currentRecordIndex -= 1;
        }
    }

    nextRecord() {
        this.currentRecordIndex += 1;
    }

    _currentRecordIndexChanged(changeRecord, currentRecordIndex) {
        if (currentRecordIndex < 0 || changeRecord.base.length === 0) {
            return;
        }
        if (currentRecordIndex > changeRecord.base.length - 1 && currentRecordIndex > 0) {
            this.currentRecordIndex = changeRecord.base.length - 1;
        }
        this.restore();
    }

    restore() {
        // Abstract function to keep the current record properties up to date
        // Example:
        // this.nutrientName = this.nutrientsOfInterest[this.currentRecordIndex].name;
        // this.maxAllowedDailyUnitOfMeasure = this.nutrientsOfInterest[this.currentRecordIndex].maxAllowedDailyUnit;
        // this.maxAllowedDailyValue = this.nutrientsOfInterest[this.currentRecordIndex].maxAllowedDaily;
    }
}
