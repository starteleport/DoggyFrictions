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
    this.Participants = ko.observableArray(_.map(data.Participants || [], function (participantData) {
        return new ParticipantModel(participantData);
    }));
    this.Actions = new PagedGridModel('Api/Actions/' + data.Id, function (actionData) {
        return new ActionModel(actionData, _this);
    });

    this.GetParticipantName = function (participantId) {
        return _.find(_this.Participants(), function (participant) {
            return participant.Id == participantId;
        }).Name();
    }

    this.Delete = function () {
        alert("Удаление тёрки.");
        window.location.href = '#/Sessions';
    }
}

function ActionModel(actionData, sessionModel) {
    var _this = this;
    _this.Id = actionData.Id;
    _this.Session = sessionModel;
    _this.Date = ko.observable($.format.date(moment(actionData.Date).toDate(), 'dd/MM/yyyy HH:mm'));
    _this.Payers = ko.observableArray(_.map(actionData.Payers || [], function (payerData) {
        return new PayerModel(payerData);
    }));
    _this.Consumptions = ko.observableArray(_.map(actionData.Consumptions || [], function (consumptionData) {
        return new ConsumptionModel(consumptionData, _this.Session);
    }));
    _this.Description = ko.observable(actionData.Description);

    _this.DatailsExpanded = ko.observable(false);

    _this.Amount = ko.computed(function () {
        return _.reduce(_this.Payers(), function (current, $new) {
            return current + Number($new.Amount());
        }, 0);
    });
    _this.PayerNames = ko.computed(function () {
        return _.reduceRight(_this.Payers(), function (current, $new) {
            var participantName = _this.Session.GetParticipantName($new.ParticipantId());
            return (current.length ? (current + ', ') : '') + participantName;
        }, '');
    });
    _this.ConsumerTotals = ko.computed(function () {
        var consumerTotals = _.map(_this.Session.Participants(), function (participant) {
            return new ConsumerModel({ ParticipantId: participant.Id, Amount: 0 });
        });
        _.forEach(_this.Consumptions(), function (consumption) {
            _.forEach(consumption.Consumers(), function (consumer) {
                var ct = _.find(consumerTotals, function (consumerTotal) {
                    return consumerTotal.ParticipantId == consumer.ParticipantId;
                });
                ct.Amount(ct.Amount() + consumer.Amount());
            });
        });
        return consumerTotals;
    });

    this.ToggleDetails = function () {
        _this.DatailsExpanded(!_this.DatailsExpanded());
    }

    this.Delete = function () {
        alert('Удаление постановы.');
        window.location.href = '#/Session/' + _this.Session.Id;
    }

    this.AddConsumption = function () {
        var consumptionModel = new ConsumptionModel({}, _this.Session);
        _.forEach(consumptionModel.Consumers(), function(consumer) {
            consumer.IsActive(true);
        });
        _this.Consumptions.push(consumptionModel);
    }
    this.DeleteConsumption = function (consumptionModel) {
        _this.Consumptions.remove(consumptionModel);
    }
    this.AddPayer = function () {
        _this.Payers.push(new PayerModel({ ParticipantId: _this.Session.Participants()[0].Id }));
    }
    this.DeletePayer = function (payerModel) {
        _this.Payers.remove(payerModel);
    }

    this.Save = function () {
        alert('Сохранение постановы.');
        window.location.href = '#/Session/' + _this.Session.Id;
    }
}

function ConsumptionModel(consumptionData, sessionModel) {
    var _this = this;
    _this.Session = sessionModel;
    this.Description = ko.observable(consumptionData.Description);
    this.Consumers = ko.observableArray(_.map(_this.Session.Participants(), function (participant) {
        var cd = _.find(consumptionData.Consumers || [], function (consumerData) {
            return consumerData.ParticipantId == participant.Id;
        });
        return new ConsumerModel(cd || { ParticipantId: participant.Id, Amount: 0 });
    }));

    var amount = _.reduce(_this.Consumers(), function (current, $new) {
        return current + Number($new.Amount());
    }, 0);
    this.Amount = ko.observable(amount);
    _this.Amount.subscribe(function (newValue) {
        newValue = Number(newValue);
        var activeConsumers = _.filter(_this.Consumers(), function (consumerModel) {
            return consumerModel.IsActive();
        });
        var portion = Math.round((newValue / activeConsumers.length) * 100) / 100;
        var rest = newValue;
        _.forEach(activeConsumers, function (consumer, index) {
            if (index < activeConsumers.length - 1) {
                rest -= portion;
                consumer.Amount(portion);
            } else {
                rest = Math.round(rest * 100) / 100;
                consumer.Amount(rest);
            }
        });
    });
}

function ConsumerModel(consumerData) {
    var _this = this;
    this.ParticipantId = consumerData.ParticipantId;
    this.Amount = ko.observable(consumerData.Amount);
    this.IsActive = ko.observable(consumerData.Amount > 0);

    _this.IsActive.subscribe(function (newValue) {
        if (!newValue) {
            _this.Amount(0);
        }
    });
}

function PayerModel(payerData) {
    var _this = this;
    this.ParticipantId = ko.observable(payerData.ParticipantId);
    this.Amount = ko.observable(payerData.Amount);
}

function ParticipantModel(participantData) {
    var _this = this;
    this.Id = participantData.Id;
    this.Name = ko.observable(participantData.Name);
    this.Balance = ko.observable(participantData.Balance);
}

function SessionsModel(data) {
    this.Sessions = _.map(data || [], function (sessionData) {
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