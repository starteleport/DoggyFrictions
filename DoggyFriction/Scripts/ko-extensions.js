$(document).ready(function() {
    ko.bindingHandlers.money = {
        init: function (element, valueAccessor, a, b, c) {
            $(element).bind("change paste", function () {
                var value = $(this).val().formatNumber();
                var observable = valueAccessor();
                observable(value);
            });

            ko.bindingHandlers.value.init(element, valueAccessor, a, b, c);
        },
        update: function (element, valueAccessor, a, b, c) {
            return ko.bindingHandlers.value.update(element, valueAccessor, a, b, c);
        }
    };

    ko.bindingHandlers.executeOnEnter = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var callback = valueAccessor();
            $(element).keypress(function (event) {
                var keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13) {
                    callback.call(viewModel);
                    return false;
                }
                return true;
            });
        }
    };

    ko.bindingHandlers.ifConfirmed = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            $(element).click(function() {
                var template = $('#confirm-dialog-template').html();
                var modalView = $(template);
                modalView.appendTo('body');
                modalView.modal({
                    show: false
                });
                modalView.modal('show');
                var modalModel = {
                    Title: allBindings.get('cdTitle') || 'Подтверждение',
                    Message: allBindings.get('cdMessage') || 'Вы уверены?',
                    Submit: valueAccessor().bind(bindingContext, bindingContext.$data)
                };
                modalView.on('hide.bs.modal', function () {
                    ko.cleanNode(modalView[0]);
                    modalView.remove();
                });
                ko.applyBindings(modalModel, modalView[0]);
            });
        }
    }
});

function ModalModel(tittle, message, submitCallback, declineCallback) {
    this.Title = tittle;
    this.Message = message;
    this.Submit = submitCallback;
    this.Decline = declineCallback;
}