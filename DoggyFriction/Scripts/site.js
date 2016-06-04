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

        _.forEach($view.find('input[type=datetime]'), function (input) {
            $(input).datetimepicker({
                format: 'DD/MM/YYYY HH:mm'
            });
        });
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

    $app.get('#/Session/:sessionId/EditAction/:id', function (context) {
        $.when($.get('Api/Sessions/' + context.params.sessionId),
                $.get('Api/Actions/' + context.params.sessionId + '/' + context.params.id))
            .then(function (sessionData, actionData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new ActionModel(actionData[0], sessionModel);
                show('action-edit', actionModel);
            });
    });

    $app.run('#/Sessions');
}

function SessionModel(data) {
    var _this = this;
    this.Id = data.Id || 0;
    this.Name = data.Name || 'unnamed';
    this.Participants = ko.observableArray(_.map(data.Participants || [], function(participantData) {
        return new ParticipantModel(participantData);
    }));
    this.Actions = new PagedGridModel('Api/Actions/' + data.Id, function (actionData) {
        return new ActionModel(actionData, _this);
    });

    this.GetParticipantName = function(participantId) {
        return _.find(_this.Participants(), function(participant) {
            return participant.Id == participantId;
        }).Name();
    }

    this.Delete = function() {
        alert("Удаление тёрки.");
        window.location.href = '#/Sessions';
    }
}

function ActionModel(actionData, sessionModel) {
    var _this = this;
    _.extend(_this, actionData);
    _this.Date = ko.observable($.format.date(moment(actionData.Date).toDate(), 'dd/MM/yyyy HH:mm'));
    _this.Session = sessionModel;
    _this.Payers = ko.observableArray(_.map(actionData.Payers, function(payerData) {
        return new PayerModel(payerData);
    }));
    _this.Description = ko.observable(actionData.Description);

    _this.DatailsExpanded = ko.observable(false);
    
    _this.Amount = ko.computed(function () {
        return _.reduce(_this.Payers(), function (current, $new) {
            return current + Number($new.Amount());
        }, 0);
    });
    _this.PayerNames = ko.computed(function() {
        return _.reduceRight(_this.Payers(), function(current, $new) {
            var participantName = _this.Session.GetParticipantName($new.ParticipantId());
            return (current.length ? (current + ', ') : '') + participantName;
        }, '');
    });

    this.ToggleDetails = function () {
        _this.DatailsExpanded(!_this.DatailsExpanded());
    }

    this.Delete = function () {
        alert('Удаление постановы.');
        window.location.href = '#/Session/' + _this.Session.Id;
    }

    this.Save = function()
    {
        alert('Сохранение постановы.');
        window.location.href = '#/Session/' + _this.Session.Id;
    }
}

function PayerModel(payerData) {
    var _this = this;
    this.ParticipantId = ko.observable(payerData.Participant.Id);
    this.Amount = ko.observable(payerData.Amount);
}

function ParticipantModel(participantData) {
    var _this = this;
    this.Id = participantData.Id;
    this.Name = ko.observable(participantData.Name);
    this.Balance = ko.observable(participantData.Balance);
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