$(document).ready(function () {
    window.App = {
        Format: {
            DateTime: 'DD/MM/YYYY',
            DateTimeSave: 'YYYY/MM/DD'
        },
        Functions: {
            Move: function(link) {
                return function() {
                    window.location.href = link;
                }
            },
            ReapplyJQuerryStuff: function () {
                $.material.init();
                _.forEach($.find('input.date-input'), function (input) {
                    $(input).datepicker({
                        format: window.App.Format.DateTime.toLowerCase(),
                        orientation: 'bottom',
                        language: 'ru',
                        autoclose: true,
                        todayhighlight: true
                    });
                });
                $('.sticky-table-head').stickyHeader();
                $('.sticky-table-foot').stickyFooter();
            }
        },
        GlobalId: {
            Id: 1,
            Next: function() {
                return this.Id = this.Id + 1;
            }
        }
    };

    //Init sammy
    if ($('#main')[0]) {
        $.get('/Templates/Get').done(function (templates) {
            window.App.Templates = $(templates);
            window.App.Templates.appendTo('body');
            Sammy("#main", InitSammy);
        });
    }

    //Register put/delete operations
    jQuery.each(["put", "delete"], function (i, method) {
        jQuery[method] = function (url, data, callback, type) {
            if (jQuery.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return jQuery.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });

    window.App.Functions.ReapplyJQuerryStuff();
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
        window.App.Functions.ReapplyJQuerryStuff();
    };

    $app.get('#/Sessions', function (context) {
        $.when($.get('Api/Sessions')).then(function (data) {
            var model = new SessionsModel(data);
            show('sessions', model);
        });
    });

    $app.get('#/Session/Create', function () {
        var model = new SessionModel({ Id: 0 }, true);
        show('session', model);
    });
    $app.get('#/Session/:id', function (context) {
        $.when($.get('Api/Sessions/' + context.params.id)).then(function (data) {
            var model = new SessionModel(data, false);
            model.Actions.LoadPage();
            show('session', model);
        });
    });
    $app.get('#/Session/Edit/:id', function (context) {
        $.when($.get('Api/Sessions/' + context.params.id)).then(function (data) {
            var model = new SessionModel(data, true);
            show('session', model);
        });
    });

    $app.get('#/Session/:sessionId/Action/Create', function (context) {
        $.when($.get('Api/Sessions/' + context.params.sessionId))
            .then(function(sessionData) {
                var sessionModel = new SessionModel(sessionData);
                var actionModel = new ActionModel({}, sessionModel, true);
                show('action', actionModel);
            });
    });
    $app.get('#/Session/:sessionId/Action/Edit/:id', function(context) {
        $.when($.get('Api/Sessions/' + context.params.sessionId),
                $.get('Api/Actions/' + context.params.sessionId + '/' + context.params.id))
            .then(function(sessionData, actionData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new ActionModel(actionData[0], sessionModel, true);
                show('action', actionModel);
            });
    });
    $app.get('#/Session/:sessionId/Action/:id', function (context) {
        $.when($.get('Api/Sessions/' + context.params.sessionId),
                $.get('Api/Actions/' + context.params.sessionId + '/' + context.params.id))
            .then(function (sessionData, actionData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new ActionModel(actionData[0], sessionModel, false);
                show('action', actionModel);
            });
    });

    $app.get('#/Session/:sessionId/Debts', function (context) {
        $.when($.get('Api/Sessions/' + context.params.sessionId), $.get('Api/Debts/' + context.params.sessionId))
            .then(function (sessionData, debtsData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new DebtsModel(debtsData[0], sessionModel);
                show('debts', actionModel);
            });
    });

    $app.run('#/Sessions');
}