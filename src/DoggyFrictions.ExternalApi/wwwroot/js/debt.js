function DebtsModel(debtsData, sessionModel) {
    var _this = this;
    this.Session = sessionModel;
    this.Debts = _.map(debtsData || [], function (debtData) {
        return new DebtModel(debtData);
    });
    this.Balances = _.reduce(this.Debts, function(balances, next) {
        var amount = next.Amount;
        var debtorName = next.Debtor;
        var debtorBalanceRow = _.find(balances, function (balanceRow) { return balanceRow.Name === debtorName; });
        if (!debtorBalanceRow) {
            debtorBalanceRow = { Name: debtorName, Balance: 0 };
            balances.push(debtorBalanceRow);
        }
        debtorBalanceRow.Balance -= amount;

        var creditorName = next.Creditor;
        var creditorBalanceRow = _.find(balances, function (balanceRow) { return balanceRow.Name === creditorName; });
        if (!creditorBalanceRow) {
            creditorBalanceRow = { Name: creditorName, Balance: 0 };
            balances.push(creditorBalanceRow);
        }
        creditorBalanceRow.Balance += amount;
        return balances;
    }, []);

    this.PayOff = function(debtModel) {
        var moveMoneyModel = {
            From: debtModel.Debtor,
            To: debtModel.Creditor,
            Amount: debtModel.Amount
        };
        var operation = $.post('Api/Actions/' + _this.Session.Id + '/MoveMoney', moveMoneyModel).promise();
        window.App.Functions.Process(operation, function(actionModel) {
            window.App.Functions.Move("#/Session/" + _this.Session.Id + "/Debts")();
        });
    }
}
function DebtModel(debtData) {
    var _this = this;
    this.Amount = debtData.Amount;
    this.Creditor = debtData.Creditor;
    this.Debtor = debtData.Debtor;
}