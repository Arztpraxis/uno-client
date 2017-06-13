var app = angular.module("Lobby",[]);

app.controller("lobbyController",function($scope,$interval){
	$scope.lobbies = {};
	$scope.length = 0;

	/*
	$scope.int = $interval(function(){
			     	 $scope.lobbyList();
			     },5000);
	*/

	$scope.$parent.lobbyListCallback = function(data,handler){
		$scope.lobbies = data;
		$scope.length = Object.keys(data).length;
	};	

	$scope.lobbyCreate = function(){
		$scope.send($scope.lobby.name,"lobby_create");
		$scope.$parent.lobby.name = $scope.lobby.name;
	};

	$scope.lobbyList = function(){
		$scope.send(null,"lobby_list");
    };

});