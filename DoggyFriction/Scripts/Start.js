$(document).ready(function () {
    var mobilecheck = function () {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };
    window.App = {
        SammyApp: null,
        IsMobile: mobilecheck(),
        Format: {
            DateTime: 'DD/MM/YYYY',
            DateTimeSave: 'YYYY/MM/DD'
        },
        Functions: {
            Process: function (promise) {
                $('#loading-screen').fadeIn(300);
                return $.when(promise)
                    .done(function(result) {
                        $('#loading-screen').fadeOut(300);
                        return result;
                    }).fail(function(a, b, c) {
                        $('#loading-screen').fadeOut(300);
                        $.snackbar({
                            content: "Ошибка! " + a + '////' + b + '////' + c,
                            timeout: 0,
                            style: "warning"
                        });
                    });
            },
            Move: function(link) {
                return function () {
                    if (window.location.hash === link) {
                        window.App.SammyApp.refresh();
                    } else {
                        window.location.href = link;
                    }
                }
            },
            ReapplyJQuerryStuff: function () {
                $.material.init();
                _.forEach($.find('input.date-input'), function (input) {
                    $(input).datepicker({
                        format: window.App.Format.DateTime.toLowerCase(),
                        orientation: 'bottom',
                        language: 'ru',
                        autoclose: true,
                        todayhighlight: true
                    });
                });
                $('.sticky-table-head').stickyHeader();
                $('.confirm-dialog').each(function() {
                    $(this).data('bs.modal', null);
                });
                $("input[type='text']").on("click", function () {
                    $(this).select();
                });
                $("input[type='text']").on("click", function () {
                    $(this).select();
                });
            }
        },
        GlobalId: {
            Id: 1,
            Next: function() {
                return this.Id = this.Id + 1;
            }
        }
    };

    //Init sammy
    if ($("#main")[0]) {
        $.get('/Templates/Get').done(function (templates) {
            window.App.Templates = $(templates);
            window.App.Templates.appendTo('body');
            Sammy("#main", InitSammy);
        });
    }

    //Register put/delete operations
    jQuery.each(["put", "delete"], function (i, method) {
        jQuery[method] = function (url, data, callback, type) {
            if (jQuery.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return jQuery.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });

    window.App.Functions.ReapplyJQuerryStuff();
});

function InitSammy(app) {
    var $app = app;
    var show = function(templateName, model) {
        var template = $('#' + templateName + '-template').html();
        // We need to add the view to the DOM before any elements are initialized
        // But we don't want the screen to flicker while the elements are being initialized
        // So we'll hide the view, add it to the DOM, then wait for swap() to make it visible
        var $view = $(template);
        $view.hide();
        $view.appendTo('body');

        ko.applyBindings(model, $view[0]);
        $app.swap($view);
        $view.show();
        window.App.Functions.ReapplyJQuerryStuff();
    };

    $app.get('#/Sessions', function() {
        var operation = $.when($.get('Api/Sessions')).then(function(data) {
            var model = new SessionsModel(data);
            var templateName = window.App.IsMobile ? 'sessions-mobile' : 'sessions';
            show(templateName, model);
        }).promise();
        window.App.Functions.Process(operation);
    });

    $app.get('#/Session/Create', function() {
        var model = new SessionModel({ Id: 0 }, true);
        show('session-edit', model);
    });
    $app.get('#/Session/:id', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.id)).then(function(data) {
            var model = new SessionModel(data, false);
            model.Actions.LoadPage();
            var templateName = window.App.IsMobile ? 'session-mobile' : 'session';
            show(templateName, model);
        }).promise();
        window.App.Functions.Process(operation);
    });
    $app.get('#/Session/Edit/:id', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.id)).then(function(data) {
            var model = new SessionModel(data, true);
            show('session-edit', model);
        }).promise();
        window.App.Functions.Process(operation);
    });

    $app.get('#/Session/:sessionId/Action/Create', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.sessionId))
            .then(function(sessionData) {
                var sessionModel = new SessionModel(sessionData);
                var actionModel = new ActionModel({}, sessionModel, true);
                var templateName = window.App.IsMobile ? 'action-mobile' : 'action';
                show(templateName, actionModel);
            }).promise();
        window.App.Functions.Process(operation);
    });
    $app.get('#/Session/:sessionId/Action/Edit/:id', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.sessionId),
                $.get('Api/Actions/' + context.params.sessionId + '/' + context.params.id))
            .then(function(sessionData, actionData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new ActionModel(actionData[0], sessionModel, true);
                var templateName = window.App.IsMobile ? 'action-mobile' : 'action';
                show(templateName, actionModel);
            }).promise();
        window.App.Functions.Process(operation);
    });
    $app.get('#/Session/:sessionId/Action/:id', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.sessionId),
                $.get('Api/Actions/' + context.params.sessionId + '/' + context.params.id))
            .then(function(sessionData, actionData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new ActionModel(actionData[0], sessionModel, false);
                var templateName = window.App.IsMobile ? 'action-mobile' : 'action';
                show(templateName, actionModel);
            }).promise();
        window.App.Functions.Process(operation);
    });
    
    $app.get('#/Session/:sessionId/Debts', function(context) {
        var operation = $.when($.get('Api/Sessions/' + context.params.sessionId), $.get('Api/Debts/' + context.params.sessionId))
            .then(function(sessionData, debtsData) {
                var sessionModel = new SessionModel(sessionData[0]);
                var actionModel = new DebtsModel(debtsData[0], sessionModel);
                show('debts', actionModel);
            }).promise();
        window.App.Functions.Process(operation);
    });

    window.App.SammyApp = $app.run('#/Sessions');
}