function PayerModel(payerData) {
    var _this = this;
    this.Id = payerData.Id || 0;
    this.ParticipantId = ko.observable(payerData.ParticipantId);
    this.Amount = ko.observable(payerData.Amount);
    this.HasFocus = ko.observable(false);
}

function ActionModel(actionData, sessionModel, isEdit) {
    var _this = this;
    _this.Id = actionData.Id || 0;
    _this.Session = sessionModel;
    _this.Date = ko.observable((actionData.Date || Date()).formatDate());
    _this.Payers = ko.observableArray(_.map(actionData.Payers || [], function (payerData) {
        return new PayerModel(payerData);
    }));

    // Always ensure we have exactly one consumption
    var consumptionsData = actionData.Consumptions || [];
    if (consumptionsData.length === 0) {
        consumptionsData = [{ Amount: 0 }];
    }
    var consumption = new ConsumptionModel(consumptionsData[0], _this.Session);

    // For new actions, activate all consumers by default
    if (_this.Id === 0 && (!actionData.Consumptions || actionData.Consumptions.length === 0)) {
        _.forEach(consumption.Consumers(), function (consumer) {
            consumer.IsActive(true);
        });
    }

    _this.Consumptions = ko.observableArray([consumption]);

    _this.Description = ko.observable(actionData.Description);
    _this.IsEdit = ko.observable(isEdit || false);

    _this.Amount = ko.computed(function () {
        return _.reduce(_this.Consumptions(), function (current, next) {
            return current + Number(next.Amount());
        }, 0);
    });
    _this.PayerNames = ko.computed(function () {
        return _.reduceRight(_this.Payers(), function (current, next) {
            var participantName = _this.Session.GetParticipant(next.ParticipantId()).Name();
            return (current.length ? (current + ', ') : '') + participantName;
        }, '');
    });
    this.AddPayer = function () {
        _.each(_this.Payers(), function (c) { c.HasFocus(false); });
        var payerModel = new PayerModel({ ParticipantId: _this.Session.Participants()[0].Id });
        _this.Payers.push(payerModel);
        payerModel.HasFocus(true);

        // Calculate unpaid rest
        var consumedAmount = _.reduce(_this.Consumptions(), function (current, next) {
            return current + Number(next.Amount() || 0);
        }, 0);
        var paidAmount = _.reduce(_this.Payers(), function (current, next) {
            return current + Number(next.Amount() || 0);
        }, 0);
        payerModel.Amount(consumedAmount - paidAmount);

        window.App.Functions.ReapplyJQuerryStuff();
    }
    this.DeletePayer = function (payerModel) {
        _this.Payers.remove(payerModel);
    }

    this.ToggleConsumer = function (participant) {
        if (!_this.IsEdit()) {
            return;
        }
        var consumption = _this.Consumptions()[0];
        if (!consumption) {
            return;
        }
        var consumer = _.find(consumption.Consumers() || [], function(consumer) {
            return consumer.ParticipantId == participant.Id;
        });
        if (consumer) {
            consumer.IsActive(!consumer.IsActive());
        }
    }

    this.Save = function() {
        var operation = _this._createSaveOperation();
        window.App.Functions.Process(operation);
        $.when(operation).done(function(actionData) {
            window.App.Functions.Move('#/Session/' + _this.Session.Id)();
        });
    }
    this.SaveAndNew = function() {
        var operation = _this._createSaveOperation();
        window.App.Functions.Process(operation);
        $.when(operation).done(function (actionData) {
            window.App.Functions.Move('#/Session/' + _this.Session.Id + '/Action/Create')();
        });
    }
    this._createSaveOperation = function() {
        var serialized = {
            Id: _this.Id,
            SessionId: _this.Session.Id,
            Description: _this.Description(),
            Date: _this.Date().extractDate(),
            Payers: _.map(_this.Payers(), function (payerModel) {
                return {
                    Id: payerModel.Id,
                    ParticipantId: payerModel.ParticipantId(),
                    Amount: payerModel.Amount()
                }
            }),
            Consumptions: _.map(_this.Consumptions(), function (consumptonModel) {
                return {
                    Id: consumptonModel.Id,
                    Amount: consumptonModel.Amount(),
                    SplittedEqually: consumptonModel.IsAuto(),
                    Consumers: _.map(_.filter(consumptonModel.Consumers(), function (consumerModel) {
                        return consumerModel.IsActive();
                    }), function (consumerModel) {
                        return {
                            Id: consumerModel.Id,
                            ParticipantId: consumerModel.ParticipantId,
                            Amount: consumerModel.Amount()
                        };
                    })
                }
            })
        };
        var operation = (_this.Id == 0
            ? $.post('Api/Actions/' + _this.Session.Id, serialized)
            : $.put('Api/Actions/' + _this.Session.Id + '/' + _this.Id, serialized)).promise();
        return operation;
    }

    this.Delete = function() {
        if (_this.Id <= 0) {
            alert('Can\'t delete action with id = ' + _this.Id);
            return;
        }
        var operation = $.ajax({
            url: 'Api/Actions/' + _this.Session.Id + '/' + _this.Id,
            type: 'DELETE'
        }).promise();
        window.App.Functions.Process(operation)
            .done(function() {
                window.App.Functions.Move('#/Session/' + _this.Session.Id)();
            });
    }

    var currentPlace = _this.IsEdit() ? (_this.Id ? 'Правка' : 'Новый чек') : 'Чек';
    var navigation = new NavigationModel(currentPlace);
    navigation.AddHistory('Тёрка', '#/Session/' + _this.Session.Id);
    if (_this.IsEdit() && _this.Id) {
        navigation.AddHistory('Чек', '#/Session/' + _this.Session.Id + '/Action/' + _this.Id);
    }
    this.Navigation = navigation;
}