$(document).ready(function () {
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

        _.forEach($view.find('input[type=datetime]'), function (input) {
            $(input).datetimepicker({
                format: 'DD/MM/YYYY HH:mm'
            });
        });
        $.material.init();

        ko.applyBindings(model, $view[0]);
        $app.swap($view);
        $view.show();
    };

    $app.get('#/Sessions', function (context) {
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

    $app.get('#/Session/:sessionId/CreateAction', function (context) {
        $.when($.get('Api/Sessions/' + context.params.sessionId))
            .then(function(sessionData) {
                var sessionModel = new SessionModel(sessionData);
                var actionModel = new ActionModel({}, sessionModel);
                show('action-edit', actionModel);
            });
    });

    $app.get('#/Session/:sessionId/EditAction/:id', function(context) {
        $.when($.get('Api/Sessions/' + context.params.sessionId),
                $.get('Api/Actions/' + context.params.sessionId + '/' + context.params.id))
            .then(function(sessionData, actionData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new ActionModel(actionData[0], sessionModel);
                show('action-edit', actionModel);
            });
    });

    $app.run('#/Sessions');
}