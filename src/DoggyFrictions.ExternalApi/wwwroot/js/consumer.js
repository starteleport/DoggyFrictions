function ConsumerModel(consumerData, actionModel) {
    var _this = this;
    this.ActionModel = actionModel;
    this.Id = consumerData.Id || 0;
    this.ParticipantName = consumerData.Name || "";
    this.ParticipantId = consumerData.ParticipantId;
    this.Amount = ko.observable(consumerData.Amount).extend({ required: true, min: 0, number: true });
    this.IsActive = ko.observable(consumerData.Amount !== 0);

    _this.IsActive.subscribe(function (newValue) {
        if (!newValue) {
            _this.Amount(0);
        }
         _this.ActionModel.SplitAmount();
    });
}
