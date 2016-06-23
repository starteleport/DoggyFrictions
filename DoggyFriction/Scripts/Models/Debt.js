function DebtsModel(debtsData, sessionModel) {
    var _this = this;
    this.Session = sessionModel;
    this.Debts = _.map(debtsData || [], function (debtData) {
        return new DebtModel(debtData);
    });

    this.PayOff = function (debtModel) {
        var moveMoneyModel = {
            From: debtModel.Debtor,
            To: debtModel.Creditor,
            Amount: debtModel.Amount
        };
        $.post('Api/Actions/' + _this.Session.Id + '/MoveMoney', moveMoneyModel)
            .success(function(actionModel) {
                $.snackbar({
                    content: "Успешно! Постанова <a href='#/Session/" + _this.Session.Id + "/Action/" + actionModel.Id + "'>здесь</a>.",
                    htmlAllowed: true
                });
                window.App.Functions.Move("#/Session/" + _this.Session.Id + "/Debts")();
            })
            .fail(function(a, b, c) {
                $.snackbar({ content: "Ошибка! " + a + '////' + b + '////' + c });
            });
    }
}
function DebtModel(debtData) {
    var _this = this;
    this.Transactions = _.map(_.pairs(_.groupBy(debtData.Transactions || [], "Action")), function (pair) {
        var action = pair[0];
        var transactions = pair[1];
        return {
            Action: action,
            Date: _.first(transactions).Date,
            Amount: _.reduce(transactions, function (current, next) {
                return current + Number(next.Amount);
            }, 0)
        }
    });
    this.Amount = debtData.Amount;
    this.Creditor = debtData.Creditor;
    this.Debtor = debtData.Debtor;
    this.IsExpanded = ko.observable(false);
}