function SessionsModel(data) {
    this.Sessions = _.map(data || [], function (sessionData) {
        return new SessionModel(sessionData);
    });
}

function SessionModel(data, isEdit) {
    var _this = this;
    this.Id = data.Id || 0;
    this.Name = ko.observable(data.Name || '');
    this.Tags = ko.observableArray(_.map(data.Tags || [], function (tagData) {
        return new TagModel(tagData);
    }));
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
    
    this.GetTag = function (tagId) {
        return _.find(_this.Tags(), function (tag) {
            return tag.Id == tagId;
        });
    }
    this.AddTag = function () {
        _this.Tags.push(new TagModel({ Id: 0 }));
        window.App.Functions.ReapplyJQuerryStuff();
    };
    this.DeleteTag = function (tagModel) {
        _this.Tags.remove(tagModel);
    };

    this.GetParticipant = function (participantId) {
        return _.find(_this.Participants(), function (participant) {
            return participant.Id == participantId;
        });
    }
    this.AddParticipant = function() {
        _this.Participants.push(new ParticipantModel({ Id: 0 }));
        window.App.Functions.ReapplyJQuerryStuff();
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
            }),
            Tags: _.map(_this.Tags(), function (tagModel) {
                return {
                    Id: tagModel.Id,
                    Name: tagModel.Name(),
                    Color: tagModel.Color()
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

function TagModel(tagData) {
    var _this = this;
    _this.Id = tagData.Id || 0;
    _this.Name = ko.observable(tagData.Name);
    _this.Color = ko.observable(tagData.Color);
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
    _this.Tags = ko.observableArray(actionData.Tags || []);
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
        return ko.computed(function() {
            var total = 0;
            _.forEach(_this.Consumptions(), function(consumption) {
                var consumer = _.find(consumption.Consumers(), function(consumer) {
                    return consumer.ParticipantId == participant.Id;
                });
                total += consumer.Amount();
            });
            return total;
        });
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
        window.App.Functions.ReapplyJQuerryStuff();
    }
    this.DeleteConsumption = function (consumptionModel) {
        _this.Consumptions.remove(consumptionModel);
    }
    this.AddPayer = function () {
        var payerModel = new PayerModel({ ParticipantId: _this.Session.Participants()[0].Id, Amount: 0 });
        _this.Payers.push(payerModel);

        window.App.Functions.ReapplyJQuerryStuff();
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
                    Amount: consumptonModel.Amount(),
                    Quantity: consumptonModel.Quantity(),
                    SplittedEqually: consumptonModel.IsAuto(),
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
            }),
            Tags: _this.Tags()
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
        return new ConsumerModel(cd || { ParticipantId: participant.Id, Amount: 0 }, _this);
    }));
    this.Amount = ko.observable(consumptionData.Amount || 0);
    this.Quantity = ko.observable(consumptionData.Quantity || 1);
    this.IsAuto = ko.observable(consumptionData.SplittedEqually);
    this.HasFocus = ko.observable(false);

    this.SplitAmount = function () {
        if (!_this.IsAuto()) {
            return;
        }

        var amount = Number(_this.Amount()) * Number(_this.Quantity());
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
    _this.Amount.subscribe(_this.SplitAmount);
    _this.Quantity.subscribe(_this.SplitAmount);
    _this.IsAuto.subscribe(_this.SplitAmount);
}

function ConsumerModel(consumerData, consumptionModel) {
    var _this = this;
    this.ConsumptionModel = consumptionModel;
    this.Id = consumerData.Id || 0;
    this.ParticipantId = consumerData.ParticipantId;
    this.Amount = ko.observable(consumerData.Amount).extend({ required: true, min: 0, number: true });
    this.IsActive = ko.observable(consumerData.Amount > 0);

    _this.IsActive.subscribe(function (newValue) {
        if (!newValue) {
            _this.Amount(0);
        }
        if (_this.ConsumptionModel.IsAuto()) {
            _this.ConsumptionModel.SplitAmount();
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