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
    _this.Consumptions = ko.observableArray(_.map(actionData.Consumptions || [], function (consumptionData) {
        return new ConsumptionModel(consumptionData, _this.Session);
    }));
    _this.Description = ko.observable(actionData.Description);
    _this.IsEdit = ko.observable(isEdit || false);

    _this.Amount = ko.computed(function () {
        return _.reduce(_this.Consumptions(), function (current, next) {
            return current + Number(next.Amount()) * Number(next.Quantity());
        }, 0);
    });
    _this.PayerNames = ko.computed(function () {
        return _.reduceRight(_this.Payers(), function (current, next) {
            var participantName = _this.Session.GetParticipant(next.ParticipantId()).Name();
            return (current.length ? (current + ', ') : '') + participantName;
        }, '');
    });
    _this.ConsumerTotals = _.map(_this.Session.Participants(), function (participant) {
        return ko.computed(function () {
            var total = 0;
            _.forEach(_this.Consumptions(), function (consumption) {
                var consumer = _.find(consumption.Consumers(), function (consumer) {
                    return consumer.ParticipantId == participant.Id;
                });
                total += consumer.Amount();
            });
            return { Name: participant.Name(), Total: total };
        });
    });

    this.AddConsumption = function () {
        _.each(_this.Consumptions(), function (c) { c.HasFocus(false); });
        var consumptionModel = new ConsumptionModel({}, _this.Session);
        _.forEach(consumptionModel.Consumers(), function (consumer) {
            consumer.IsActive(true);
        });
        _this.Consumptions.push(consumptionModel);

        consumptionModel.HasFocus(true);
        window.App.Functions.ReapplyJQuerryStuff();
    }
    this.DeleteConsumption = function (consumptionModel) {
        _this.Consumptions.remove(consumptionModel);
    }
    this.AddPayer = function () {
        _.each(_this.Payers(), function (c) { c.HasFocus(false); });
        var payerModel = new PayerModel({ ParticipantId: _this.Session.Participants()[0].Id });
        _this.Payers.push(payerModel);
        payerModel.HasFocus(true);

        // Calculate unpaid rest
        var consumedAmount = _.reduce(_this.Consumptions(), function (current, next) {
            return current + Number(next.Amount() * next.Quantity() || 0);
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
        var firstConsumption = (_this.Consumptions() || [])[0];
        var consumer = _.find(firstConsumption.Consumers() || [], function(consumer) {
            return consumer.ParticipantId == participant.Id;
        });
        var isCurrentlyActive = consumer && consumer.IsActive();
        _.forEach(_this.Consumptions() || [], function (consumption) {
            _.forEach(consumption.Consumers(), function (consumer) {
                if (consumer.ParticipantId == participant.Id) {
                    consumer.IsActive(!isCurrentlyActive);
                }
            });
        });
    }

    this.Save = function() {
        var operation = _this._createSaveOperation();
        window.App.Functions.Process(operation);
        $.when(operation).done(function(actionData) {
            window.App.Functions.Move('#/Session/' + _this.Session.Id + '/Action/' + actionData.Id)();
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
                    Quantity: consumptonModel.Quantity(),
                    SplittedEqually: consumptonModel.IsAuto(),
                    Description: consumptonModel.Description(),
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
    navigation.AddHistory('Тёрки', '#/Sessions');
    navigation.AddHistory('Тёрка', '#/Session/' + _this.Session.Id);
    if (_this.IsEdit() && _this.Id) {
        navigation.AddHistory('Пастанова', '#/Session/' + _this.Session.Id + '/Action/' + _this.Id);
    }
    this.Navigation = navigation;
}