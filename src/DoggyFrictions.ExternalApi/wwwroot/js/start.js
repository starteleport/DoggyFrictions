$(document).ready(function () {
    window.App = {
        SammyApp: null,
        Format: {
            DateTime: 'DD/MM/YYYY',
            DateTimeSave: 'YYYY-MM-DD'
        },
        Functions: {
            Process: function (promise) {
                $('#loading-screen').fadeIn(300);
                return $.when(promise)
                    .done(function(result) {
                        $('#loading-screen').fadeOut(300);
                        return result;
                    }).fail(function(xhr, status, error) {
                        $('#loading-screen').fadeOut(300);
                        // Validation problems come back as { errors: { field: [messages] } }.
                        var problems = xhr && xhr.responseJSON && xhr.responseJSON.errors;
                        var details = problems ? _.uniq(_.flatten(_.values(problems))).join(' ')
                            // Status 0: the request never reached the server (offline, or the server is down).
                            : xhr && xhr.status === 0 ? T('error.offline')
                            : (error || status);
                        // Server messages can quote user input. snackbarjs parses the content as HTML
                        // even with htmlAllowed off, so escape it and pass it as HTML explicitly.
                        $.snackbar({
                            content: T('error.prefix') + ' ' + _.escape(details),
                            htmlAllowed: true,
                            timeout: 0,
                            style: "warning"
                        });
                    });
            },
            // Sends a JSON body; the API does not accept form-encoded data.
            Send: function (method, url, data) {
                return $.ajax({
                    url: url,
                    type: method,
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(data)
                });
            },
            Move: function(link) {
                return function () {
                    if (window.location.hash === link) {
                        window.App.SammyApp.refresh();
                    } else {
                        window.location.href = link;
                    }
                }
            },
            ReapplyJQuerryStuff: function () {
                _.forEach($.find('input.date-input'), function (input) {
                    $(input).datepicker({
                        format: window.App.Format.DateTime.toLowerCase(),
                        orientation: 'bottom',
                        language: window.AppCulture,
                        autoclose: true,
                        todayhighlight: true
                    });
                });
                $('.sticky-table-head').stickyHeader();
                $('.confirm-dialog').each(function() {
                    $(this).data('bs.modal', null);
                });
                $("input[type='text']").on("click", function () {
                    $(this).select();
                });
                $("input[type='text']").on("click", function () {
                    $(this).select();
                });
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
    if ($("#main")[0]) {
        // The server renders the templates in the chosen language; `v` only keeps each language's copy
        // apart in caches. Offline without a cached copy this fails and says the server is unreachable.
        var templatesUrl = '/Templates/Get?' + $.param({ v: window.AppLanguage });
        window.App.Functions.Process($.get(templatesUrl)).done(function (templates) {
            window.App.Templates = $(templates);
            window.App.Templates.appendTo('body');
            Sammy("#main", InitSammy);
            window.cacheAppShell([window.location.origin + templatesUrl]);
        });
    }

    window.App.Functions.ReapplyJQuerryStuff();
});

function InitSammy(app) {
    var $app = app;
    var show = function(templateName, model) {
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

    $app.get('#/Sessions', function() {
        var operation = $.when($.get('Api/Sessions')).then(function(data) {
            var model = new SessionsModel(data);
            show('sessions', model);
        }).promise();
        window.App.Functions.Process(operation);
    });

    $app.get('#/Session/Create', function() {
        var model = new SessionModel({ Id: 0 }, true);
        show('session-edit', model);
    });
    $app.get('#/Session/:id', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.id)).then(function(data) {
            var model = new SessionModel(data, false);
            model.Actions.LoadPage();
            show('session', model);
        }).promise();
        window.App.Functions.Process(operation);
    });
    $app.get('#/Session/Edit/:id', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.id)).then(function(data) {
            var model = new SessionModel(data, true);
            show('session-edit', model);
        }).promise();
        window.App.Functions.Process(operation);
    });

    $app.get('#/Session/:sessionId/Action/Create', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.sessionId))
            .then(function(sessionData) {
                var sessionModel = new SessionModel(sessionData);
                var actionModel = new ActionModel({}, sessionModel, true);
                show('action', actionModel);
            }).promise();
        window.App.Functions.Process(operation);
    });
    $app.get('#/Session/:sessionId/Action/Edit/:id', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.sessionId),
                $.get('Api/Actions/' + context.params.sessionId + '/' + context.params.id))
            .then(function(sessionData, actionData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new ActionModel(actionData[0], sessionModel, true);
                show('action', actionModel);
            }).promise();
        window.App.Functions.Process(operation);
    });
    $app.get('#/Session/:sessionId/Action/:id', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.sessionId),
                $.get('Api/Actions/' + context.params.sessionId + '/' + context.params.id))
            .then(function(sessionData, actionData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new ActionModel(actionData[0], sessionModel, false);
                show('action', actionModel);
            }).promise();
        window.App.Functions.Process(operation);
    });
    
    $app.get('#/Session/:sessionId/Debts', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.sessionId), $.get('Api/Debts/' + context.params.sessionId))
            .then(function(sessionData, debtsData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new DebtsModel(debtsData[0], sessionModel);
                show('debts', actionModel);
            }).promise();
        window.App.Functions.Process(operation);
    });

    window.App.SammyApp = $app.run('#/Sessions');
}