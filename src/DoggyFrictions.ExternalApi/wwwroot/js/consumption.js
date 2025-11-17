function ConsumerModel(consumerData, consumptionModel) {
    var _this = this;
    this.ConsumptionModel = consumptionModel;
    this.Id = consumerData.Id || 0;
    this.ParticipantName = consumerData.Name || "";
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


function ConsumptionModel(consumptionData, sessionModel) {
    var _this = this;
    _this.Session = sessionModel;
    this.Id = consumptionData.Id || 0;
    this.Consumers = ko.observableArray(_.map(_this.Session.Participants(), function (participant) {
        var cd = _.find(consumptionData.Consumers || [], function (consumerData) {
            return consumerData.ParticipantId == participant.Id;
        });
        var consumerModel = new ConsumerModel(cd || { ParticipantId: participant.Id, Amount: 0 }, _this);
        consumerModel.ParticipantName = participant.Name();
        return consumerModel;
    }));
    this.Amount = ko.observable(consumptionData.Amount || 0);
    this.IsAuto = ko.observable(consumptionData.SplittedEqually !== false);
    this.HasFocus = ko.observable(false);

    this.SplitAmount = function () {
        if (!_this.IsAuto()) {
            return;
        }

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
    _this.Amount.subscribe(_this.SplitAmount);
    _this.IsAuto.subscribe(_this.SplitAmount);
}