function PagedGridModel(updateUrl, createModel) {
    var _this = this;
    _this.updateUrl = updateUrl;
    _this.CreateModelFunction = createModel;
    _this.Page = ko.observable(1);
    _this.TotalPages = ko.observable(1);
    _this.Rows = ko.observableArray([]);
    _this.IsLoading = ko.observable(false);

    this.LoadPage = function(page) {
        if (!page) {
            page = _this.Page();
        }
        _this.IsLoading(true);
        _this.Rows.removeAll();
        $.getJSON(_this.updateUrl, { page: page })
            .done(function(data) {
                if (data) {
                    _this.Page(data.Page);
                    _this.TotalPages(data.TotalPages);
                    var rows = _this.CreateModelFunction ? _.map(data.Rows, _this.CreateModelFunction) : data.Rows;
                    _this.Rows(rows);
                    _this.IsLoading(false);
                }
            });
    }
};