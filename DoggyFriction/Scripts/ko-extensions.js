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
});