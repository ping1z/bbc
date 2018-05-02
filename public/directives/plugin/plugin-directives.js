/**
 * Created by Mr.Clock on 2015/5/5.
 */
(function() {
    var app = angular.module('pluginDirectives',['ui.calendar','ui.bootstrap']);

    app.directive('pluginDatePicker',function() {
        return {
            restrict: 'E',
            scope: {
                dateStr : '=ngModel',
                format:'@dateFormat'
            },
            controller: function($scope,$filter) {
                $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.opened = true;
                };

                $scope.dateOptions = {
                    formatYear: 'yy',
                    startingDay: 1
                };

                //$scope.formats = ['dd/MM/yyyy','dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                //$scope.format = 'dd/MM/yyyy';
                $scope.dateObject = $scope.dateStr;

                $scope.$watch(
                    function( $scope ) {
                        return $scope.dateStr;
                    },
                    function( newValue ) {
                        $scope.dateObject = $scope.dateStr;
                    }
                );
                $scope.$watch(
                    function( $scope ) {
                        return $scope.dateObject;
                    },
                    function( newValue ) {
                        if(newValue!=null){
                            $scope.dateStr = $filter('date')(newValue, "yyyy-MM-ddTHH:mm:ssZ");
                            //console.log($scope.dateStr);
                        }else{
                            $scope.dateStr = "";
                        }
                    }
                );
            },
            templateUrl:'/public/directives/plugin/datePickerTmpl.html',
            controllerAs: 'datePickerC'
        };
    });

    app.directive('pluginTimePicker',function() {
        return {
            restrict: 'E',
            scope: {
                timeStr : '=ngModel',
                showMeridian:'=showMeridian'
            },
            controller: function($scope) {

                $scope.hourOptions=['07','08','09','10','11','12','13','14','15','16','17','18'];
                $scope.minOptions=['00','30'];
                $scope.amOptions = ["AM","PM"];
                $scope.isAM=true;
                $scope.hour = '08';
                $scope.min = '00';
                $scope.am = "AM";
                $scope.$watch(
                    function( $scope ) {
                        return $scope.timeStr;
                    },
                    function( newValue ) {
                        var hour = '08';
                        var min = '00';
                        var am = "AM";
						console.log(newValue);
                        if (newValue != null&&newValue!='') {
                            newValue = newValue.trim().split(":");
                            if (newValue[0]) {
                                hour = newValue[0];
                            }
                            if (newValue[1]) {
                                min = newValue[1];
                            }
                        }
                        var num_hour = parseInt(hour);
                        if($scope.showMeridian&&num_hour>12){
                            num_hour-=12;
                            hour = (num_hour<10?'0':'')+num_hour.toString();
                            am="PM";
                        }
                        $scope.hour = hour;
                        $scope.min = min;
                        if( am =='AM'){
                            $scope.isAM=true;
                        }else{
                            $scope.isAM=false;
                        }
                    }
                );
                $scope.toggleAM=function(){
                    $scope.isAM = ! $scope.isAM;
                    $scope.change();
                };
                $scope.change=function(){
                    if($scope.showMeridian&&!$scope.isAM){
                        $scope.hour = parseInt( $scope.hour)+12;
                    }
                    $scope.timeStr = $scope.hour+":"+ $scope.min;
                    console.log($scope.timeStr);
                };
            },
            templateUrl:'/public/directives/plugin/timePickerTmpl.html',
            controllerAs: 'timePickerC'
        };
    });
})();