String.prototype.formatDate = function () {
    var date = moment(this.toString());
    if (!date.isValid()) {
        date = moment(this.toString(), window.App.Format.DateTime.toUpperCase());
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
    return Number((this.toString() + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.')) + '₽';
};
Number.prototype.formatMoney = function() {
    return Number((this + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.')) + '₽';
};
String.prototype.formatNumber = function () {
    return Number((this.toString() + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.'));
};
Number.prototype.formatNumber = function () {
    return Number((this + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.'));
};