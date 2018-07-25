DateUtilsMixin = (superClass) => class extends superClass {
    constructor() {
        super();
    }

    static get properties() {
        return {
            todayString: {
                type: String,
                value: function () {
                    return this._formatLocalDate(new Date()).substring(0, 10);
                }
            },
            todayStringStart: {
                type: String,
                value: function () {
                    return this._formatLocalDate(new Date()).substring(0, 10) + "T00:00:00";
                }
            },
            todayStringEnd: {
                type: String,
                value: function () {
                    return this._formatLocalDate(new Date()).substring(0, 10) + "T23:59:59";
                }
            }
        };
    }

    // static get observers() {
    //     return [];
    // }

    _formatLocalDate(theDate) {
        var now = theDate,
            tzo = -now.getTimezoneOffset(),
            dif = tzo >= 0 ? '+' : '-',
            pad = function (num) {
                var norm = Math.abs(Math.floor(num));
                return (norm < 10 ? '0' : '') + norm;
            };
        return now.getFullYear()
            + '-' + pad(now.getMonth() + 1)
            + '-' + pad(now.getDate())
            + 'T' + pad(now.getHours())
            + ':' + pad(now.getMinutes())
            + ':' + pad(now.getSeconds())
            + dif + pad(tzo / 60)
            + ':' + pad(tzo % 60);
    }

    _isHistoric(myDateString) {
        if (myDateString.substring(0, 10) ===
            this._formatLocalDate(new Date()).substring(0, 10)) {
            return false;
        }
        return true;
    }
}
