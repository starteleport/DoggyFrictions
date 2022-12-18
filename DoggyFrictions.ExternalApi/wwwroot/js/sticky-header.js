$.fn.stickyHeader = function () {
    var _this = $(this);

    if (_this.parent().hasClass('sticky-wrapper')) {
        return;
    }
    _this.unstick();
    _this.hide();
    var cells = _this.find('div');
    var table = _this.siblings('table')[0];

    _this.calculateSize = function () {
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
    }
    _this.calculateSize();

    _this.sticky({ topSpacing: 40, bottomSpacing: 500, zIndex: 100 });
    _this.on('sticky-start', function() {
        _this.fadeIn(300);
        _this.calculateSize();
    });
    _this.on('sticky-end', function () { _this.hide(); });
    $(window).resize(function () { _this.calculateSize(); });

    /*_this.on('sticky-start', function () { console.log("Started"); });
    _this.on('sticky-end', function () { console.log("Ended"); });
    _this.on('sticky-update', function () { console.log("Update"); });
    _this.on('sticky-bottom-reached', function () { console.log("Bottom reached"); });
    _this.on('sticky-bottom-unreached', function () { console.log("Bottom unreached"); });*/
}