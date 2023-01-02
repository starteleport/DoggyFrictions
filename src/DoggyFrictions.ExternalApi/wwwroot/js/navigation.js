function NavigationModel(currentPlace) {
    var _this = this;
    this.CurrentPlace = currentPlace || '';
    this.History = [];
    this.Back = function () {
        return _.last(_this.History);
    }
    this.AddHistory = function (name, url) {
        _this.History.push(new NavigationLinkModel(name, url));
    }
}
function NavigationLinkModel(name, url) {
    var _this = this;
    this.Name = name || 'Home';
    this.Url = url || '/';
}