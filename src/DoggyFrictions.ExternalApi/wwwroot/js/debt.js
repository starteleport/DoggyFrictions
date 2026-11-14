function DebtsModel(debtsData, sessionModel) {
    var _this = this;
    this.Session = sessionModel;
    this.Debts = _.map(debtsData || [], function (debtData) {
        return new DebtModel(debtData);
    });
    // Keyed by participant id: names are not unique within a session.
    var balances = {};
    var balanceOf = function (id, name) {
        return balances[id] || (balances[id] = { Name: name, Balance: 0 });
    };
    _.forEach(this.Debts, function (debt) {
        balanceOf(debt.DebtorId, debt.Debtor).Balance -= debt.Amount;
        balanceOf(debt.CreditorId, debt.Creditor).Balance += debt.Amount;
    });
    this.Balances = _.values(balances);

    this.PayOff = function(debtModel) {
        var moveMoneyModel = {
            FromId: debtModel.DebtorId,
            ToId: debtModel.CreditorId,
            Amount: debtModel.Amount
        };
        var operation = window.App.Functions.Send('POST', 'Api/Actions/' + _this.Session.Id + '/MoveMoney', moveMoneyModel).promise();
        window.App.Functions.Process(operation)
            .done(function(actionModel) {
                $.snackbar({
                    // Rendered as HTML because of the link, so user-entered names must be escaped.
                    content: T('debts.paidOff', _.escape(debtModel.Debtor), _.escape(debtModel.Creditor),
                        "<a href='#/Session/" + _this.Session.Id + "/Action/" + actionModel.Id + "'>" + T('debts.paidOffLink') + "</a>"),
                    htmlAllowed: true,
                    timeout: 0
                });
                window.App.Functions.Move("#/Session/" + _this.Session.Id + "/Debts")();
            });
    }
}
function DebtModel(debtData) {
    var _this = this;
    this.Amount = debtData.Amount;
    this.Creditor = debtData.Creditor;
    this.Debtor = debtData.Debtor;
    this.CreditorId = debtData.CreditorId;
    this.DebtorId = debtData.DebtorId;
}