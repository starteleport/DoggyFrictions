function SessionsModel(data) {
    this.Sessions = _.map(data || [], function (sessionData) {
        return new SessionModel(sessionData);
    });
}

function SessionModel(data, isEdit) {
    var _this = this;
    this.Id = data.Id || 0;
    this.Name = ko.observable(data.Name || '');
    this.Participants = ko.observableArray(_.map(data.Participants || [], function (participantData) {
        return new ParticipantModel(participantData);
    }));
    this.Actions = new PagedGridModel('Api/Actions/' + data.Id, function (actionData) {
        return new ActionModel(actionData, _this);
    });

    _this.ParticipantNames = ko.computed(function () {
        return _.reduceRight(_this.Participants(), function (current, next) {
            return (current.length ? (current + ', ') : '') + next.Name();
        }, '') || 'Собак нет';
    });

    this.IsEdit = ko.observable(isEdit | false);

    this.GetParticipantName = function (participantId) {
        return _.find(_this.Participants(), function (participant) {
            return participant.Id == participantId;
        }).Name();
    }

    this.AddParticipant = function() {
        this.Participants.push(new ParticipantModel({Id: 0}));
    };
    this.DeleteParticipant = function (participantModel) {
        if (participantModel.Id != 0) {
            alert('Невозможно удалить собаку, которая уже есть в системе.');
        } else {
            _this.Participants.remove(participantModel);
        }
    };

    this.Save = function () {
        var serialized = {
            Id: _this.Id,
            Name: _this.Name(),
            Participants: _.map(_this.Participants(), function(participantModel) {
                return {
                    Id: participantModel.Id,
                    Name: participantModel.Name()
                }
            })
        };
        var operation = _this.Id == 0
            ? $.post('Api/Sessions', serialized)
            : $.put('Api/Sessions/' + _this.Id, serialized);
        $.when(operation)
            .done(function (sessionData) {
            window.location.href = '#/Session/' + sessionData.Id;
        });
    }

    this.Delete = function () {
        alert("Удаление тёрки.");
        window.location.href = '#/Sessions';
    }
}

function ActionModel(actionData, sessionModel, isEdit) {
    var _this = this;
    _this.Id = actionData.Id || 0;
    _this.Session = sessionModel;
    _this.Date = ko.observable(actionData.Date.formatDate());
    _this.Payers = ko.observableArray(_.map(actionData.Payers || [], function (payerData) {
        return new PayerModel(payerData);
    }));
    _this.Consumptions = ko.observableArray(_.map(actionData.Consumptions || [], function (consumptionData) {
        return new ConsumptionModel(consumptionData, _this.Session);
    }));
    _this.Description = ko.observable(actionData.Description);
    _this.IsEdit = ko.observable(isEdit || false);

    _this.Amount = ko.computed(function () {
        return _.reduce(_this.Payers(), function (current, next) {
            return current + Number(next.Amount());
        }, 0);
    });
    _this.PayerNames = ko.computed(function () {
        return _.reduceRight(_this.Payers(), function (current, next) {
            var participantName = _this.Session.GetParticipantName(next.ParticipantId());
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
    
    this.Delete = function () {
        alert('Удаление постановы.');
        window.location.href = '#/Session/' + _this.Session.Id;
    }

    this.AddConsumption = function (current) {
        var consumptionModel = new ConsumptionModel({}, _this.Session);
        _.forEach(consumptionModel.Consumers(), function (consumer) {
            consumer.IsActive(true);
        });
        var usedAmount = _.reduce(_this.Consumptions(), function (current, next) {
            return current + Number(next.Amount());
        }, 0);
        consumptionModel.Amount(Math.max(_this.Amount() - usedAmount, 0));
        _this.Consumptions.push(consumptionModel);

        _.each(_this.Consumptions(), function(c) { c.HasFocus(false); });
        consumptionModel.HasFocus(true);
        window.App.Functions.ApplyMaterialDesign();
    }
    this.DeleteConsumption = function (consumptionModel) {
        _this.Consumptions.remove(consumptionModel);
    }
    this.AddPayer = function () {
        var payerModel = new PayerModel({ ParticipantId: _this.Session.Participants()[0].Id, Amount: 0 });
        _this.Payers.push(payerModel);

        window.App.Functions.ApplyMaterialDesign();
    }
    this.DeletePayer = function (payerModel) {
        _this.Payers.remove(payerModel);
    }

    this.Save = function() {
        var serialized = {
            Id: _this.Id,
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
                    Description: consumptonModel.Description(),
                    Consumers: _.map(_.filter(consumptonModel.Consumers(), function (consumerModel) {
                        return consumerModel.IsActive();
                    }), function(consumerModel) {
                        return {
                            Id: consumerModel.Id,
                            ParticipantId: consumerModel.ParticipantId,
                            Amount: consumerModel.Amount()
                        };
                    })
                }
            })
        };
        var operation = _this.Id == 0
            ? $.post('Api/Actions/' + _this.Session.Id, serialized)
            : $.put('Api/Actions/' + _this.Session.Id + '/' + _this.Id, serialized);
        $.when(operation)
            .done(function(actionData) {
                window.location.href = '#/Session/' + _this.Session.Id + '/Action/' + actionData.Id;
            });
    }
}

function ConsumptionModel(consumptionData, sessionModel) {
    var _this = this;
    _this.Session = sessionModel;
    this.Id = consumptionData.Id || 0;
    this.Description = ko.observable(consumptionData.Description);
    this.Consumers = ko.observableArray(_.map(_this.Session.Participants(), function (participant) {
        var cd = _.find(consumptionData.Consumers || [], function (consumerData) {
            return consumerData.ParticipantId == participant.Id;
        });
        return new ConsumerModel(cd || { ParticipantId: participant.Id, Amount: 0 });
    }));
    this.Amount = ko.observable(0);
    this.HasFocus = ko.observable(false);

    this.SplitAmount = function (amount) {
        amount = Number(amount);
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

    this.RecalculateAmount = function () {
        var initialAmount = _.reduce(_this.Consumers(), function (current, next) {
            return current + Number(next.Amount());
        }, 0);
        _this.Amount(initialAmount);
    }
    _this.RecalculateAmount();
}

function ConsumerModel(consumerData) {
    var _this = this;
    this.Id = consumerData.Id || 0;
    this.ParticipantId = consumerData.ParticipantId;
    this.Amount = ko.observable(consumerData.Amount).extend({ required: true, min: 0, number: true });
    this.IsActive = ko.observable(consumerData.Amount > 0);

    _this.IsActive.subscribe(function (newValue) {
        if (!newValue) {
            _this.Amount(0);
        }
    });
}

function PayerModel(payerData) {
    var _this = this;
    this.Id = payerData.Id || 0;
    this.ParticipantId = ko.observable(payerData.ParticipantId);
    this.Amount = ko.observable(payerData.Amount);
}

function ParticipantModel(participantData) {
    var _this = this;
    this.Id = participantData.Id;
    this.Name = ko.observable(participantData.Name);
    this.Balance = ko.observable(participantData.Balance);
}