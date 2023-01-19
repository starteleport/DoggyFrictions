﻿function SessionsModel(data) {
    this.Sessions = _.map(data || [], function (sessionData) {
        return new SessionModel(sessionData);
    });
}

function ParticipantModel(participantData) {
    var _this = this;
    this.Id = participantData.Id;
    this.Name = ko.observable(participantData.Name);
}

function SessionModel(data, isEdit) {
    var _this = this;
    this.Id = data.Id || 0;
    this.Name = ko.observable(data.Name || '');
    this.Participants = ko.observableArray(_.map(data.Participants || [], function (participantData) {
        return new ParticipantModel(participantData);
    }));
    this.Actions = new PagedGridModel('Api/Actions/' + data.Id, 25, function (actionData) {
        return new ActionModel(actionData, _this);
    });

    _this.ParticipantNames = ko.computed(function () {
        return _.reduceRight(_this.Participants(), function (current, next) {
            return (current.length ? (current + ', ') : '') + next.Name();
        }, '') || 'Собак нет';
    });

    this.IsEdit = ko.observable(isEdit | false);

    this.GetParticipant = function (participantId) {
        return _.find(_this.Participants(), function (participant) {
            return participant.Id == participantId;
        });
    }
    this.AddParticipant = function () {
        _this.Participants.push(new ParticipantModel({ Id: 0 }));
        window.App.Functions.ReapplyJQuerryStuff();
    };
    this.DeleteParticipant = function (participantModel) {
        if (participantModel.Id != 0) {
            alert('Невозможно удалить собаку, которая уже есть в системе.');
        } else {
            _this.Participants.remove(participantModel);
        }
    };

    this.Save = function () {
        var serialized = {
            Id: _this.Id,
            Name: _this.Name(),
            Participants: _.map(_this.Participants(), function (participantModel) {
                return {
                    Id: participantModel.Id,
                    Name: participantModel.Name()
                }
            })
        };
        var operation = (_this.Id == 0
            ? $.post('Api/Sessions', serialized)
            : $.put('Api/Sessions/' + _this.Id, serialized)).promise();
        window.App.Functions.Process(operation)
            .done(function(sessionData) {
                window.App.Functions.Move('#/Session/' + sessionData.Id)();
            });
    }

    this.Delete = function () {
        if (_this.Id <= 0) {
            alert('Can\'t delete session with id = ' + _this.Id);
            return;
        }
        var operation = $.ajax({
            url: 'Api/Sessions/' + _this.Id,
            type: 'DELETE'
        }).promise();
        window.App.Functions.Process(operation)
            .done(function() {
                window.App.Functions.Move('#/Sessions')();
            });
    }

    var currentPlace = _this.IsEdit() ? (_this.Id ? 'Правка' : 'Новая тёрка') : 'Тёрка';
    var navigation = new NavigationModel(currentPlace);
    navigation.AddHistory('Тёрки', '#/Sessions');
    if (_this.IsEdit() && _this.Id) {
        navigation.AddHistory('Тёркa', '#/Session/' + _this.Id);
    }
    this.Navigation = navigation;
}