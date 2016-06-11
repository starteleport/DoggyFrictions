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
        init: function (element, valueAccessor) {
            var modal = $('#modal-confirm');
            modal.modal({
                show: false
            });
            var modalModel = new ModalModel(valueAccessor());
            ko.applyBindings(modalModel, modal[0]);
            
            $(element).click(function() {
                modal.modal('show');
            });

            var value = valueAccessor();
            if (typeof value === 'function') {
                $(element).on('hide.bs.modal', function () {
                    value();
                });
            }
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                modal.modal("destroy");
            });

        }
    }
});

function ModalModel(cb) {
    this.Title = 'Подтверждение';
    this.Message = 'Ну вы уверены вообще-то?';
    this.Submit = function() {
        alert('LOL');
    };
}