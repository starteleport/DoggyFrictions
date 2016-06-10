$.fn.stickyHeader = function () {
    var _this = $(this);

    if (_this.parent().hasClass('sticky-wrapper')) {
        return;
    }
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

    _this.sticky({ topSpacing: 50, bottomSpacing: 500, zIndex: 100 });
    _this.on('sticky-start', function () { _this.fadeIn(300); });
    _this.on('sticky-end', function () { _this.hide(); });

    /*_this.on('sticky-start', function () { console.log("Started"); });
    _this.on('sticky-end', function () { console.log("Ended"); });
    _this.on('sticky-update', function () { console.log("Update"); });
    _this.on('sticky-bottom-reached', function () { console.log("Bottom reached"); });
    _this.on('sticky-bottom-unreached', function () { console.log("Bottom unreached"); });*/
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