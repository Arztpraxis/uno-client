var app = angular.module("UNO",[]);

app.controller("UnoController",function($scope,$rootScope,$location){
    window.scope = $scope; //debugging
    $scope.hand = [];
    $scope.cardStack = {};
    $scope.currentPlayer = "Game";
    $scope.direction = 2;
    $scope.playerCards = {};

    if(!($scope.player.loggedIn && $scope.player.inLobby)){
        $location.path("/");
        return;
    }

    for (var i = 0; i < $scope.lobby.players.length; i++) {
        $scope.playerCards[$scope.lobby.players[i]] = 7;
    }

    $scope.$parent.UnoGiveCardCallback = function(data,handler){
        $scope.hand = $scope.hand.concat(data);
    };


    $scope.$parent.UnoTurnCallback = function(data,handler){
        console.log("UNO TURN",data);
        $scope.currentPlayer = data;
    };


    $scope.$parent.UnoCardStackCallback = function(data,handler){
        $scope.cardStack.color = data.color;
        $scope.cardStack.face = data.face;

        var color = "SPECIAL";
        if(data.color !== null){
            switch(data.color){
                case 0:
                    color = "RED";
                    break;
                case 1:
                    color = "YELLOW";
                    break;
                case 2:
                    color = "GREEN";
                    break;
                case 3:
                    color = "BLUE";
                    break;
            }
        }
        var face = data.face;
        if(data.face >= 10){
            switch(data.face){
                case 10:
                    face = "BLOCK";
                    break;
                case 11:
                    face = "ROTATE";
                    break;
                case 12:
                    face = "TAKE_TWO";
                    break;
                case 20:
                    face = "PICK_COLOR";
                    break;
                case 21:
                    face = "TAKE_FOUR";
                    break;
            }
        }


        var chatCard = face + " " + color;

        $scope.lobby.chat.push({player:"UNO - " + $scope.currentPlayer,message:chatCard});

        $rootScope.$broadcast("uno_play_card",data.face);

    };

    $scope.$parent.UnoDirectionCallback = function(data,handler){
        $scope.direction = data;
    };

    $scope.$parent.UnoSyncCallback = function(data,handler){
        $scope.hand = data;

    };

    $scope.$parent.UnoCardCountCallback = function(data,handler){
        $scope.playerCards[data.player] = data.count;
    };


    $scope.playCard = function() {
        //$scope.cardStack = this.card;
        var ind = $scope.hand.indexOf(this.card);
        $scope.hand.splice(ind,1);
        $scope.send(ind,"uno_play_card");
    };

    $scope.drawCard = function(){
        $scope.send(null,"uno_draw_card");
    };

    $scope.canPlay = function(card){
        return $scope.currentPlayer === $scope.player.name
            && ($scope.cardStack.color === card.color 
                || $scope.cardStack.face === card.face  
                || card.face >= 20
                || ($scope.cardStack.face >= 20 &&
                    card.face < 20));
    };

    $scope.canPlayAny = function(){
        for (var i = 0; i < $scope.hand.length; i++) {
            if(!$scope.canPlay($scope.hand[i]))
                return false;
        }
        return true;
    };
});


app.directive('unoCard', function($timeout) {
    return {
        scope: {
          card: '='
        },
        templateUrl: 'uno/card-template.html',
        link: function(scope,element,attrs){
            var timeout;

            //visual appearance of special cards
            function updateFace(face){
                if(face>9){
                    switch(face){
                        case 10:
                        face = "\u2298";
                        break;

                        case 11:
                        face = (navigator.platform.indexOf("Win") !== -1)?String.fromCodePoint(0x1F5D8):"\u27f3";
                        break;

                        case 12:
                        face = "+2";
                        break;

                        case 20:
                        face = "C";
                        break;

                        case 21:
                        face = "+4";
                        break;

                    }
                }
                else if(face == 0){
                    face = "0";
                }

                scope.card.appearance = face;

            }


            if(attrs.card == "cardStack"){
                scope.$on("uno_play_card",function(events,args){
                    $timeout.cancel(timeout);
                    updateFace(args);
                });
            }

            timeout = $timeout(function(){updateFace(scope.card.face);},100);

            element.on('$destroy', function() {
                $timeout.cancel(timeout);
            });
        
            //prevents disabled cards from being clicked
            var $el = angular.element(element);
              $el.bind('click', function(event) {
                  if($el.attr('disabled')) {
                      event.stopImmediatePropagation();
                  }
              });

        }

    };
});

/*
app.run(function(){
    var player_hand_width = $("#player_hand").clientWidth;
    var card_width = $(".card")[0].clientWidth;

    var showing_width = -card_width+50;

    $("#player_hand .card")
        .css("margin-left",showing_width+"px");
});
*/