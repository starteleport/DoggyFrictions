function ActionModel(actionData, sessionModel, isEdit) {
    var _this = this;
    _this.Id = actionData.Id || 0;
    _this.Session = sessionModel;
    _this.PayerId = ko.observable(actionData.PayerId ?? _this.Session.Participants()[0].Id);

    _this.Amount = ko.observable(actionData.Amount || 0);
    _this.SplitAmount = function () {
        var amount = Number(_this.Amount());
        var activeConsumers = _.filter(_this.Consumers(), function (consumerModel) {
            return consumerModel.IsActive();
        });
        var portion = Math.round((amount / activeConsumers.length) * 100) / 100;
        var rest = amount;
        _.forEach(activeConsumers, function (consumer, index) {
            if (index < activeConsumers.length - 1) {
                rest -= portion;
                consumer.Amount(portion);
            } else {
                rest = Math.round(rest * 100) / 100;
                consumer.Amount(rest);
            }
        });
    }

    _this.Consumers = ko.observableArray(_.map(_this.Session.Participants(), function (participant) {
        var cd = _.find(actionData.Consumers || [], function (consumerData) {
            return consumerData.ParticipantId == participant.Id;
        });
        var consumerModel = new ConsumerModel(cd || { ParticipantId: participant.Id, Amount: 0 }, _this);
        consumerModel.ParticipantName = participant.Name();
        return consumerModel;
    }));

    // For new actions, activate all consumers by default
    if (_this.Id === 0 && !actionData.Amount) {
        _.forEach(_this.Consumers(), function (consumer) {
            consumer.IsActive(true);
        });
    }

    _this.Description = ko.observable(actionData.Description);
    _this.IsEdit = ko.observable(isEdit || false);

    _this.PayerName = ko.computed(function () {
        return _this.Session.GetParticipant(_this.PayerId()).Name();
    });

    this.ToggleConsumer = function (participant) {
        if (!_this.IsEdit()) {
            return;
        }
        var consumer = _.find(_this.Consumers() || [], function(consumer) {
            return consumer.ParticipantId == participant.Id;
        });
        if (consumer) {
            consumer.IsActive(!consumer.IsActive());
        }
    }

    this.Save = function() {
        var operation = _this._createSaveOperation();
        window.App.Functions.Process(operation, function(actionData) {
            window.App.Functions.Move('#/Session/' + _this.Session.Id)();
        });
    }
    this._createSaveOperation = function() {
        var serialized = {
            Id: _this.Id,
            SessionId: _this.Session.Id,
            Description: _this.Description(),
            PayerId: _this.PayerId(),
            Amount: _this.Amount(),
            Consumers: _.map(_.filter(_this.Consumers(), function (consumerModel) {
                return consumerModel.IsActive();
            }), function (consumerModel) {
                return {
                    ParticipantId: consumerModel.ParticipantId,
                    Amount: consumerModel.Amount()
                };
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
        window.App.Functions.Process(operation, function() {
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

    _this.Amount.subscribe(_this.SplitAmount);
}