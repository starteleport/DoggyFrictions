$(document).ready(function() {
    $.material.init();
    window.App = {};

    //Init sammy
    if ($('#main')[0]) {
        $.get('/Templates/Get').done(function (templates) {
            window.App.Templates = $(templates);
            window.App.Templates.appendTo('body');
            Sammy("#main", InitSammy);
        });
    }
});

function InitSammy(app) {
    var $app = app;
    var show = function (templateName, model) {
        var template = $('#' + templateName + '-template').html();
        // We need to add the view to the DOM before any elements are initialized
        // But we don't want the screen to flicker while the elements are being initialized
        // So we'll hide the view, add it to the DOM, then wait for swap() to make it visible
        var $view = $(template);
        $view.hide();
        $view.appendTo('body');

        ko.applyBindings(model, $view[0]);
        $app.swap($view);
        $view.show();
    };

    $app.get('#/', function (context) {
        $.when($.get('Api/Sessions')).then(function (data) {
            var model = new SessionsModel(data);
            show('sessions', model);
        });
    });

    $app.get('#/Session/:id', function (context) {
        $.when($.get('Api/Sessions/' + context.params.id)).then(function (data) {
            var model = new SessionModel(data);
            model.Actions.LoadPage();
            show('session', model);
        });
    });

    $app.run('#/');
}

function SessionModel(data) {
    this.Id = data.Id || 0;
    this.Name = data.Name || 'unnamed';
    this.Participants = data.Participants || [];
    this.Actions = new PagedGridModel('Api/Actions/' + data.Id, function (actionData) {
        return new ActionModel(actionData);
    });

    this.Delete = function() {
        alert("Удаление тёрки.");
    }
}

function ActionModel(actionData) {
    var _this = this;
    _.extend(_this, actionData);
    _this.DatailsExpanded = ko.observable(false);

    this.ToggleDetails = function () {
        _this.DatailsExpanded(!_this.DatailsExpanded());
    }
}

function SessionsModel(data) {
    this.Sessions = _.map(data || [], function(sessionData) {
        return new SessionModel(sessionData);
    });
}

function PagedGridModel(updateUrl, createModel) {
    var _this = this;
    _this.updateUrl = updateUrl;
    _this.CreateModelFunction = createModel;
    _this.Page = ko.observable(1);
    _this.TotalPages = ko.observable(1);
    _this.Rows = ko.observableArray([]);
    _this.IsLoading = ko.observable(false);

    this.LoadPage = function (page) {
        if (!page) {
            page = _this.Page();
        }
        _this.IsLoading(true);
        _this.Rows.removeAll();
        $.getJSON(_this.updateUrl, { page: page })
            .done(function (data) {
                if (data) {
                    _this.Page(data.Page);
                    _this.TotalPages(data.TotalPages);
                    var rows = _this.CreateModelFunction ? _.map(data.Rows, _this.CreateModelFunction) : data.Rows;
                    _this.Rows(rows);
                    _this.IsLoading(false);
                }
            });
    }
}