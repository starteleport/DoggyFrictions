String.prototype.formatDate = function () {
    var date = moment(this.toString(), window.App.Format.DateTime.toUpperCase());
    if (!date.isValid()) {
        date = moment(this.toString());
    }
    return date.format(window.App.Format.DateTime.toUpperCase());
};
Date.prototype.formatDate = function () {
    return moment(this).format(window.App.Format.DateTime.toUpperCase());
};
String.prototype.extractDate = function () {
    return moment(this.toString(), window.App.Format.DateTime.toUpperCase()).format(window.App.Format.DateTimeSave.toUpperCase());
};
String.prototype.formatMoney = function () {
    var number = Number((this.toString() + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.'));
    number = number.toFixed(2);
    return number + '₽';
};
Number.prototype.formatMoney = function() {
    var number = this.toFixed(2);
    return number + '₽';
};
String.prototype.formatNumber = function () {
    return Number((this.toString() + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.'));
};
Number.prototype.formatNumber = function () {
    return Number((this + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.'));
};