String.prototype.formatDate = function () {
    return $.format.date(moment(this, window.App.Format.DateTime).toDate(), window.App.Format.DateTime);
};
Date.prototype.formatDate = function () {
    return $.format.date(this, window.App.Format.DateTime);
};
String.prototype.extractDate = function () {
    return moment(this, window.App.Format.DateTime).toDate();
};
String.prototype.formatMoney = function () {
    return Number((this + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.')) + '₽';
};
Number.prototype.formatMoney = function() {
    return Number((this + '').replace(/[\$₽]/g, '').replace(/[,]/g, '.')) + '₽';
};