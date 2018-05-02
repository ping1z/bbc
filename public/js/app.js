(function () {
    const modules_url = "/public/directives/modules/";
    const templates_url = "/public/directives/templates/";

    var app = angular.module('thatCleanGirl', ['pluginDirectives', 'ui.calendar', 'ngCookies']).config(function ($interpolateProvider, $httpProvider) {
        $interpolateProvider.startSymbol('{{').endSymbol('}}');

        $httpProvider.defaults.headers.post['Content-Type'] =
            'application/x-www-form-urlencoded;charset=utf-8';

        var param = function (obj) {
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function (data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
    });

    app.filter('parseBoolean', function () {
        return function (input) {
            return input ? 'Yes' : 'No';
        };
    });

    app.directive('dMultiline', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                bindModel: '=ngModel'
            },
            link: function ($scope, element, attrs) {
                $scope.$watch(
                    function ($scope) {
                        if ($scope.bindModel) {
                            return $scope.bindModel;
                        } else {
                            return "";
                        }
                    },
                    function (newValue) {
                        if (newValue != "") {
                            element.html(newValue.replace(/\n/g, "<br>"));
                        }
                    }
                );
            }
        };
    });

    app.directive('dFormControlRotationGroup', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                bindModel: '=ngModel'
            },
            link: function ($scope, element, attrs) {
                $scope.$watch(
                    function ($scope) {
                        if ($scope.bindModel) {
                            return $scope.bindModel;
                        } else {
                            return "";
                        }
                    },
                    function (newValue) {
                        if (newValue != "") {
                            element.html(newValue.replace(/\n/g, "<br>"));
                        }
                    }
                );
            }
        };
    });

    app.factory('ValidationService', function ($http) {
        var ValidationService = {
            check: function (element) {
                var isValid = true;
                angular.forEach(element.find("input[required]"), function (value, key) {
                    var eObject = angular.element(value);

                    var inputValue = eObject.val();
                    if (inputValue == null || inputValue == "") {
                        isValid = false;
                    } else {
                    }
                });

                return isValid;
            }
        };

        return ValidationService;
    });

    app.factory('UserService', function ($http) {
        var profile = {};
        var UserService = {
            setProfile: function (p) {
                profile = p;
            },
            getProfile: function (p) {
                return profile;
            },
            isAdmin: function () {
                return profile.roles.ROLE_ADMIN;
            }
        };

        return UserService;
    });
    app.factory('MenuService', function () {
        var components = [];

        var curComponentIndex = 0;
        var curModuleIndex = 0;
        var modulesStack = [];
        var pushModulesStack = function (selectedIndex, modules) {
            var modulesInfoNode = {
                curModuleIndex: 0,
                modules: modules
            }
            modulesStack.push(modulesInfoNode);
            //console.log(modulesStack);
        };

        var changeAlert = function () {
            var moduleStackNode = modulesStack[modulesStack.length - 1];
            //console.log(moduleStackNode);
            var curModule = moduleStackNode.modules[moduleStackNode.curModuleIndex];
            //console.log(curModule);

            if (curModule.changeAlart === true) {
                if (!confirm(curModule.alartMsg)) {
                    return false;
                }
            }
            return true;
        }

        if (components.length > 0) {
            pushModulesStack(curModuleIndex, components[curComponentIndex].modules);
        }
        var MenuService = {
            initMenuService: function (data) {
                //console.log("initMenuService");
                components = data;
                pushModulesStack(0, components[curComponentIndex].modules);
            },
            getComponentIndex: function () {
                return curComponentIndex;
            },
            getModuleIndex: function () {
                return modulesStack[modulesStack.length - 1].curModuleIndex;
            },
            getComponents: function () {
                return components;
            },
            getModules: function () {
                if (components.length <= 0) {
                    return [];
                }
                return modulesStack[modulesStack.length - 1].modules;
            },
            getActiveModule: function () {
                if (components.length <= 0) {
                    return;
                }
                var moduleStackNode = modulesStack[modulesStack.length - 1];
                //console.log(moduleStackNode);
                return moduleStackNode.modules[moduleStackNode.curModuleIndex];
            },
            getModulesStackDepth: function () {
                return modulesStack.length;
            },
            changeComponents: function (index) {
                if (changeAlert()) {
                    curComponentIndex = index;
                    curModuleIndex = 0;
                    modulesStack = [];
                    pushModulesStack(0, components[curComponentIndex].modules);
                }
            },
            changeModule: function (index) {
                if (changeAlert()) {
                    modulesStack[modulesStack.length - 1].curModuleIndex = index;
                }

            },
            pushModulesStack: function (modules) {
                pushModulesStack(0, modules);
            },
            popModulesStack: function () {
                if (modulesStack.length > 1) {
                    if (changeAlert()) {
                        modulesStack.pop();
                    }
                }
            },
            cancelAlert: function () {
                var moduleStackNode = modulesStack[modulesStack.length - 1];
                //console.log(moduleStackNode);
                var curModule = moduleStackNode.modules[moduleStackNode.curModuleIndex];
                curModule.changeAlart = false;
            }
        }
        //MenuService.initMenuService();
        return MenuService;
    });

    app.factory('ConfirmService', function ($http, $modal) {

        var ConfirmService = {

            ConfirmClientInfo: function (clientId) {
                //console.log("openConfirmEmailPreviewer");
                //console.log($scope.clientDetail);
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: templates_url + 'confirmEmailPreviewTmpl.html',
                    controller: function ($scope, $modalInstance, clientId) {
                        //console.log(clientId);
                        $scope.clientId = clientId;
                        $scope.previewUrl = "api/client/previewClientInfo/" + $scope.clientId;
                        $scope.Cancel = function () {
                            $modalInstance.close();
                        };

                        $scope.SendConfirmEmail = function () {
                            if (confirm("Send confirm email to this client?")) {
                                //console.log(clientId);
                                $http.get('api/client/confirmClientInfo/' + clientId).
                                    success(function (data, status, headers, config) {

                                        alert("[SUCCESS] Confirmed email is send.");
                                        $modalInstance.close();

                                    }).
                                    error(function (data, status, headers, config) {
                                        alert("[ERROR] Confirm error.");
                                        //console.log(data);
                                    });
                            }
                        };
                    },
                    resolve: {
                        clientId: function () {
                            return clientId
                        }
                    }
                });
                modalInstance.result.then(function (serviceInfo) {

                }, function () {
                });
            }
        }
        return ConfirmService;
    });


    app.controller('TcgController', ['$scope', '$element', '$window', function ($scope, $element, $window) {
        //console.log("init TcgController");

        $scope.$watch(
            function ($scope) {
                //console.log();
                return angular.element($window).height();
            },
            function (newValue) {
                //console.log(newValue);
                $element.find(".content").css("height", (newValue - 40) + 'px');
            }
        );
    }]);

    app.controller('TestController', ['$scope', '$http', function ($scope, $http) {
        this.testWebAPI = function () {
            $http.get('/api/test')
                .then(function (result) {
                    //console.log(result);
                    //$scope.clientListData = result.data;
                });
        };

    }]);

    app.controller('TopMenuController', ['$scope', '$http', 'MenuService', 'UserService', function ($scope, $http, MenuService, UserService) {
        $http.get('/api/menuInfo')
            .then(function (result) {
                //console.log(result);
                MenuService.initMenuService(result.data);
                $scope.getComponents = MenuService.getComponents;
                $scope.changeComponents = MenuService.changeComponents;
                $scope.getComponentIndex = MenuService.getComponentIndex;
            });

        $http.get('/api/userProfile')
            .then(function (result) {
                UserService.setProfile(result.data);
            });
    }]);
    app.controller('SiderController', ['$scope', 'MenuService', function ($scope, MenuService) {
        $scope.getModules = MenuService.getModules;
        $scope.changeModule = MenuService.changeModule;
        $scope.getModuleIndex = MenuService.getModuleIndex;
        $scope.back = MenuService.popModulesStack;
        $scope.modulesStackDepth = MenuService.getModulesStackDepth;
    }]);

    app.directive('moduleContainer', function ($compile) {
        return {
            restrict: 'E',
            template: '<div></div>',
            scope: {},
            controller: function ($scope, $element, MenuService) {
                $scope.getActiveModule = MenuService.getActiveModule;
                $scope.$watch(
                    function ($scope) {

                        return $scope.getActiveModule() ? $scope.getActiveModule().id : null;
                    },
                    function (newValue) {

                        if ($scope.getActiveModule() && $scope.getActiveModule().isSubModule == false) {
                            //console.log(newValue);
                            var el = $compile("<module-" + newValue + "></module-" + newValue + ">")($scope);
                            $element.html(el);
                        }
                    }
                );
            }
        };
    });

    app.directive('moduleDashboard', function () {
        return {
            restrict: 'E',
            scope: {},
            controller: function ($scope) {
                $scope.moduleInfo = {
                    curSubModule: "dashboard-main"
                    //clientDetail_clientId:null
                };
            },
            templateUrl: modules_url + 'dashboard.html'
        };
    });

    app.directive('dashboardMainTmpl', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $http) {

            },
            templateUrl: templates_url + 'dashboardMainTmpl.html',
            controllerAs: 'dashboardMain'
        };
    });

    app.directive('notificationList', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $http, $modal, $cookies) {
                if ($cookies.tcg_display_notification_list_isHidden == true || $cookies.tcg_display_notification_list_isHidden == 'true') {
                    ;
                    $scope.isHidden = true;
                } else {
                    $scope.isHidden = false;
                }
                $scope.setHidden = function (value) {
                    $scope.isHidden = value;
                    $cookies.tcg_display_notification_list_isHidden = $scope.isHidden;
                    //console.log($cookies.tcg_display_notification_list_isHidden);
                }

                $scope.predicateB = 'clientName';
                $scope.reverseB = true;
                $scope.orderB = function (predicate) {
                    $scope.reverseB = ($scope.predicateB === predicate) ? !$scope.reverseB : false;
                    $scope.predicateB = predicate;
                };

                $scope.predicateC = 'clientName';
                $scope.reverseC = true;
                $scope.orderC = function (predicate) {
                    $scope.reverseC = ($scope.predicateC === predicate) ? !$scope.reverseC : false;
                    $scope.predicateC = predicate;
                };
                function loadServiceList() {
                    $scope.notifyInfoList = [];
                    $scope.birthdays = [];
                    $scope.cleans = [];
                    $http.get('/api/service/notify/getNotificationGroups?timestamp=' + new Date())
                        .then(function (result) {
                            //console.log(result.data);
                            $scope.notifyInfoList = result.data;
                            $scope.birthdays = $scope.notifyInfoList.birthday;
                            $scope.cleans = $scope.notifyInfoList.clean;
                        });
                }
                loadServiceList();

                $scope.openNotifyViewer = function (type, index) {
                    console.log(type + " - " + index);
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: templates_url + 'notificationViewerTmpl.html',
                        controller: function ($scope, $modalInstance, notifyInfo) {
                            $scope.notifyInfo = notifyInfo;
                            //console.log($scope.notifyInfo);
                            if ($scope.notifyInfo.type == 'clean') {
                                //console.log($scope.notifyInfo.items);
                                $scope.cleanItems = {};
                                angular.forEach($scope.notifyInfo.items, function (value, key) {
                                    $scope.cleanItems[value] = $scope.notifyInfo.date;
                                });
                            }
                            $scope.OK = function () {
                                $modalInstance.close();
                            };
                        },
                        resolve: {
                            notifyInfo: function () {
                                return $scope.notifyInfoList[type][index];
                            }
                        }
                    });
                    modalInstance.result.then(function (serviceInfo) {

                    }, function () {
                    });
                }
            },
            templateUrl: templates_url + 'notificationListTmpl.html',
            controllerAs: 'notifyList'
        };
    });

    app.directive('serviceCalendar', function ($compile) {
        return {
            restrict: 'E',
            scope: {
            },
            controller: function ($scope, $compile, $http, $modal, uiCalendarConfig) {
                //console.log(uiCalendarConfig);
                var date = new Date();
                var d = date.getDate();
                var m = date.getMonth();
                var y = date.getFullYear();

                $scope.teamList = [
                    {
                        id: 'teamA',
                        name: 'TeamA'
                    },
                    {
                        id: 'teamB',
                        name: 'TeamB'
                    },
                    {
                        id: 'teamC',
                        name: 'TeamC'
                    },
                    {
                        id: 'birthday',
                        name: 'Birthday'
                    },
                    {
                        id: 'clean',
                        name: 'clean'
                    }
                ];
                $scope.filtersMask = 0
                $scope.filters = {};
                $scope.filtersValue = {};
                var initFilters = function () {
                    angular.forEach($scope.teamList, function (value, key) {
                        if (value.id == 'birthday' || value.id == 'clean') {
                            $scope.filters[value.id] = false;
                        } else {
                            $scope.filters[value.id] = true;
                        }
                        $scope.filtersValue[value.id] = Math.pow(10, key);
                        $scope.filtersMask += $scope.filtersValue[value.id];
                        // console.log(key +' : '+$scope.filtersMask);
                    });
                };
                initFilters();

                $scope.$watch(
                    function ($scope) {
                        $scope.filtersMask = 0;
                        angular.forEach($scope.filters, function (value, key) {
                            if (value === true) {
                                $scope.filtersMask += $scope.filtersValue[key];
                            }
                        });
                        return $scope.filtersMask;
                    },
                    function (newValue) {
                        //console.log(newValue);
                        $scope.refetchEvents();
                    }
                );

                var calendarId = "serviceCalendar1";
                $scope.refetchEvents = function () {
                    if (uiCalendarConfig.calendars[calendarId]) {
                        uiCalendarConfig.calendars[calendarId].fullCalendar('refetchEvents');
                    }
                };

                $scope.view = "agendaWeek";
                $scope.changeView = function (view) {
                    $scope.view = view;
                    uiCalendarConfig.calendars[calendarId].fullCalendar('changeView', view);
                };
                $scope.renderCalender = function () {
                    if (uiCalendarConfig.calendars[calendarId]) {
                        //console.log('renderCalender : ' + calendarId);
                        uiCalendarConfig.calendars[calendarId].fullCalendar('render');
                    }
                };
                $scope.eventRender = function (event, element, view) {
                    element.attr({
                        'tooltip': event.title,
                        'tooltip-append-to-body': true
                    });
                    $compile(element)($scope);
                };
                /* alert on eventClick */
                $scope.alertOnEventClick = function (data, jsEvent, view) {
                    //console.log(data.title + ' was clicked ');
                    //console.log(data);
                    //console.log(data.type);
                    if (data.type == 'service') {
                        //console.log('openEditor');
                        $scope.openEditor(data);
                    } else if (data.type == 'clean') {
                        $scope.openCleanReminderEditor(data);
                    } else if (data.type == 'birthday') {
                        $scope.openBirthdayInfoViewer(data);
                    }


                };
                /* alert on Drop */
                $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
                    // $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
                    //console.log('Event Droped to make dayDelta ' + delta);
                };
                /* alert on Resize */
                $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
                    // $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
                    //console.log('Event Resized to make dayDelta ' + delta);
                };

                var serviceInfoTest = {
                    clientId: '3349-8413',
                    clientName: 'Test Client',
                    tel: '12310213123',
                    address: 'address',
                    email: 'test@email.com',
                    suburb: 'suburb',
                    paymentType: 'cash',
                    price: 998,
                    invoiceNeeded: true,
                    invoiceTitle: 'invoiceTitle',
                    serviceDate: '2018-04-25T08:59:48+0000',
                    serviceStartTime: '10:00',
                    serviceEndTime: '12:00',
                    notes: 'adfasdfasdf',
                    teamId: 'TeamA',

                    jobDetail: {
                        frequency: "weekly",
                        key: {
                            alarmIn: "09:00:AM",
                            alarmOut: "05:00:PM",
                            has: false,
                            hasAlarm: false,
                            notes: "keptByUs"
                        },
                        pet: {
                            has: false,
                            notes: "doesNotMatter"
                        },
                        items: [
                            { amount: 1, name: "Formal lounge", request: "" },
                            { amount: 1, name: "Formal adfasdf", request: "adfasdf" }
                        ]
                    }
                };

                var updateEvent = function (event) {
                    var serviceInfo = event.serviceInfo;
                    event.title = "";
                    if (!serviceInfo.isConfirmed) {
                        event.color = '#d9534f';
                        event.title = 'Unconfirmed\n';
                    } else {
                        if (serviceInfo.teamId === 'teamA') {
                            event.color = '#337ab7';
                        } else if (serviceInfo.teamId === 'teamB') {
                            event.color = '#5cb85c';
                        } else if (serviceInfo.teamId === 'teamC') {
                            event.color = '#f0ad4e';
                        }
                    }
                    event.title += serviceInfo.clientName + '\n' + serviceInfo.teamId;
                    event.textColor = '#333';
                    event.className = serviceInfo.notes ? 'service-event-highlight' : '';
                    event.borderColor = serviceInfo.notes ? "#EC971F" : "";


                    return event;
                }

                var eventDataTransform = function (data) {
                    //console.log(data);
                    var event = {};
                    event.start = new Date(data.serviceDate);
                    var startTime = data.serviceStartTime.split(":");
                    event.start.setHours(startTime[0]);
                    event.start.setMinutes(startTime[1]);

                    event.end = new Date(data.serviceDate);
                    event.end.setHours(event.start.getHours());
                    event.end.setMinutes(event.start.getMinutes() + 30);

                    event.allDay = false;
                    event.serviceInfo = data;
                    //console.log(event);
                    event.color = '#e7d836';
                    event.textColor = 'black';

                    event.type = 'service';
                    event = updateEvent(event);
                    return event;
                };
                var eventDataUpdate = function (event, data) {
                    event.title = data.clientName;
                    event.start = new Date(data.serviceDate);
                    var startTime = data.serviceStartTime.split(":");
                    event.start.setHours(startTime[0]);
                    event.start.setMinutes(startTime[1]);

                    event.end = new Date(data.serviceDate);
                    event.end.setHours(event.start.getHours());
                    event.end.setMinutes(event.start.getMinutes() + 30);
                    event = updateEvent(event);
                    return event;
                }
                //config object
                $scope.uiConfig = {
                    calendar: {
                        height: 525,
                        editable: false,
                        defaultView: 'agendaWeek',
                        header: {
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        //weekends:false,
                        //businessHours:true,
                        minTime: "07:30:00",
                        maxTime: "18:00:00",
                        columnFormat: "ddd",
                        //slotDuration:'00:15:00',
                        eventClick: $scope.alertOnEventClick,
                        eventRender: $scope.eventRender
                    }
                };
                $scope.publicHolidays = null;
                $scope.publicHolidaysSources = {
                    events: function (start, end, timezone, callback) {
                        if ($scope.publicHolidays === null) {
                            var events = [];
                            $http.get('/api/service/getPublicHolidays')
                                .then(function (result) {
                                    //console.log(result.data);
                                    $scope.publicHolidays = result.data;
                                    angular.forEach(result.data, function (value, key) {
                                        event = {
                                            title: value.title,
                                            allDay: true,
                                            start: new Date(value.start),
                                            type: 'holiday'
                                        };
                                        events.push(event);
                                    });
                                    callback(events);
                                }).catch(function(e){
                                    callback(events);
                                });
                        } else {
                            var events = [];
                            angular.forEach($scope.publicHolidays, function (value, key) {
                                event = {
                                    title: value.title,
                                    allDay: true,
                                    start: new Date(value.start),
                                    type: 'holiday'
                                };
                                events.push(event);
                            });
                            callback(events);
                        }
                    },
                    color: '#FFDEEE',   // an option!
                    textColor: '#333' // an option!
                }

                $scope.notifications = null;
                $scope.notificationsSources = {
                    events: function (start, end, timezone, callback) {
                        if ($scope.filters['birthday'] != true && $scope.filters['clean'] != true) {
                            var events = [];
                            callback(events);
                        } else {
                            if ($scope.notifications === null) {
                                $http.get('/api/service/notify/getNotifications')
                                    .then(function (result) {
                                        //console.log(result.data);
                                        $scope.notifications = result.data;
                                        var events = [];
                                        angular.forEach(result.data, function (value, key) {
                                            if ($scope.filters[value.type] === true) {
                                                event = {
                                                    title: value.title,
                                                    allDay: true,
                                                    start: new Date(value.date),
                                                    type: value.type,
                                                    info: value
                                                };
                                                events.push(event);
                                            }
                                        });
                                        callback(events);
                                    });
                            } else {
                                var events = [];
                                angular.forEach($scope.notifications, function (value, key) {
                                    if ($scope.filters[value.type] === true) {
                                        event = {
                                            title: value.title,
                                            allDay: true,
                                            start: new Date(value.date),
                                            type: value.type,
                                            info: value
                                        };
                                        events.push(event);
                                    }
                                });
                                callback(events);
                            }
                        }


                    },
                    color: '#FFD03A',   // an option!
                    textColor: '#333' // an option!
                }

                $scope.serviceList = null;
                $scope.serviceEventList = [];
                $scope.serviceEvents = function (start, end, timezone, callback) {
                    //console.log(start._d.getTime());
                    //console.log(end._d.getTime());
                    //console.log(timezone);
                    if (true) {//$scope.serviceList===null){
                        $http.get('/api/service/listServiceByPeriod/' + start._d.getTime() + '/' + end._d.getTime())
                            .then(function (result) {
                                //console.log(result.data);
                                $scope.serviceList = result.data;
                                $scope.serviceEventList = [];
                                angular.forEach(result.data, function (value, key) {
                                    //console.log($scope.filters[value.teamId]);
                                    if ($scope.filters[value.teamId] === true || value.isConfirmed === false) {
                                        $scope.serviceEventList.push(eventDataTransform(value));

                                    }
                                });
                                //console.log($scope.serviceEventList);
                                callback($scope.serviceEventList);
                            });
                    } else {
                        $scope.serviceEventList = [];
                        angular.forEach($scope.serviceList, function (value, key) {
                            //console.log($scope.filters[value.teamId]);
                            if ($scope.filters[value.teamId] === true || value.isConfirmed === false) {
                                $scope.serviceEventList.push(eventDataTransform(value));
                            }
                        });
                        //console.log($scope.serviceEventList);
                        callback($scope.serviceEventList);
                    }
                };
                $scope.serviceEventSources = {
                    events: $scope.serviceEvents,
                    color: '#e7d836',   // an option!
                    textColor: 'black' // an option!
                    // eventDataTransform:eventDataTransform
                };

                $scope.eventSources = [$scope.serviceEventSources, $scope.notificationsSources, $scope.publicHolidaysSources];
                $scope.curEvent = null;
                var saveServiceInfo = function (serviceInfo, callback) {
                    $http.post('api/service/saveOneOffService', { "serviceInfo": serviceInfo }).
                        success(function (data, status, headers, config) {
                            if (data === "SUCCESS") {
                                alert("[SUCCESS] Service Info  saved.");
                                if (callback && typeof (callback) === "function") {
                                    // execute the callback, passing parameters as necessary
                                    callback();
                                }
                            }
                        }).
                        error(function (data, status, headers, config) {
                            //console.log(data);
                            //console.log(config);
                            //console.log(headers);
                            alert("[ERROR] Service Info Error.");
                        });
                };
                $scope.openEditor = function (event) {
                    $scope.curEvent = event;
                    //console.log($scope.curEvent);
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: templates_url + 'serviceEditorTmpl.html',
                        controller: function ($scope, $modalInstance, serviceInfo) {
                            $scope.serviceInfo = serviceInfo;
                            //console.log($scope.serviceInfo);
                            //$scope.serviceInfo.clientId = "1038-5986";
                            $scope.editMode = !$scope.serviceInfo.isConfirmed;

                            $scope.Confirm = function () {
                                $scope.serviceInfo.isConfirmed = true;
                                if (!$scope.serviceInfo.serviceDate || !$scope.serviceInfo.teamId) {
                                    alert("Please input all required information.");
                                }
                                var serviceInfo = angular.copy($scope.serviceInfo);
                                saveServiceInfo(serviceInfo, function () {
                                    $modalInstance.close($scope.serviceInfo);
                                });
                            };
                            $scope.Edit = function () {
                                $scope.editMode = true;
                            };
                            $scope.Save = function () {
                                if (!$scope.serviceInfo.serviceDate || !$scope.serviceInfo.teamId) {
                                    alert("Please input all required information.");
                                    return;
                                }
                                $scope.editMode = false;
                                var serviceInfo = angular.copy($scope.serviceInfo);
                                saveServiceInfo(serviceInfo, function () {
                                    $modalInstance.close($scope.serviceInfo);
                                });
                            };
                        },
                        resolve: {
                            serviceInfo: function () {
                                return $scope.curEvent.serviceInfo;
                            }
                        }
                    });
                    modalInstance.result.then(function (serviceInfo) {
                        //console.log(serviceInfo);
                        $scope.curEvent = eventDataUpdate($scope.curEvent, serviceInfo);
                        //console.log( $scope.curEvent);
                        uiCalendarConfig.calendars[calendarId].fullCalendar('updateEvent', $scope.curEvent);
                    }, function () {
                        //console.log('Modal dismissed at: ' + new Date());
                    });
                };
                $scope.openBirthdayInfoViewer = function (event) {
                    $scope.curEvent = event;
                    //console.log($scope.curEvent);
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: templates_url + 'birthdayInfoViewerTmpl.html',
                        controller: function ($scope, $modalInstance, notifyInfo) {
                            $scope.notifyInfo = notifyInfo;
                            //console.log($scope.notifyInfo);
                            $scope.OK = function () {

                                $modalInstance.close();
                            };

                        },
                        resolve: {
                            notifyInfo: function () {

                                return $scope.curEvent.info;
                            }
                        }
                    });
                    modalInstance.result.then(function (serviceInfo) {
                        //console.log(serviceInfo);
                        //$scope.curEvent = eventDataUpdate($scope.curEvent,serviceInfo);
                        //console.log( $scope.curEvent);
                        //uiCalendarConfig.calendars[calendarId].fullCalendar('updateEvent',$scope.curEvent);
                    }, function () {
                        //console.log('Modal dismissed at: ' + new Date());
                    });
                }
                $scope.openCleanReminderEditor = function (event) {
                    $scope.curEvent = event;
                    //console.log($scope.curEvent);
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: templates_url + 'cleanReminderEditorTmpl.html',
                        controller: function ($scope, $modalInstance, notifyInfo) {
                            $scope.notifyInfo = notifyInfo;
                            //console.log($scope.notifyInfo);
                            var clientId = $scope.notifyInfo.clientId
                            //console.log(clientId);
                            $scope.cleanItems = {};
                            angular.forEach($scope.notifyInfo.items, function (value, key) {
                                //console.log($scope.filters[value.teamId]);
                                $scope.cleanItems[value] = $scope.notifyInfo.date;
                            });
                            //console.log($scope.cleanItems);

                            $scope.OK = function () {

                                $modalInstance.close();
                            };

                            $scope.Edit = function () {
                                $scope.editMode = true;
                            };
                            $scope.Save = function () {

                                $scope.editMode = false;
                                //var serviceInfo = angular.copy($scope.serviceInfo);
                                //saveServiceInfo(serviceInfo,function(){
                                //    $modalInstance.close($scope.serviceInfo);
                                //});
                            };

                        },
                        resolve: {
                            notifyInfo: function () {

                                return $scope.curEvent.info;
                            }
                        }
                    });
                    modalInstance.result.then(function (serviceInfo) {
                        //console.log(serviceInfo);
                        //$scope.curEvent = eventDataUpdate($scope.curEvent,serviceInfo);
                        //console.log( $scope.curEvent);
                        //uiCalendarConfig.calendars[calendarId].fullCalendar('updateEvent',$scope.curEvent);
                    }, function () {
                        //console.log('Modal dismissed at: ' + new Date());
                    });
                }

            },
            templateUrl: templates_url + 'serviceCalendarTmpl.html',
            controllerAs: 'serviceCalendarC'
        };
    });

    app.directive('serviceUnconfirmedTmpl', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $http) {
                $http.get('/job/serviceUnconfirmed?timestamp=' + new Date())
                    .then(function (result) {
                        //console.log(result.data);
                        $scope.unconfirmedServices = result.data;
                    });
                $scope.ConfirmService = function (index) {
                    //console.log(index);

                    $scope.moduleInfo.curSubModule = "service-editor";
                    $scope.moduleInfo.serviceInfo = $scope.unconfirmedServices[index];

                    //console.log($scope.moduleInfo.serviceInfo);
                };
            },
            templateUrl: templates_url + 'serviceUnconfirmedTmpl.html',
            controllerAs: 'service'
        };
    });

    app.directive('serviceListTmpl', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $http) {
                $scope.searchWord = "";
                $scope.filtersMask = 1111;
                $scope.filters = {
                    pending: true,
                    processing: true,
                    completed: true,
                    reviewed: true,
                    cancelled: true
                };
                $scope.$watch(
                    function ($scope) {
                        $scope.filtersMask = 0;
                        if ($scope.filters.pending) {
                            $scope.filtersMask += 1;
                        }
                        if ($scope.filters.processing) {
                            $scope.filtersMask += 10;
                        }
                        if ($scope.filters.completed) {
                            $scope.filtersMask += 100;
                        }
                        if ($scope.filters.reviewed) {
                            $scope.filtersMask += 1000;
                        }
                        return $scope.filtersMask;
                    },
                    function (newValue) {
                        //console.log(newValue);
                        loadServiceList();
                    }
                );

                $scope.parseStatus = function (status) {
                    var statusStr = "";
                    switch (status) {
                        case 0: statusStr = "Pending"; break;
                        case 1: statusStr = "Processing"; break;
                        case 2: statusStr = "Completed"; break;
                        case 3: statusStr = "Reviewed"; break;
                        case 4: statusStr = "Cancelled"; break;
                    };
                    return statusStr;
                };

                function loadServiceList() {
                    $http.post('/job/serviceConfirmed', { "filters": $scope.filters }).
                        success(function (data, status, headers, config) {
                            //console.log("[Update] - JobDetail - SUCCESS");
                            //console.log(config);
                            //console.log(data);
                            $scope.serviceInfoList = data;

                        }).
                        error(function (data, status, headers, config) {

                        });
                }
                $scope.EditService = function (index) {
                    //console.log(index);
                    $scope.moduleInfo.curSubModule = "service-editor";
                    $scope.moduleInfo.serviceInfo = $scope.serviceInfoList[index];
                };
            },
            templateUrl: templates_url + 'serviceListTmpl.html',
            controllerAs: 'service'
        };
    });

    app.directive('moduleClientList', function () {
        return {
            restrict: 'E',
            scope: {},
            controller: function ($scope) {
                $scope.moduleInfo = {
                    curSubModule: "client-list"
                    //clientDetail_clientId:null
                };
            },
            templateUrl: modules_url + 'clientList.html',
            controllerAs: 'clientListModule'
        };
    });

    app.directive('clientListTmpl', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $http) {
                var clientList = null;
                $http.get('/api/client/getClientList?timestamp=' + new Date())
                    .then(function (result) {
                        clientList = result.data.slice(0);
                        //console.log(clientList);
                        $scope.clientListData = clientList;
                    });
                this.viewClientDetail = function (clientId) {
                    //console.log(clientId);
                    //console.log($scope.moduleInfo);
                    $scope.moduleInfo.curSubModule = "client-detail";
                    $scope.moduleInfo.clientDetail_clientId = clientId;
                };

                this.createNewClient = function () {
                    $scope.moduleInfo.curSubModule = "new-client";
                };

                $scope.predicate = 'clientName';
                $scope.reverse = true;
                $scope.order = function (predicate) {
                    $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
                    $scope.predicate = predicate;
                };

                $scope.keyWord = "";
                $scope.filter = function () {
                    //console.log($scope.keyWord);
                    var regex = new RegExp($scope.keyWord, 'i');
                    var newClientList = [];
                    angular.forEach(clientList, function (value, key) {
                        var clientInfo = value;
                        var content = clientInfo.clientName + " "
                            + clientInfo.tel + " "
                            + clientInfo.address + " "
                            + clientInfo.district + " "
                            + clientInfo.jobDetail.frequency + " "
                            + clientInfo.price;
                        if (regex.test(content)) {
                            newClientList.push(value);
                        }
                    });
                    $scope.clientListData = newClientList;
                }
            },
            templateUrl: templates_url + 'clientListTmpl.html',
            controllerAs: 'clientListTmpl'
        };
    });

    app.directive('clientDetailTmpl', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $http, $modal, MenuService, UserService) {
                var clientDetailModules = [
                    {
                        id: "client-detail",
                        name: "Client Detail",
                        isSubModule: true
                    }
                ];
                $scope.$watch(
                    function ($scope) {
                        return $scope.moduleInfo.clientDetail_clientId;
                    },
                    function (newValue) {
                        //newValue = "111";
                        //console.log(newValue);
                        $http.get('api/client/getClientInfo/' + newValue)
                            .then(function (result) {
                                //console.log(result);
                                $scope.clientDetail = result.data;
                                $scope.UserService = UserService;

                                MenuService.pushModulesStack(clientDetailModules);
                            });
                    }
                );
            },
            templateUrl: templates_url + 'clientDetailTmpl.html',
            controllerAs: 'clientDetailTmpl'
        };
    });

    app.directive('clientInfoSectionTmpl', function () {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                clientDetail: '=ngModel',
                saveSection: '=saveSection',
                editMode: '=editMode'
            },
            controller: function ($scope, $http, $element, MenuService, ValidationService, ConfirmService, UserService) {
                //console.log($scope.editMode);
                //console.log($scope.saveSection);
                //$scope.editMode=true;
                $scope.UserService = UserService
                $scope.submit = function () {
                    if (!ValidationService.check($element)) {
                        alert("Please input all required information.");
                        return;
                    }
                    var clientInfo = angular.copy($scope.clientDetail);
                    $http.post('api/client/updateClientInfo', { "clientInfo": clientInfo }).
                        success(function (data, status, headers, config) {
                            //console.log("[Update] - Client Info - SUCCESS");
                            alert("[SUCCESS] Client Info saved.");
                            $scope.editMode = false;
                            if (confirm("Send Confirm Email to Client?")) {
                                ConfirmService.ConfirmClientInfo(clientInfo._id);
                            }
                        }).
                        error(function (data, status, headers, config) {
                            alert("[ERROR] Save Client Info Error.");
                        });
                };

                $scope.delete = function () {
                    if (confirm("Are sure want to DELETE this client?")) {
                        //console.log('api/client/deleteClientInfo/' + $scope.clientDetail.clientId);
                        $http.get('api/client/deleteClientInfo/' + $scope.clientDetail._id)
                            .then(function (result) {
                                //console.log(result);
                                MenuService.popModulesStack();
                                //MenuService.changeComponents(0);
                            });
                    }
                };
                $scope.$on('setEditMode', function (event, editMode) {
                    //console.log("clientInfoSectionTmpl on setEditMode : "+editMode); // 'Data to send'
                    $scope.editMode = editMode;
                    if ($scope.editMode) {
                        //$scope.submit();
                    }
                });
            },
            templateUrl: templates_url + 'clientInfoSectionTmpl.html',
            controllerAs: 'clientInfoSection'
        };
    });

    app.directive('jobDetailSectionTmpl', function () {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                clientInfo: '=ngModel',
                editMode: '=editMode',
                saveSection: '=saveSection',
                isActive: '=isActive',
                clientId: '@clientId'
            },
            controller: function ($scope, $http, $modal, ConfirmService, UserService) {
                this.curItemIndex = 0;

                $scope.UserService = UserService;
                $scope.itemIndex = null;

                var saveServiceInfo = function (serviceInfo, callback) {
                    $http.post('api/service/saveOneOffService', { "serviceInfo": serviceInfo }).
                        success(function (data, status, headers, config) {
                            if (data === "SUCCESS") {
                                alert("[SUCCESS] Service Info  saved.");
                                if (callback && typeof (callback) === "function") {
                                    // execute the callback, passing parameters as necessary
                                    callback();
                                }
                            }
                        }).
                        error(function (data, status, headers, config) {
                            //console.log(data);
                            //console.log(config);
                            //console.log(headers);
                            alert("[ERROR] Service Info Error.");
                        });
                };

                $scope.createService = function () {
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: templates_url + 'serviceWhenNeedEditorTmpl.html',
                        controller: function ($scope, $modalInstance, clientInfo) {
                            $scope.editMode = true;
                            $scope.serviceInfo = {};
                            $scope.serviceInfo.status = 0;
                            $scope.serviceInfo.clientId = clientInfo._id;
                            $scope.serviceInfo.clientRef = clientInfo.red;
                            $scope.serviceInfo.clientName = clientInfo.name;
                            $scope.serviceInfo.tel = clientInfo.tel;
                            $scope.serviceInfo.address = clientInfo.address;
                            $scope.serviceInfo.email = clientInfo.email;
                            $scope.serviceInfo.suburb = clientInfo.suburb;
                            $scope.serviceInfo.paymentType = angular.copy(clientInfo.paymentType);
                            $scope.serviceInfo.price = angular.copy(clientInfo.price);
                            $scope.serviceInfo.invoiceNeeded = angular.copy(clientInfo.invoiceNeeded);
                            $scope.serviceInfo.invoiceTitle = angular.copy(clientInfo.invoiceTitle);
                            $scope.serviceInfo.serviceDate = new Date();
                            $scope.serviceInfo.teamId = '';
                            $scope.serviceInfo.serviceStartTime = angular.copy(clientInfo.serviceTime);
                            $scope.serviceInfo.notes = '';
                            $scope.serviceInfo.jobDetail = angular.copy(clientInfo.jobDetail);
                            $scope.serviceInfo.jobDetail.frequency = "whenNeed";
                            $scope.serviceInfo.isConfirmed = false;
                            //console.log($scope.serviceInfo);
                            //$scope.serviceInfo.clientId = "1038-5986";
                            $scope.editMode = !$scope.serviceInfo.isConfirmed;

                            $scope.Confirm = function () {
                                $scope.serviceInfo.isConfirmed = true;
                                if (!$scope.serviceInfo.serviceDate || !$scope.serviceInfo.teamId) {
                                    alert("Please input all required information.");
                                    return;
                                }
                                $scope.serviceInfo.isConfirmed = true;
                                var serviceInfo = angular.copy($scope.serviceInfo);
                                saveServiceInfo(serviceInfo, function () {
                                    $modalInstance.close($scope.serviceInfo);
                                });
                            };
                            $scope.Edit = function () {
                                $scope.editMode = true;
                            };
                            $scope.Save = function () {
                                if (!$scope.serviceInfo.serviceDate || !$scope.serviceInfo.teamId) {
                                    alert("Please input all required information.");
                                    return;
                                }
                                $scope.editMode = false;
                            };
                        },
                        resolve: {
                            clientInfo: function () {
                                return $scope.clientInfo;
                            }
                        }
                    });
                }


                $scope.openEditor = function ($index) {

                    $scope.itemIndex = $index;
                    //console.log("Editor Job : "+ $index);
                    //console.log($scope.clientInfo.jobDetail.items);
                    if ($index == null || $index == -1) {
                        $scope.item = {
                            name: "",
                            amount: 1,
                            request: "",
                            id: null
                        };
                    } else {
                        if (typeof $scope.clientInfo.jobDetail.items[$index] === 'undefined') {
                            alert("Job : " + $index + " is not existing.");
                            return;
                        }
                        else {
                            $scope.item = $scope.clientInfo.jobDetail.items[$index];
                            //console.log($scope.item);
                        }
                    }

                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: templates_url + 'jobItemEditorTmpl.html',
                        controller: function ($scope, $modalInstance, item) {
                            $scope.item = item;

                            $scope.ok = function () {

                                if ($scope.item.name == "") {
                                    alert("Please input all required information.");
                                    return;
                                }

                                $modalInstance.close($scope.item);
                            };

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };
                        },
                        resolve: {
                            item: function () {
                                return $scope.item;
                            }
                        }
                    });

                    modalInstance.result.then(function (editedItem) {
                        //console.log(editedItem);
                        if ($scope.itemIndex == -1) {
                            $scope.clientInfo.jobDetail.items.push(editedItem);
                        }
                    }, function () {
                        // console.log('Modal dismissed at: ' + new Date());
                    });
                };

                $scope.deleteItem = function ($index) {
                    this.curItemIndex = 0;
                    $scope.clientInfo.jobDetail.items.splice($index, 1);
                };
                $scope.submit = function () {

                    if ($scope.clientId === null) {
                        alert("Invalid Client Id.");
                        return;
                    }
                    // console.log("submit");
                    var jobDetail = angular.copy($scope.clientInfo.jobDetail);
                    //console.log(jobDetail);
                    $http.post('api/client/updateClientJobDetail', { "jobDetail": jobDetail, "_id": $scope.clientInfo._id }).
                        success(function (data, status, headers, config) {
                            //console.log("[Update] - JobDetail - SUCCESS");
                            alert("[SUCCESS] Job Details saved.");
                            $scope.editMode = false;
                            if (confirm("Send Confirm Email to Client?")) {
                                ConfirmService.ConfirmClientInfo($scope.clientInfo._id);
                            }
                        }).
                        error(function (data, status, headers, config) {
                            alert("[ERROR] Save Job Details Error..");
                        });
                };

                $scope.$on('setEditMode', function (event, editMode) {
                    //console.log("jobDetailSectionTmpl on setEditMode : "+editMode); // 'Data to send'
                    $scope.editMode = editMode;
                    if ($scope.editMode) {
                        //$scope.submit();
                    }
                });

            },
            templateUrl: templates_url + 'jobDetailSectionTmpl.html',
            controllerAs: 'jobDetailSection'
        };
    });

    app.directive('paymentSectionTmpl', function () {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                clientDetail: '=ngModel',
                editMode: '=editMode',
                saveSection: '=saveSection'
            },
            controller: function ($scope, $http, ConfirmService, UserService) {
                $scope.UserService = UserService;
                $scope.submit = function () {
                    if ($scope.clientDetail.invoiceNeeded == true && $scope.clientDetail.invoiceTitle == "") {
                        alert("Please input Company Titile..");
                        return;
                    }
                    $scope.editMode = false;
                    //console.log("submit");
                    //console.log($scope.clientDetail);
                    var clientInfo = angular.copy($scope.clientDetail);
                    $http.post('api/client/updateClientPaymentInfo', { "clientInfo": clientInfo }).
                        success(function (data, status, headers, config) {
                            //console.log("[Update] - Payment Info - SUCCESS");
                            alert("[SUCCESS] Payment Info saved.");
                            $scope.editMode = false;
                            if (confirm("Send Confirm Email to Client?")) {
                                ConfirmService.ConfirmClientInfo(clientInfo._id);
                            }
                        }).
                        error(function (data, status, headers, config) {
                            alert("[ERROR] Save Payment Info Error.");
                        });
                };

                $scope.$on('setEditMode', function (event, editMode) {
                    //console.log("paymentSectionTmpl on setEditMode : "+editMode); // 'Data to send'
                    $scope.editMode = editMode;
                    if ($scope.editMode) {
                        //$scope.submit();
                    }
                });
            },
            templateUrl: templates_url + 'paymentSectionTmpl.html',
            controllerAs: 'paymentSection'
        };
    });

    app.directive('reminderInfoSectionTmpl', function () {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                clientInfo: '=ngModel',
                editMode: '=editMode',
                saveSection: '=saveSection'
            },
            controller: function ($scope, $http, ConfirmService, UserService) {
                $scope.UserService = UserService;
                $scope.submit = function () {
                    $scope.editMode = false;

                    //console.log("submit");
                    //console.log($scope.reminderInfo);
                    var reminderInfo = angular.copy($scope.clientInfo.reminderInfo);
                    //console.log(reminderInfo);
                    $http.post('api/client/updateClientReminderInfo', { "reminderInfo": reminderInfo, "_id": $scope.clientInfo._id }).
                        success(function (data, status, headers, config) {
                            //console.log("[Update] - reminderInfo - SUCCESS");
                            alert("[SUCCESS] reminder Info saved.");
                            $scope.editMode = false;
                            if (confirm("Send Confirm Email to Client?")) {
                                ConfirmService.ConfirmClientInfo($scope.clientInfo._id);
                            }
                        }).
                        error(function (data, status, headers, config) {
                            alert("[ERROR] Save reminder Info Error.");
                        });
                };

                $scope.$on('setEditMode', function (event, editMode) {
                    //console.log("reminderInfoSectionTmpl on setEditMode : "+editMode); // 'Data to send'
                    $scope.editMode = editMode;
                    if ($scope.editMode) {
                        //$scope.submit();
                    }
                });

            },
            templateUrl: templates_url + 'reminderInfoSectionTmpl.html',
            controllerAs: 'reminderSection'
        };
    });

    app.directive('serviceHistorySectionTmpl', function () {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                clientId: '=ngModel',
                readonly: '@readonly'
            },
            controller: function ($scope, $http) {
                $scope.serviceHistory = [];
                $scope.$watch(
                    function ($scope) {
                        return $scope.clientId;
                    },
                    function (newValue) {
                        if ($scope.clientId != null) {
                            loadHistory($scope.clientId);
                        }
                    }
                );
                function loadHistory(clientId) {
                    $http.get('/api/service/history/' + clientId + '?timestamp=' + new Date())
                        .then(function (result) {
                            //console.log(result.data);
                            $scope.serviceHistory = result.data;
                        });
                }
            },
            templateUrl: templates_url + 'serviceHistorySectionTmpl.html',
            controllerAs: 'serviceSection'
        };
    });

    app.directive('commentsSectionTmpl', function ($filter) {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                clientId: '=ngModel'
            },
            controller: function ($scope, $http, UserService) {
                $scope.comments = [];
                $scope.$watch(
                    function ($scope) {

                        return $scope.clientId;
                    },
                    function (newValue) {
                        if ($scope.clientId != null) {
                            loadComments($scope.clientId);
                        }
                    }
                );

                function loadComments(clientId) {
                    $http.get('api/client/getClientComments/' + clientId + '?timestamp=' + new Date())
                        .then(function (result) {
                            //console.log(result.data);
                            $scope.comments = result.data;
                        });
                }

                $scope.newComment = "";
                $scope.userProfile = UserService.getProfile();
                $scope.postComment = function () {

                    //console.log($scope.newComment);
                    var newComment = angular.copy($scope.newComment);
                    $http.post('api/client/postClientComment', { "clientId": $scope.clientId, "content": newComment }).
                        success(function (data, status, headers, config) {
                            //console.log(config);
                            $scope.comments.push(data);
                            alert("[SUCCESS] New comment saved.");
                            //console.log( $scope.comments);
                        }).
                        error(function (data, status, headers, config) {
                            alert("[ERROR] Save new comment Error.");
                        });
                };
                $scope.deleteComment = function (index) {
                    $http.post('api/client/deleteClientComment', { "comment": $scope.comments[index] }).
                        success(function (data, status, headers, config) {
                            //console.log(config);
                            //console.log(data);
                            $scope.comments.splice(index, 1);
                            alert("[SUCCESS]  This comment has been deleted.");
                            //$scope.comments.push(data);
                        }).
                        error(function (data, status, headers, config) {
                            alert("[ERROR]  Enable to delete it comment.")
                        });
                };
            },
            templateUrl: templates_url + 'commentsSectionTmpl.html',
            controllerAs: 'commentsSection'
        };
    });

    app.directive('newClientTmpl', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $http, $location, $anchorScroll, MenuService) {
                var clientDetailModules = [
                    {
                        id: "new-client",
                        name: "New Client",
                        isSubModule: true,
                        changeAlart: true,
                        alartMsg: 'All your non-saved information will lost.'
                    }
                ];

                $scope.hasSubmit = false;
                $http.get('api/client/createClient')
                    .then(function (result) {
                        //console.log(result);
                        $scope.clientDetail = result.data;
                        //console.log($scope.clientDetail);
                        MenuService.pushModulesStack(clientDetailModules);
                    });
                $scope.Save = function () {
                    //$scope.hasSubmit=true;
                    var fullClientInfo = angular.copy($scope.clientDetail);
                    $http.post('api/client/saveFullClientInfo', { "fullClientInfo": fullClientInfo }).
                        success(function (data, status, headers, config) {
                            //console.log("[Update] - Client Info - SUCCESS");
                            alert("[SUCCESS] Client Info saved.");
                            $scope.editMode = false;
                            $scope.hasSubmit = true;
                        }).
                        error(function (data, status, headers, config) {
                            alert("[ERROR] Save Client Info Error.");
                            //console.log("[ERROR] Save Client Info Error.");
                        });

                    $scope.$broadcast('setEditMode', false);

                    MenuService.cancelAlert();
                    //clientDetailModules.changeAlart=false;
                    //$location.hash('top');
                    //$anchorScroll();
                };
                $scope.Reset = function () {
                    $http.post('api/client/getClientInfo/' + $scope.clientDetail._id)
                        .then(function (result) {
                            $scope.clientDetail = result.data
                        });
                };
                $scope.Confirm = function () {
                    alert("Create new client successfully.");
                    //MenuService.changeComponents(0);
                    //$location.hash('top');
                    //$anchorScroll();
                };
            },
            templateUrl: templates_url + 'newClientTmpl.html',
            controllerAs: 'newClientModule'
        };
    });


    // app.directive('moduleNewClient',function() {
    //     return {
    //         restrict: 'E',
    //         controller: function($scope,$http,$location, $anchorScroll,MenuService) {
    //             $scope.hasSubmit = false;
    //             $http.get('api/client/createClient')
    //                 .then(function(result) {
    //                     //console.log(result);
    //                     $scope.clientDetail=result.data;
    //                     //console.log($scope.clientDetail);
    //                 });
    //             $scope.Save=function(){
    //                 //$scope.hasSubmit=true;
    //                 var fullClientInfo = angular.copy($scope.clientDetail);
    //                 $http.post('api/client/saveFullClientInfo', {"fullClientInfo":fullClientInfo}).
    //                     success(function(data, status, headers, config) {
    //                         //console.log("[Update] - Client Info - SUCCESS");
    //                         alert("[SUCCESS] Client Info saved.");
    //                         $scope.editMode=false;
    //                         $scope.hasSubmit=true;
    //                     }).
    //                     error(function(data, status, headers, config) {
    //                         alert("[ERROR] Save Client Info Error.");
    //                         //console.log("[ERROR] Save Client Info Error.");
    //                     });

    //                 $scope.$broadcast('setEditMode',false);
    //                 //$location.hash('top');
    //                 //$anchorScroll();
    //             };
    //             $scope.Reset=function(){
    //                 $http.post('api/client/getClientInfo/'+$scope.clientDetail.clientId)
    //                     .then(function(result) {
    //                         $scope.clientDetail=result.data
    //                     });
    //             };
    //             $scope.Confirm=function(){
    //                 alert("Create new client successfully.");
    //                 //MenuService.changeComponents(0);
    //                 //$location.hash('top');
    //                 //$anchorScroll();
    //             };
    //         },
    //         templateUrl: modules_url + 'createClient.html',
    //         controllerAs: 'newClientModule'
    //     };
    // });

    app.directive('moduleStaffList', function () {
        return {
            restrict: 'E',
            template: '<div>module Staff List</div>',
            scope: {}
        };
    });

    app.directive('moduleInvoiceList', function () {
        return {
            restrict: 'E',
            scope: {},
            controller: function ($scope) {
                $scope.moduleInfo = {
                    curSubModule: "invoice-list"
                    //clientDetail_clientId:null
                };
            },
            templateUrl: modules_url + 'invoiceList.html',
            controllerAs: 'invoiceListModule'
        };
    });

    app.directive('invoiceListTmpl', function () {
        return {
            restrict: 'E',
            controller: function ($scope, $http, $modal, $filter) {
                var invoiceList = null;
                var invoiceHistoryList = null;
                $scope.invoiceListData = [];
                $scope.invoiceHistoryListData = [];
                //$scope.dateStr = "2015-06-18";
                $scope.curDate = new Date();
                $scope.invoiceYM = parseInt($filter('date')($scope.curDate, 'yyyy-MM'));
                //console.log($scope.invoiceYM);

                $scope.dateOffset = 0;

                function updateDateOffset() {
                    $scope.invoiceListData = [];
                    $scope.invoiceHistoryListData = [];
                    //console.log($scope.dateOffset);
                    var date = new Date();
                    date.setYear(date.getFullYear());
                    date.setMonth(date.getMonth() + $scope.dateOffset);
                    $scope.curDate = date;
                    $scope.invoiceYM = $filter('date')($scope.curDate, 'yyyy-MM');
                    //console.log($scope.invoiceYM);
                    loadUnsendInvoiceByMonth();
                    loadInvoiceHistory();
                }

                $scope.next = function () {
                    if ($scope.dateOffset == 0) {
                        return;
                    }
                    $scope.dateOffset++;
                    updateDateOffset();
                };
                $scope.previous = function () {
                    $scope.dateOffset--;
                    updateDateOffset()
                };

                function loadUnsendInvoiceByMonth() {
                    $http.get('/api/invoice/getMonthlyInvoice/' + $filter('date')($scope.curDate, 'yyyy-MM'))
                        .then(function (result) {
                            invoiceList = result.data;
                            //console.log(invoiceList);
                            $scope.invoiceListData = invoiceList;
                        });
                }
                function loadInvoiceHistory() {
                    $http.get('/api/invoice/getInvoiceHistory/' + $scope.invoiceYM)
                        .then(function (result) {
                            invoiceHistoryList = result.data;
                            //console.log(invoiceHistoryList);
                            $scope.invoiceHistoryListData = invoiceHistoryList;
                        });
                }

                updateDateOffset();

                $scope.predicateUp = 'clientName';
                $scope.reverseUp = true;
                $scope.orderUp = function (predicate) {
                    $scope.reverse = ($scope.predicateUp === predicate) ? !$scope.reverseUp : false;
                    $scope.predicateUp = predicate;
                };

                $scope.predicateDown = 'clientName';
                $scope.reverseDown = true;
                $scope.orderDown = function (predicate) {
                    $scope.reverseDown = ($scope.predicateDown === predicate) ? !$scope.reverseDown : false;
                    $scope.predicateDown = predicate;
                };

                $scope.selectedList = [];
                $scope.toggleSelect = function ($index) {
                    $scope.invoiceListData[$index].selected = ($scope.invoiceListData[$index].selected ? false : true);
                    var info = $scope.invoiceListData[$index];

                    //console.log(info);
                    var isSelected = false;
                    if ($scope.selectedList.length > 0) {
                        if ($scope.selectedList[0].clientId != info.clientId) {
                            alert("Please select invoice info of same client.");
                            return;
                        }
                        angular.forEach($scope.selectedList, function (value, key) {
                            if (value.id == info.id) {
                                $scope.selectedList.splice(key, 1);
                                //console.log("Remove ; " + value.id);
                                //console.log($scope.selectedList);
                                isSelected = true;
                            }
                        });

                    }
                    if (isSelected == false) {
                        $scope.selectedList.push(info);
                    }
                    //console.log($scope.selectedList);
                };
                $scope.Reset = function () {
                    angular.forEach($scope.selectedList, function (value, key) {
                        value.selected = false;
                    });
                    $scope.selectedList = [];

                };
                $scope.GenerateInvoice = function () {
                    //console.log("openConfirmEmailPreviewer");
                    if ($scope.selectedList.length <= 0) {
                        alert("Please select a invoice at least.");
                        return;
                    }
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: templates_url + 'invoicePreviewTmpl.html',
                        controller: function ($scope, $modalInstance, items, invoiceYM, invoiceHistoryList) {
                            //console.log(items);
                            $scope.hasSent = false;
                            var clientId = items[0].clientId;
                            $scope.editMode = false;
                            $scope.invoiceHistory = {};
                            $scope.invoiceHistory.clientId = clientId;
                            $scope.invoiceHistory.total = 0;
                            $scope.invoiceHistory.gst = 0;
                            $scope.invoiceHistory.items = [];
                            angular.forEach(items, function (value, key) {
                                var item = {};
                                item.invoiceId = value._id;
                                item.serviceDate = value.serviceDate;
                                item.price = value.price;
                                item.description = 'General office cleaning';
                                $scope.invoiceHistory.items.push(item);
                                $scope.invoiceHistory.total += value.price;
                                $scope.invoiceHistory.gst += (value.price * 0.1);
                            });
                            //console.log( $scope.invoiceHistory);
                            $http.get('api/client/getClientInfo/' + clientId)
                                .then(function (result) {
                                    //console.log(result);
                                    var clientInfo = result.data;
                                    $scope.invoiceHistory.clientId = clientInfo._id;
                                    $scope.invoiceHistory.clientRef = clientInfo.ref;
                                    $scope.invoiceHistory.clientName = clientInfo.name;
                                    $scope.invoiceHistory.tel = clientInfo.tel;
                                    $scope.invoiceHistory.address = clientInfo.address;
                                    $scope.invoiceHistory.email = clientInfo.email;
                                    $scope.invoiceHistory.suburb = clientInfo.suburb;
                                    $scope.invoiceHistory.invoiceTitle = clientInfo.invoiceTitle;
                                    $scope.invoiceHistory.invoiceDate = new Date();
                                    $scope.invoiceHistory.invoiceYM = invoiceYM;
                                });

                            //console.log(items);
                            $scope.Cancel = function () {
                                $modalInstance.close();
                            };

                            $scope.Send = function () {

                                if (!confirm("Send this invoice to client?")) {
                                    return;
                                }
                                //console.log($scope.invoiceHistory);
                                var invoiceHistory = angular.copy($scope.invoiceHistory);
                                $http.post('api/invoice/sendInvoice', { "invoiceHistory": invoiceHistory }).
                                    success(function (data, status, headers, config) {
                                        //console.log(data);
                                        //console.log(config);
                                        //console.log(headers);
                                        alert("[SUCCESS] Invoice sent.");
                                        angular.forEach(items, function (value, key) {
                                            value.status = 1;
                                        });
                                        $modalInstance.close();
                                        invoiceHistoryList.push(invoiceHistory);
                                    }).
                                    error(function (data, status, headers, config) {
                                        //console.log(data);
                                        //console.log(config);
                                        //console.log(headers);
                                        alert("[ERROR] Send Invoice Error.");
                                    });
                            };
                        },
                        resolve: {
                            items: function () {
                                return $scope.selectedList;
                            },
                            invoiceYM: function () {
                                return $scope.invoiceYM;
                            },
                            invoiceHistoryList: function () {
                                return $scope.invoiceHistoryListData;
                            }

                        }
                    });
                };


                $scope.openInvoiceHistoryViewer = function ($index) {
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: templates_url + 'invoicePreviewTmpl.html',
                        controller: function ($scope, $modalInstance, invoiceHistory) {
                            $scope.invoiceHistory = invoiceHistory;
                            //console.log(invoiceHistory);
                            $scope.OK = function () {
                                $modalInstance.close();
                            };
                            $scope.hasSent = true;
                        },
                        resolve: {
                            invoiceHistory: function () {
                                return $scope.invoiceHistoryListData[$index];
                            }
                        }
                    });
                };




            },
            templateUrl: templates_url + 'invoiceListTmpl.html',
            controllerAs: 'invoiceListTmpl'
        };
    });



})();
