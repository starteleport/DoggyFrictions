$.fn.stickyHeader = function () {
    var _this = $(this);
    _this.unstick();
    _this.hide();
    var cells = _this.find('div');

    var table = _this.siblings('table')[0];
    var tableHead = $(table).find('thead');
    if (!tableHead || !tableHead.height()) {
        return;
    }
    tableHead.find('th').each(function(i) {
        var th = $(this);
        if (cells.length >= i + 1) {
            var cell = $(cells[i]);
            cell.width(th.width());
            cell.height(th.height());
        }
    });

    _this.sticky({ topSpacing: 58 });
    _this.on('sticky-start', function () { _this.show(); });
    _this.on('sticky-end', function () { _this.hide(); });
}

$.fn.stickyFooter = function () {
    //It's not working!

    var _this = $(this);
    _this.hide();
    _this.unstick();
    var cells = _this.find('div');

    var table = _this.siblings('table')[0];
    var tableHead = $(table).find('thead');
    tableHead.find('th').each(function (i) {
        var th = $(this);
        if (cells.length >= i + 1) {
            var cell = $(cells[i]);
            cell.width(th.width());
            cell.height(th.height());
        }
    });

    _this.sticky({ bottomSpacing: 0, topSpacing: -1000 });
    _this.on('sticky-start', function () { _this.fadeIn(300); });
    _this.on('sticky-end', function () { _this.hide(); });
}