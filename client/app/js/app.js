

if (typeof $ === 'undefined') { throw new Error('This application\'s JavaScript requires jQuery'); }



var App = angular.module('pm', ['ngRoute', 'ngAnimate', 'ngStorage', 'ngCookies', 'pascalprecht.translate', 'ui.bootstrap', 'ui.router', 'oc.lazyLoad', 'cfp.loadingBar', 'ui.utils'])
    .run(["$rootScope", "$state", "$stateParams", '$localStorage','$http','$cookies', function ($rootScope, $state,$stateParams, $localStorage,$http,$cookies) {
    // Set reference to access them from any scope
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$storage = $localStorage;

    // Scope Globals
    // ----------------------------------- 
    $rootScope.app = {
      name: 'رئاسة الحكومة',
      description: 'منظومة تسيير أعوان رئاسة الحكومة',
      year: ((new Date()).getFullYear()),
      viewAnimation: 'ng-fadeInRight2',
      layout: {
        isFixed: true,
        isBoxed: false,
        isRTL: true
      },
      sidebar: {
        isCollapsed: false,
        slide: false
      },
      themeId: 7,
      theme: {
        sidebar: 'bg-white br',
        brand:   'bg-primary',
        topbar:  'bg-primary'
      },
      url :{
        db : "http://jemix-pc:5000",
        srv : "http://jemix-pc",
      }
    };



    $rootScope.getSearchData = function(){
      $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
      var req = {
                  method: 'GET',
                  url:  $rootScope.app.url.db + '/user?max_results=2000',
                  cache: false,
                };

      $http(req)
        .success(function(d){
          var data = [];
          for (var i = 0; i < d._items.length; i++) {
            //data[i] = d._items[i].nom + ':' + d._items[i].pren + ':'+ d._items[i].uid + ':' + d._items[i].cin  ;
            data[i] = {'qry' : d._items[i].nom + ':' + d._items[i].pren + ':'+ d._items[i].uid + ':' + d._items[i].cin  ,
                       'nom' : d._items[i].nom + ' ' + d._items[i].pren, 
                       'id' : d._items[i]._id,
                       'uid' : d._items[i].uid,
                     };
          }
          $rootScope.uids = data;
        })
        .error(function(err){
          console.log(err);
        });
    };

    $rootScope.logout = function(){
      $cookies.remove('tk',{'path':'/'});
      $cookies.remove('u',{'path':'/'});
      $state.go("page.login");
    };


    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
        $state.go("page.404");
    });


    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      var requireLogin = toState.data.requireLogin;

      if (requireLogin &&  typeof $cookies.get('tk') !=="undefined" && typeof $cookies.get('u') !== "undefined"  ) {
          $rootScope.User = $cookies.getObject('u');
      }else if(toState.name !=="page.login") {
        event.preventDefault();
        $state.go("page.login");
      }

    });

    //$rootScope.getSearchData();
    

  }
]);

// Application Controller
// ----------------------------------- 

App.controller('AppController',
  ['$rootScope', '$scope','$location', '$state', '$window', '$localStorage', '$timeout', 'toggleStateService', 'colors', 'browser', 'cfpLoadingBar', '$http', 'flotOptions', 'support','$cookies',
  function($rootScope, $scope,$location, $state, $window, $localStorage, $timeout, toggle, colors, browser, cfpLoadingBar, $http, flotOptions, support,$cookies) {
    "use strict";
      

    if(support.touch)
      $('html').addClass('touch');

    

    // Loading bar transition
    // ----------------------------------- 
    
    var latency;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if($('.app-container > section').length) // check if bar container exists
          latency = $timeout(function() {
            cfpLoadingBar.start();
          }, 0); // sets a latency Threshold
    });


    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        event.targetScope.$watch("$viewContentLoaded", function () {
          $timeout.cancel(latency);
          cfpLoadingBar.complete();
        });
    });

    
    // State Events Hooks
    // ----------------------------------- 

    // Hook not found
    $rootScope.$on('$stateNotFound',
      function(event, unfoundState, fromState, fromParams) {
      });

    // Hook success
    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
        $window.scrollTo(0, 0);
      });


    // Create your own per page title here
    $rootScope.pageTitle = function() {
      return $rootScope.app.name + ' - ' + $rootScope.app.description;
    };

    // Restore layout settings
    // ----------------------------------- 

    if( angular.isDefined($localStorage.settings) )
      $rootScope.app = $localStorage.settings;
    else
      $localStorage.settings = $rootScope.app;

    $rootScope.$watch("app.layout", function () {
      $localStorage.settings = $rootScope.app;
    }, true);

    
    // Allows to use branding color with interpolation
    // {{ colorByName('primary') }}
    $scope.colorByName = colors.byName;

    // Restore application classes state
    toggle.restoreState( $(document.body) );

    $rootScope.cancel = function($event) {
      $event.stopPropagation();
    };

}]);

/**=========================================================
 * Module: config.js
 * App routes and resources configuration
 =========================================================*/

App.config(['$locationProvider','$routeProvider','$stateProvider','$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'appDependencies',
    function ($locationProvider,$routeProvider,$stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, appDependencies) {
      'use strict';

      App.controller = $controllerProvider.register;
      App.directive  = $compileProvider.directive;
      App.filter     = $filterProvider.register;
      App.factory    = $provide.factory;
      App.service    = $provide.service;
      App.constant   = $provide.constant;
      App.value      = $provide.value;


      $locationProvider.html5Mode(true);

      // LAZY LOAD MODULES
      // ----------------------------------- 

      $ocLazyLoadProvider.config({
        debug: false,
        events: true,
        modules: appDependencies.modules
      });


      // default route to dashboard
      $urlRouterProvider.otherwise('/app/dashboard');

      if(window.history && window.history.pushState){
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        });
      }

      // 
      // App Routes
      // -----------------------------------   
      $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
            data: {
              requireLogin: true 
            },
            templateUrl: basepath('app.html'),
            controller: 'AppController',
            resolve: requireDeps('icons', 'screenfull', 'sparklines', 'slimscroll', 'toaster', 'ui.knob', 'animate')
        })
        .state('app.dashboard', {
            url: '/dashboard',
            templateUrl: basepath('dashboard.html'),
            resolve: requireDeps('flot-chart','flot-chart-plugins')
        })
        .state('app.documentation', {
            url: '/documentation',
            templateUrl: basepath('documentation.html'),
            resolve: requireDeps('flatdoc')
        })
        .state('app.icons-feather', {
            url: '/icons-feather',
            templateUrl: basepath('icons-feather.html')
        })
        .state('app.icons-fa', {
            url: '/icons-fa',
            templateUrl: basepath('icons-fa.html')
        })
        .state('app.icons-weather', {
            url: '/icons-weather',
            templateUrl: basepath('icons-weather.html')
        })
        .state('app.icons-climacon', {
            url: '/icons-climacon',
            templateUrl: basepath('icons-climacon.html')
        })
        .state('app.table-ngtable', {
            url: '/table-ngtable',
            templateUrl: basepath('table-ngtable.html'),
            resolve: requireDeps('ngTable', 'ngTableExport')
        })

        // Mailbox
        // ----------------------------------- 
        .state('app.mailbox', {
            url: '/mailbox',
            abstract: true,
            templateUrl: basepath('mailbox.html'),
            resolve: requireDeps('moment')
        })
        .state('app.mailbox.folder', {
            url: '/folder',
            abstract: true
        })
        .state('app.mailbox.folder.list', {
            url: '/:folder',
            views: {
              'container@app.mailbox': {
                templateUrl: basepath('mailbox-folder.html')
              }
            }
        })
        .state('app.mailbox.folder.list.view', {
            url: '/:id',
            views: {
              'mails@app.mailbox.folder.list': {
                templateUrl: basepath('mailbox-view-mail.html')
              }
            },
            resolve: requireDeps('wysiwyg')
        })
        .state('app.mailbox.compose', {
            url: '/compose',
            views: {
              'container@app.mailbox': {
                templateUrl: basepath('mailbox-compose.html')
              }
            },
            resolve: requireDeps('wysiwyg')
        })
        // 
        // Single Page Routes
        // ----------------------------------- 
        .state('page', {
            url: '/page',
            abstract: true,
            templateUrl: 'app/pages/page.html',
            data: {
              requireLogin: false 
            },
        })
        .state('page.login', {
            url: '/login',
            templateUrl: 'app/pages/login.html',
            controller: 'Authentificate',
            resolve: requireDeps('icons','animate')
        })
        .state('page.register', {
            url: '/register',
            templateUrl: 'app/pages/register.html'
        })
        .state('page.recover', {
            url: '/recover',
            templateUrl: 'app/pages/recover.html'
        })
        .state('page.lock', {
            url: '/lock',
            templateUrl: 'app/pages/lock.html'
        })
        .state('page.404', {
            url: '/404',
            templateUrl: 'app/pages/404.html'
        })


        // 
        // CUSTOM RESOLVE FUNCTION
        //   Add your own resolve properties
        //   following this object extend
        //   method
        // ----------------------------------- 
        // .state('app.yourRouteState', {
        //   url: '/route_url',
        //   templateUrl: 'your_template.html',
        //   controller: 'yourController',
        //   resolve: angular.extend(
        //     requireDeps(...), {
        //     // YOUR CUSTOM RESOLVES HERE
        //     }
        //   )
        // })

        // -------------my route-------------- 
        .state('app.adduser', {
            url: '/adduser',
            controller: 'USR',
            templateUrl: basepath('USR/adduser.html'),
        })

        .state('app.updateuser',{
          url :'/updateuser',
          controller: 'USR',
          templateUrl : basepath ('USR/updateuser.html'),
        })


        .state('app.searchdoc',{
          url :'/getdoc',
          controller: 'DOC',
          templateUrl : basepath('DOC/doc.html')
        })
        

        .state('app.editdoc',{
          url :'/editdoc/:doc',
          controller: 'DOC',
          templateUrl : basepath ('DOC/editdoc.html')
        })

        .state('app.adddoc', {
            url: '/adddoc',
            controller: 'DOC',
            templateUrl: basepath('DOC/adddoc.html'),

        })

        .state('app.addcert', {
            url: '/addcert',
            controller: 'CERT',
            templateUrl: basepath('CERT/addcert.html'),

        })

        .state('app.searchcertif',{
          url :'/getcertif',
          controller: 'CERT',
          templateUrl : basepath('CERT/cert.html')
        })
        

        .state('app.editcertif',{
          url :'/editcert/:cert/:nb',
          controller: 'CERT',
          templateUrl : basepath ('CERT/editcert.html')
        })

        .state('app.adstate',{
          url : '/setadstate',
          controller: 'PINALITY',
          templateUrl : basepath ('STATE/adstate.html'),
          resolve: requireDeps('moment')
        })

        .state('app.searchstate',{
          url :'/getstate',
          controller: 'PINALITY',
          templateUrl : basepath('STATE/state.html')
        })
        

        .state('app.editstate',{
          url :'/editstate/:state/:nb',
          controller: 'PINALITY',
          templateUrl : basepath ('STATE/editstate.html')
        })


        .state('app.delday',{
          url : '/delday',
          controller: 'PINALITY',
          templateUrl : basepath ('PINALITY/delday.html'),
          resolve: requireDeps('moment')
        })


        .state('app.addgrade',{
          url : '/addgrade',
          controller: 'PINALITY',
          templateUrl : basepath ('GRADE/addgrade.html'),
          resolve: requireDeps('moment')
        })

        .state('app.searchgrad',{
          url :'/getgrad',
          controller: 'PINALITY',
          templateUrl : basepath('GRADE/grad.html'),
          resolve: requireDeps('moment')
        })
        

        .state('app.editgrad',{
          url :'/editgrad/:grad/:nb',
          controller: 'PINALITY',
          templateUrl : basepath ('GRADE/editgrad.html'),
          resolve: requireDeps('moment')
        })

        .state('app.titulaire',{
          url : '/titulaire',
          controller: 'PINALITY',
          templateUrl : basepath ('USR/titulaire.html'),
          resolve: requireDeps('moment')
        })

        .state('doc', {
            url: '/doc',
            abstract: true,
            templateUrl: basepath ('USR/d.html'),
            data: {
              requireLogin: true 
            },
        })

        .state('doc.trav',{
          url : '/trav/:id',
          controller : 'GenerateDocs',
          templateUrl : basepath ('USR/travail.html')
        })

        .state('doc.note',{
          url : '/note/:id',
          controller : 'GenerateDocs',
          templateUrl : basepath ('USR/note.html')
        })

        .state('doc.prim',{
          url : '/prim/:id/:nb',
          controller : 'GenerateDocs',
          templateUrl : basepath ('USR/prim.html')
        })

        .state('doc.khad',{
          url : '/khad/:id',
          controller : 'GenerateDocs',
          templateUrl : basepath ('USR/trav.html'),
          resolve: requireDeps('moment')
        })



        //wsolt l houni

        .state('app.user', {
            url: '/user/:id',
            controller: 'Users',
            templateUrl: basepath('users.html'),

        })

        

        .state('app.edu', {
            url: '/edu',
            templateUrl: basepath('edu.html'),

        })


        

        .state('app.family', {
            url: '/setfamily',
            templateUrl: basepath('setfamily.html'),

        })

        


        .state('app.addfct',{
          url : '/addfct',
          templateUrl : basepath ('addfct.html'),
        })

        

        .state('app.addaff',{
          url : '/addaff',
          templateUrl : basepath ('addaff.html'),
        })

        .state('app.addech',{
          url : '/addech',
          templateUrl : basepath ('addech.html'),
        })

        


        

        

        .state('app.searchech',{
          url :'/getech',
          templateUrl : basepath('ech.html')
        })
        

        .state('app.editech',{
          url :'/editech/:ech/:nb',
          templateUrl : basepath ('editech.html')
        })


        .state('app.searchfct',{
          url :'/getfct',
          templateUrl : basepath('fct.html')
        })
        

        .state('app.editfct',{
          url :'/editfct/:fct/:nb',
          templateUrl : basepath ('editfct.html')
        })


        


        

        .state('app.searchaff',{
          url :'/getaff',
          templateUrl : basepath('af.html')
        })
        

        .state('app.editaff',{
          url :'/editaff/:aff/:nb',
          templateUrl : basepath ('editaff.html')
        })
      
        .state('app.FCT',{
          url :'/FCT',
          templateUrl : basepath ('F-C-T.html')
        })

        .state('app.eFCT',{
          url :'/FCT/:fct/:id/:etag',
          templateUrl : basepath ('F-C-T.html')
        })

        .state('app.GRADE',{
          url :'/GRADE',
          templateUrl : basepath ('G-R-A-D-E.html')
        })

        .state('app.eGRADE',{
          url :'/GRADE/:grade/:id/:etag',
          templateUrl : basepath ('G-R-A-D-E.html')
        })

        .state('app.search',{
          url : '/search',
          controller: 'SearchSpec',
          templateUrl : basepath ('search.html'),
        })

        .state('app.searchsp',{
          url : '/searchsp',
          controller: 'SearchSpec',
          templateUrl : basepath ('searchsp.html')
        })

        .state('app.search-fct',{
          url : '/search-fct',
          controller: 'SearchSpec',
          templateUrl : basepath ('search-fct.html'),
          resolve: requireDeps('ngTableExport')
        })

        .state('app.search-grade',{
          url : '/search-grade',
          controller: 'SearchSpec',
          templateUrl : basepath ('search-grade.html'),
          resolve: requireDeps('ngTableExport')
        })


        

        



        

        ;


        // Change here your views base path
        function basepath(uri) {
          return 'app/views/' + uri;
        }

        // Generates a resolve object by passing script names
        // previously configured in constant.appDependencies
        // Also accept functions that returns a promise
        function requireDeps() {
          var _args = arguments;
          return {
            deps: ['$ocLazyLoad','$q', function ($ocLL, $q) {
              // Creates a promise chain for each argument
              var promise = $q.when(1); // empty promise
              for(var i=0, len=_args.length; i < len; i ++){
                promise = addThen(_args[i]);
              }
              return promise;

              // creates promise to chain dynamically
              function addThen(_arg) {
                // also support a function that returns a promise
                if(typeof _arg == 'function')
                    return promise.then(_arg);
                else
                    return promise.then(function() {
                      // if is a module, pass the name. If not, pass the array
                      var whatToLoad = getRequired(_arg);
                      // simple error check
                      if(!whatToLoad) return $.error('Route resolve: Bad resource name [' + _arg + ']');
                      // finally, return a promise
                      return $ocLL.load( whatToLoad );
                    });
              }
              // check and returns required data
              // analyze module items with the form [name: '', files: []]
              // and also simple array of script files (for not angular js)
              function getRequired(name) {
                if (appDependencies.modules)
                    for(var m in appDependencies.modules)
                        if(appDependencies.modules[m].name && appDependencies.modules[m].name === name)
                            return appDependencies.modules[m];
                return appDependencies.scripts && appDependencies.scripts[name];
              }

            }]};
        }


}]).config(['$tooltipProvider', function ($tooltipProvider) {

    $tooltipProvider.options({appendToBody: true});

}]).config(['$translateProvider', function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix : 'app/langs/',
        suffix : '.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useLocalStorage();

}]).config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
    cfpLoadingBarProvider.parentSelector = '.app-container > section';
}]);

/**=========================================================
 * Module: constants.js
 * Define constants to inject across the application
 =========================================================*/

App
  .constant('appDependencies', {
    // jQuery based and standalone scripts
    scripts: {
      'animate':            ['app/vendor//animate.css/animate.min.css'],
      'icons':              ['app/vendor/fontawesome/css/font-awesome.min.css',
                             'app/vendor/weather-icons/css/weather-icons.min.css',
                             'app/vendor/feather/webfont/feather-webfont/feather.css'],
      'sparklines':         ['app/js/sparklines/jquery.sparkline.min.js'],
      'slider':             ['app/vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js',
                             'app/vendor/seiyria-bootstrap-slider/dist/css/bootstrap-slider.min.css'],
      'wysiwyg':            ['app/vendor/bootstrap-wysiwyg/bootstrap-wysiwyg.js',
                             'app/vendor/bootstrap-wysiwyg/external/jquery.hotkeys.js'],
      'slimscroll':         ['app/vendor/slimscroll/jquery.slimscroll.min.js'],
      'screenfull':         ['app/vendor/screenfull/dist/screenfull.min.js'],
      'vector-map':         ['app/vendor/ika.jvectormap/jquery-jvectormap-1.2.2.min.js',
                             'app/vendor/ika.jvectormap/jquery-jvectormap-1.2.2.css'],
      'vector-map-maps':    ['app/vendor/ika.jvectormap/jquery-jvectormap-world-mill-en.js',
                             'app/vendor/ika.jvectormap/jquery-jvectormap-us-mill-en.js'],
      'loadGoogleMapsJS':   ['app/js/gmap/load-google-maps.js'],
      'flot-chart':         ['app/vendor/Flot/jquery.flot.js'],
      'flot-chart-plugins': ['app/vendor/flot.tooltip/js/jquery.flot.tooltip.min.js',
                             'app/vendor/Flot/jquery.flot.resize.js',
                             'app/vendor/Flot/jquery.flot.pie.js',
                             'app/vendor/Flot/jquery.flot.time.js',
                             'app/vendor/Flot/jquery.flot.categories.js',
                             'app/vendor/flot-spline/js/jquery.flot.spline.min.js'],
      'jquery-ui':          ['app/vendor/jquery-ui/jquery-ui.min.js',
                             'app/vendor/jqueryui-touch-punch/jquery.ui.touch-punch.min.js'],
      'moment' :            ['app/vendor/moment/min/moment-with-locales.min.js'],
      'inputmask':          ['app/vendor/jquery.inputmask/dist/jquery.inputmask.bundle.min.js'],
      'flatdoc':            ['app/vendor/flatdoc/flatdoc.js'],
      'gcal':               ['app/vendor/fullcalendar/dist/gcal.js']
    },
    // Angular based script (use the right module name)
    modules: [
      {name: 'toaster',           files: ['app/vendor/angularjs-toaster/toaster.js',
                                          'app/vendor/angularjs-toaster/toaster.css']},
      {name: 'ui.knob',           files: ['app/vendor/angular-knob/src/angular-knob.js',
                                          'app/vendor/jquery-knob/dist/jquery.knob.min.js']},
      {name: 'angularFileUpload', files: ['app/vendor/angular-file-upload/dist/angular-file-upload.min.js']},
      {name: 'angular-chosen',    files: ['app/vendor/chosen_v1.2.0/chosen.jquery.min.js',
                                          'app/vendor/chosen_v1.2.0/chosen.min.css',
                                          'app/vendor/angular-chosen/angular-chosen.js']},
      {name: 'ngTable',           files: ['app/vendor/ng-table/ng-table.min.js',
                                          'app/vendor/ng-table/ng-table.min.css']},
      {name: 'ngTableExport',     files: ['app/vendor/ng-table-export/ng-table-to-csv.min.js']},
      {name: 'AngularGM',         files: ['app/vendor/AngularGM/angular-gm.min.js']},
      {name: 'ui.calendar',       files: ['app/vendor/fullcalendar/dist/fullcalendar.min.js',
                                          'app/vendor/fullcalendar/dist/fullcalendar.css',
                                          'app/vendor/angular-ui-calendar/src/calendar.js']}
    ]

  })
  // Same colors as defined in the css
  .constant('appColors', {
    'primary':                '#43a8eb',
    'success':                '#88bf57',
    'info':                   '#8293b9',
    'warning':                '#fdaf40',
    'danger':                 '#eb615f',
    'inverse':                '#363C47',
    'turquoise':              '#2FC8A6',
    'pink':                   '#f963bc',
    'purple':                 '#c29eff',
    'orange':                 '#F57035',
    'gray-darker':            '#2b3d51',
    'gray-dark':              '#515d6e',
    'gray':                   '#A0AAB2',
    'gray-light':             '#e6e9ee',
    'gray-lighter':           '#f4f5f5'
  })
  // Same MQ as defined in the css
  .constant('appMediaquery', {
    'desktopLG':             1200,
    'desktop':                992,
    'tablet':                 768,
    'mobile':                 480
  })
;
/**=========================================================
 * Module: CalendarController.js
 * This script handle the calendar demo and events creation
 =========================================================*/

App.controller('CalendarController', ["$scope", "colors", "$http", "$timeout", "touchDrag", function ($scope, colors, $http, $timeout, touchDrag) {
  'use strict';

  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  $scope.calEventsPers = {
      id: 0,
      visible: true,
      className: ['fc-id-0'],
      events: [
        {id: 324, title: 'All Day Event',    start: new Date(y, m, 1) },
        {         title: 'Long Event',       start: new Date(y, m, d - 5),        end: new Date(y, m, d - 2)},
        {id: 999, title: 'Repeating Event',  start: new Date(y, m, d - 3, 16, 0),                                     allDay: false},
        {id: 999, title: 'Repeating Event',  start: new Date(y, m, d + 4, 16, 0),                                     allDay: false},
        {         title: 'Birthday Party',   start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false},
        {         title: 'Click for Google', start: new Date(y, m, 28),           end: new Date(y, m, 29),            url: 'http://google.com/'}
      ]
    };
  
  $scope.googleCalendar = {
      id: 1,
      visible: true,
      color: colors.byName('warning'),
      textColor: '#fff',
      url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
      className: ['fc-id-1', 'gcal-event'],
      currentTimezone: 'America/Chicago'
    };

  // event source that pulls from google.com 
  $scope.eventSources = [ $scope.calEventsPers, $scope.googleCalendar ];


  $http.get('server/calendar/external-calendar.json').success(function(data) {
  
    var calEventsExt = {
      id:        2,
      visible:   true,
      color:     colors.byName('purple'),
      textColor: '#fff',
      className: ['fc-id-2'],
      events:    []
    };
  
    // -----------
    // override dates just for demo
    for(var i = 0; i < data.length; i++) {
        data[i].start = new Date(y, m, d+i, 12, 0);
        data[i].end   = new Date(y, m, d+i, 14, 0);
    }
    // -----------

    calEventsExt.events = angular.copy(data);

    $scope.eventSources.push(calEventsExt);

  });

  
  /* alert on eventClick */
  $scope.alertOnEventClick = function( event, allDay, jsEvent, view ){
      console.log(event.title + ' was clicked ');
  };
  /* alert on Drop */
  $scope.alertOnDrop = function(event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view){
     console.log('Event Droped to make dayDelta ' + dayDelta);
  };
  /* alert on Resize */
  $scope.alertOnResize = function(event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ){
     console.log('Event Resized to make dayDelta ' + minuteDelta);
  };

  /* add custom event*/
  $scope.addEvent = function(newEvent) {
    if(newEvent) {
      $scope.calEventsPers.events.push(newEvent);
    }
  };

  /* remove event */
  $scope.remove = function(index) {
    $scope.calEventsPers.events.splice(index,1);
  };
  /* Change View */
  $scope.changeView = function(view,calendar) {
    $scope.myCalendar.fullCalendar('changeView',view);
  };
  /* Change View */
  $scope.renderCalender = function(calendar) {
    $scope.myCalendar.fullCalendar('render');
  };
  
  $scope.toggleEventSource = function(id) {
    $('.fc-id-'+id).toggleClass('hidden');
   };

  /* config object */
  $scope.uiConfig = {
    calendar:{
      googleCalendarApiKey: '<YOUR API KEY>',
      height: 450,
      editable: true,
      header:{
        left: 'month,basicWeek,basicDay',
        center: 'title',
        right: 'prev,next today'
      },
      eventClick:  $scope.alertOnEventClick,
      eventDrop:   $scope.alertOnDrop,
      eventResize: $scope.alertOnResize,
      // Select options
      selectable: true,
      selectHelper: true,
      unselectAuto: true,
      select: function(start, end) {
        var title = prompt('Event Title:');
        var eventData;
        if (title) {
          eventData = {
            title: title,
            start: start.format(),
            end: end.format()
          };
          $scope.addEvent(eventData);
        }
        // $scope.myCalendar.fullCalendar( 'unselect' );
      },
      viewRender: function( view, element ) {
        touchDrag.addTo(element[0]);
      }
    }
  };

  // Language support
  // ----------------------------------- 
  $scope.changeTo = 'Español';
  $scope.changeLang = function() {
    if($scope.changeTo === 'Español'){
      $scope.uiConfig.calendar.dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      $scope.uiConfig.calendar.dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      $scope.changeTo= 'English';
    } else {
      $scope.uiConfig.calendar.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      $scope.uiConfig.calendar.dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      $scope.changeTo = 'Español';
    }
  };

}]);

/**=========================================================
 * Module: MailboxController.js
 * Mailbox APP controllers
 =========================================================*/

App.controller('MailboxController', ["$rootScope", "$scope", "$state", function($rootScope, $scope, $state) {
  'use strict';
  // For mail compose
  $scope.mail = {
    cc: false,
    bcc: false
  };

  // Mailbox editr initial content
  $scope.content = "<p>Type something..</p>";

  
  // Manage collapsed folders nav
  $scope.mailboxMenuCollapsed = true;
  $scope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams){
      closeFolderNav();
    });

  $scope.$on('closeFolderNav', closeFolderNav);

  function closeFolderNav() {
    $scope.mailboxMenuCollapsed = true;
  }

  $scope.mailboxFolders = [
    { name: 'inbox',  count: 3,  icon: 'fa-inbox' },
    { name: 'sent',   count: 8,  icon: 'fa-paper-plane-o' },
    { name: 'draft',  count: 1,  icon: 'fa-edit' },
    { name: 'trash',  count: 12, icon: 'fa-trash-o' }
  ];

  // Define mails at parent scope to use as cache for mail request
  $scope.mails = [];

}]);

App.controller('MailboxFolderController', ["$scope", "$stateParams", "$state", "appMediaquery", "$window", "$timeout", function($scope, $stateParams, $state, appMediaquery, $window, $timeout) {

  var $win = angular.element($window);
  
  $scope.mailPanelOpened = false;

  // Load mails in folder
  // ----------------------------------- 

  // store the current folder
  $scope.folder = $stateParams.folder || 'inbox';
  
  // If folder wasn't loaded yet, request mails using api
  if( ! $scope.mails[$scope.folder] ) {
    
    // Replace this code with a request to your mails API
    // It expects to receive the following object format

    // only populate inbox for demo
    $scope.mails['inbox'] = [
      {
        id: 0,
        subject: 'Morbi dapibus sollicitudin',
        excerpt: 'Nunc et magna in metus pharetra ultricies ac sit amet justo. ',
        time: '09:30 am',
        from: {
          name: 'Sass Rose',
          email: 'mail@example.com',
          avatar: 'app/img/user/01.jpg'
        },
        unread: false
      }
    ];
    // Generate some random user mails
    var azarnames = ['Floyd Kennedy','Brent Woods', 'June Simpson', 'Wanda Ward', 'Travis Hunt'];
    var azarnsubj = ['Nam sodales sollicitudin adipiscing. ','Cras fermentum posuere quam, sed iaculis justo rutrum at. ', 'Vivamus tempus vehicula facilisis. '];
    for(var i =0; i < 10; i++) {
      var m = angular.copy($scope.mails['inbox'][0]);
      m.from.name = azarnames[(Math.floor((Math.random() * (azarnames.length) )))];
      m.from.email = m.from.name.toLowerCase().replace(' ', '') + '@example.com';
      m.subject = azarnsubj[(Math.floor((Math.random() * (azarnsubj.length) )))];
      m.from.avatar = 'app/img/user/0'+(Math.floor((Math.random() * 8))+1)+'.jpg';
      m.time = moment().subtract(i,'hours').format('hh:mm a');
      m.id = i + 1;
      $scope.mails['inbox'].push(m);
    }
    $scope.mails['inbox'][0].unread=true;
    $scope.mails['inbox'][1].unread=true;
    $scope.mails['inbox'][2].unread=true;
    // end random mail generation
  }

  // requested folder mails to display in the view
  $scope.mailList = $scope.mails[$scope.folder];


  // Show and hide mail content
  // ----------------------------------- 
  $scope.openMail = function(id) {
    // toggle mail open state
    toggleMailPanel(true);
    // load the mail into the view
    $state.go('app.mailbox.folder.list.view', {id: id});
    // close the folder (when collapsed)
    $scope.$emit('closeFolderNav');
    // mark mail as read
    $timeout(function() {
      $scope.mailList[id].unread = false;
    }, 1000);
  };

  $scope.backToFolder = function() {
    toggleMailPanel(false);
    $scope.$emit('closeFolderNav');
  };

  // enable the open state to slide the mails panel 
  // when on table devices and below
  function toggleMailPanel(state) {
    if ( $win.width() < appMediaquery['tablet'] )
      $scope.mailPanelOpened = state;
  }

}]);

App.controller('MailboxViewController', ["$scope", "$stateParams", "$state", function($scope, $stateParams, $state) {

  // move the current viewing mail data to the inner view scope
  $scope.viewMail = $scope.mailList[$stateParams.id];

}]);
 

/**=========================================================
 * Module: PortletsController.js
 * Controller for the Tasks APP 
 =========================================================*/

App.controller("TasksController", TasksController);

function TasksController($scope, $filter, $modal) {
  'use strict';
  var vm = this;

  vm.taskEdition = false;

  vm.tasksList = [
    {
      task: {title: "Solve issue #5487", description: "Praesent ultrices purus eget velit aliquet dictum. "},
      complete: true
    },
    {
      task: {title: "Commit changes to branch future-dev.", description: ""},
      complete: false
    }
    ];
  

  vm.addTask = function(theTask) {
    
    if( theTask.title === "" ) return;
    if( !theTask.description ) theTask.description = "";
    
    if( vm.taskEdition ) {
      vm.taskEdition = false;
    }
    else {
      vm.tasksList.push({task: theTask, complete: false});
    }
  };
  
  vm.editTask = function(index, $event) {
  
    $event.stopPropagation();
    vm.modalOpen(vm.tasksList[index].task);
    vm.taskEdition = true;
  };

  vm.removeTask = function(index, $event) {
    vm.tasksList.splice(index, 1);
  };
  
  vm.clearAllTasks = function() {
    vm.tasksList = [];
  };

  vm.totalTasksCompleted = function() {
    return $filter("filter")(vm.tasksList, function(item){
      return item.complete;
    }).length;
  };

  vm.totalTasksPending = function() {
    return $filter("filter")(vm.tasksList, function(item){
      return !item.complete;
    }).length;
  };


  // modal Controller
  // ----------------------------------- 

  vm.modalOpen = function (editTask) {
    var modalInstance = $modal.open({
      templateUrl: '/myModalContent.html',
      controller: ModalInstanceCtrl,
      scope: $scope,
      resolve: {
        editTask: function() {
          return editTask;
        }
      }
    });

    modalInstance.result.then(function () {
      // Modal dismissed with OK status
    }, function () {
      // Modal dismissed with Cancel status'
    });

  };

  // Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $modal service used above.

  var ModalInstanceCtrl = function ($scope, $modalInstance, editTask) {

    $scope.theTask = editTask || {};

    $scope.modalAddTask = function (task) {
      vm.addTask(task);
      $modalInstance.close('closed');
    };

    $scope.modalCancel = function () {
      vm.taskEdition = false;
      $modalInstance.dismiss('cancel');
    };

    $scope.actionText = function() {
      return vm.taskEdition ? 'Edit Task' : 'Add Task';
    };
  };
  ModalInstanceCtrl.$inject = ["$scope", "$modalInstance", "editTask"];

}
TasksController.$inject = ["$scope", "$filter", "$modal"];

/**=========================================================
 * Module: ChartsController.js
 * Initializes the flot chart plugin and attaches the 
 * plugin to elements according to its type
 =========================================================*/

App.controller('ChartsController', ['$scope', '$http', '$timeout', 'flotOptions', 'colors', function($scope, $http, $timeout, flotOptions, colors) {
  'use strict';

  // An array of boolean to tell the directive which series we want to show
  $scope.areaSeries = [true, true, true];
  $scope.chartAreaFlotChart       = flotOptions['area'];
  // The array should contain the same number of element as series
  $scope.areaSplineSeries = [true, true];
  $scope.chartSplineFlotChart     = flotOptions['spline'];
  // Create more array to target the sate of different series (lines, point, splines, etc)
  $scope.lineSeriesPoints = [true, true, true];
  $scope.lineSeriesLines  = [true, true, true];
  $scope.chartLineFlotChart       = angular.extend({}, flotOptions['line'], { yaxis: { max: 60 }});

  // Set directly our global configuration
  $scope.chartBarFlotChart        = flotOptions['bar'];
  $scope.chartBarStackedFlotChart = flotOptions['bar-stacked'];
  $scope.chartPieFlotChart        = flotOptions['pie'];
  $scope.chartDonutFlotChart      = flotOptions['donut'];

  $scope.$on('plotReady', function(e, plot){
    // You can do here:
    //  plot                           Flot chart object
    //  plot.getData()                 REturns the dataset processed by the plugin
    //  plot.getPlaceholder()          The inner div where the chart is placed
    //  plot.getPlaceholder().parent() The <flot> element
  
  });

  // KNOB Charts
  // ----------------------------------- 

  $scope.knobLoaderData1 = 100;
  $scope.knobLoaderOptions1 = {
      width: '100%', // responsive
      displayInput: true,
      fgColor: colors.byName('primary')
    };

  $scope.knobLoaderData2 = 50;
  $scope.knobLoaderOptions2 = {
      width: '80%', // responsive
      displayInput: true,
      fgColor: colors.byName('success'),
      readOnly : true,
      lineCap : 'round'
    };

  $scope.knobLoaderData3 = 37;
  $scope.knobLoaderOptions3 = {
      width: '50%', // responsive
      displayInput: true,
      fgColor: colors.byName('purple'),
      displayPrevious : true,
      thickness : 0.1
    };

  $scope.knobLoaderData4 = 60;
  $scope.knobLoaderOptions4 = {
      width: '20%', // responsive
      displayInput: true,
      fgColor: colors.byName('danger'),
      bgColor: colors.byName('warning')
    };


  // Setup realtime update
  // ----------------------------------- 

  $scope.realTimeChartOpts = angular.extend({}, flotOptions['default'], {
    series: {
      lines: { show: true, fill: true, fillColor:  { colors: ["#00b4ff", "#1d93d9"] } },
      shadowSize: 0 // Drawing is faster without shadows
    },
    yaxis: {
      min: 0,
      max: 130
    },
    xaxis: {
      show: false
    },
    colors: ["#1d93d9"]
  });

  $scope.realTimeChartUpdateInterval = 30;

  var data = [],
      totalPoints = 300;
    
  update();

  function getRandomData() {
    if (data.length > 0)
      data = data.slice(1);
    // Do a random walk
    while (data.length < totalPoints) {
      var prev = data.length > 0 ? data[data.length - 1] : 50,
        y = prev + Math.random() * 10 - 5;
      if (y < 0) {
        y = 0;
      } else if (y > 100) {
        y = 100;
      }
      data.push(y);
    }
    // Zip the generated y values with the x values
    var res = [];
    for (var i = 0; i < data.length; ++i) {
      res.push([i, data[i]]);
    }
    return [res];
  }
  function update() {
    $scope.realTimeChartData = getRandomData();
    $timeout(update, $scope.realTimeChartUpdateInterval);
  }


}]);
/**=========================================================
 * Module: FlotChartDirective.js
 * Initializes the Flot chart plugin and handles data refresh
 =========================================================*/

App.directive('flot', ['$http', '$timeout', function($http, $timeout) {
  'use strict';
  return {
    restrict: 'EA',
    template: '<div></div>',
    scope: {
      dataset: '=?',
      options: '=',
      series: '=',
      callback: '=',
      src: '='
    },
    link: linkFunction
  };
  
  function linkFunction(scope, element, attributes) {
    var height, plot, plotArea, width;
    var heightDefault = 220;

    plot = null;

    width = attributes.width || '100%';
    height = attributes.height || heightDefault;

    plotArea = $(element.children()[0]);
    plotArea.css({
      width: width,
      height: height
    });

    function init() {
      var plotObj;
      if(!scope.dataset || !scope.options) return;
      plotObj = $.plot(plotArea, scope.dataset, scope.options);
      scope.$emit('plotReady', plotObj);
      if (scope.callback) {
        scope.callback(plotObj, scope);
      }

      return plotObj;
    }

    function onDatasetChanged(dataset) {
      if (plot) {
        plot.setData(dataset);
        plot.setupGrid();
        return plot.draw();
      } else {
        plot = init();
        onSerieToggled(scope.series);
        return plot;
      }
    }
    scope.$watchCollection('dataset', onDatasetChanged, true);

    function onSerieToggled (series) {
      if( !plot || !series ) return;
      var someData = plot.getData();
      for(var sName in series) {
        angular.forEach(series[sName], toggleFor(sName));
      }
      
      plot.setData(someData);
      plot.draw();
      
      function toggleFor(sName) {
        return function (s, i){
          if(someData[i] && someData[i][sName])
            someData[i][sName].show = s;
        };
      }
    }
    scope.$watch('series', onSerieToggled, true);
    
    function onSrcChanged(src) {

      if( src ) {

        $http.get(src)
          .success(function (data) {

            $timeout(function(){
              scope.dataset = data;
            });

        }).error(function(){
          $.error('Flot chart: Bad request.');
        });
        
      }
    }
    scope.$watch('src', onSrcChanged);
  }

}]);

/**=========================================================
 * Module: FlotChartOptionsServices.js
 * Define here the common options for all types of charts
 * and access theme from your controller
 =========================================================*/
App.service('flotOptions', ['$rootScope', function($rootScope) {
  'use strict';
  var flotOptions = {};

  flotOptions['default'] = {
    grid: {
      hoverable: true,
      clickable: true,
      borderWidth: 0,
      color: '#8394a9'
    },
    tooltip: true,
    tooltipOpts: {
      content: '%x : %y'
    },
    xaxis: {
      tickColor: '#f1f2f3',
      mode: 'categories'
    },
    yaxis: {
      tickColor: '#f1f2f3',
      position: ($rootScope.app.layout.isRTL ? 'right' : 'left')
    },
    legend: {
      backgroundColor: 'rgba(0,0,0,0)'
    },
    shadowSize: 0
  };

  flotOptions['bar'] = angular.extend({}, flotOptions['default'], {
    series: {
      bars: {
        align: 'center',
        lineWidth: 0,
        show: true,
        barWidth: 0.6,
        fill: 1
      }
    }
  });

  flotOptions['bar-stacked'] = angular.extend({}, flotOptions['default'], {
    series: {
      bars: {
        align: 'center',
        lineWidth: 0,
        show: true,
        barWidth: 0.6,
        fill: 1,
        stacked: true
      }
    }
  });

  flotOptions['line'] = angular.extend({}, flotOptions['default'], {
    series: {
      lines: {
        show: true,
        fill: 0.01
      },
      points: {
        show: true,
        radius: 4
      }
    }
  });

  flotOptions['spline'] = angular.extend({}, flotOptions['default'], {
    series: {
      lines: {
        show: false
      },
      splines: {
        show: true,
        tension: 0.4,
        lineWidth: 1,
        fill: 1
      },
    }
  });

  flotOptions['area'] = angular.extend({}, flotOptions['default'], {
    series: {
      lines: {
        show: true,
        fill: 1
      }
    }
  });

  flotOptions['pie'] = {
    series: {
      pie: {
        show: true,
        innerRadius: 0,
        label: {
          show: true,
          radius: 0.8,
          formatter: function (label, series) {
            return '<div class="flot-pie-label">' +
            //label + ' : ' +
            Math.round(series.percent) +
            '%</div>';
          },
          background: {
            opacity: 0.8,
            color: '#222'
          }
        }
      }
    }
  };

  flotOptions['donut'] = {
    series: {
      pie: {
        show: true,
        innerRadius: 0.5 // donut shape
      }
    }
  };



  return flotOptions;
}]);
/**=========================================================
 * Module: SparklinesDirective.js
 * SparkLines Mini Charts
 =========================================================*/
 
App.directive('sparkline', ['$timeout', '$window', function($timeout, $window){
  'use strict';

  return {
    restrict: 'EA',
    scope: {
      'values': '=?',
      'options': '=?'
    },
    controller: ["$scope", "$element", function ($scope, $element) {
      var values = $scope.values;
      var runSL = function(){
        initSparkLine($element);
      };

      $timeout(runSL);
    
      function initSparkLine($element) {
        var options = $scope.options;

        options.type = options.type || 'bar'; // default chart is bar
        options.disableHiddenCheck = true;

        $element.sparkline(values, options);

        if(options.resize) {
          $($window).resize(function(){
            $element.sparkline(values, options);
          });
        }
      }
    }]
  };


}]);

/**=========================================================
 * Module: FlatDocDirective.js
 * Creates the flatdoc markup and initializes the plugin
 =========================================================*/

App.directive('flatdoc', ["$document", function($document) {
  'use strict';
  return {
    restrict: "EA",
    template: ["<div role='flatdoc'>",
                  "<div role='flatdoc-menu' ui-scrollfix='+1'></div>",
                  "<div role='flatdoc-content'></div>",
               "</div>"].join('\n'),
    link: function(scope, element, attrs) {

      var $root = $('html, body');
      
      Flatdoc.run({
        fetcher: Flatdoc.file(attrs.src)
      });

      angular.element($document).on('flatdoc:ready', function() {
        
        var docMenu = element.find('[role="flatdoc-menu"]');
        
        docMenu.find('a').on('click', function(e) {
          e.preventDefault(); e.stopPropagation();
          
          var $this = $(this);
          
          docMenu.find('a.active').removeClass('active');
          $this.addClass('active');

          $root.animate({
                scrollTop: $(this.getAttribute('href')).offset().top - ($('.topnavbar').height() + 10)
            }, 800);
        });

      });
    }
  };

}])
;
App.controller('DashboardController', ['$scope', 'colors', 'flotOptions', function($scope, colors, flotOptions) {
  'use strict';
  // KNOB Charts
  // ----------------------------------- 

  $scope.knobLoaderData1 = 75;
  $scope.knobLoaderOptions1 = {
      width: '80%', // responsive
      displayInput: true,
      inputColor : colors.byName('gray-dark'),
      fgColor: colors.byName('info'),
      bgColor: colors.byName('inverse'),
      readOnly : true,
      lineCap : 'round',
      thickness : 0.1
    };

  $scope.knobLoaderData2 = 50;
  $scope.knobLoaderOptions2 = {
      width: '80%', // responsive
      displayInput: true,
      fgColor: colors.byName('inverse'),
      readOnly : true,
      lineCap : 'round',
      thickness : 0.1
    };


  // Dashboard charts
  // ----------------------------------- 

  // Spline chart
  $scope.splineChartOpts = angular.extend({}, flotOptions['spline'], { yaxis: {max: 115} });
  $scope.areaSplineSeries = [true, true];
  // Line chart
  $scope.chartOpts = angular.extend({}, flotOptions['default'], {
    points: {
      show: true,
      radius: 1
    },
    series: {
      lines: {
        show: true,
        fill: 1,
        fillColor: { colors: [ { opacity: 0.4 }, { opacity: 0.4 } ] }
      }
    },
    yaxis: {max: 50}
  });
  $scope.lineChartSeries = [false, true, true];


  // Sparkline
  // ----------------------------------- 
  
  $scope.sparkValues = [2,3,4,6,6,5,6,7,8,9,10];
  $scope.sparkOptions = {
    barColor:      colors.byName('gray'),
    height:        50,
    barWidth:      10,
    barSpacing:    4,
    chartRangeMin: 0
  };

}]);
/**=========================================================
 * Module: BootstrapSliderDirective
 * Initializes the jQuery UI slider controls
 =========================================================*/

App.directive('bootstrapSlider', function() {
  'use strict';
  return {
    restrict: 'A',
    controller: ["$scope", "$element", function($scope, $element) {
      var $elem = $($element);
      if($.fn.slider)
        $elem.slider();
    }]
  };
});

/**=========================================================
 * Module: FormInputController.js
 * Controller for input components
 =========================================================*/

App.controller('FormInputController', FormInputController);

function FormInputController($scope) {
  'use strict';

  // Chosen data
  // ----------------------------------- 

  this.states = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
  ];

  // Datepicker
  // ----------------------------------- 

  this.today = function() {
    this.dt = new Date();
  };
  this.today();

  this.clear = function () {
    this.dt = null;
  };

  // Disable weekend selection
  this.disabled = function(date, mode) {
    return false; //( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  this.toggleMin = function() {
    this.minDate = this.minDate ? null : new Date();
  };
  this.toggleMin();

  this.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.opened = true;
  };

  this.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  this.initDate = new Date('2016-15-20');
  this.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  this.format = this.formats[0];

  // Timepicker
  // ----------------------------------- 
  this.mytime = new Date();

  this.hstep = 1;
  this.mstep = 15;

  this.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  this.ismeridian = true;
  this.toggleMode = function() {
    this.ismeridian = ! this.ismeridian;
  };

  this.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    this.mytime = d;
  };

  this.changed = function () {
    console.log('Time changed to: ' + this.mytime);
  };

  this.clear = function() {
    this.mytime = null;
  };

  // Input mask
  // ----------------------------------- 

  this.testoption = {
        "mask": "99-9999999",
        "oncomplete": function () {
            console.log();
            console.log(arguments,"oncomplete!this log form controler");
        },
        "onKeyValidation": function () {
            console.log("onKeyValidation event happend! this log form controler");
        }
    };

  //default value
  this.test1 = new Date();

  this.dateFormatOption = {
      parser: function (viewValue) {
          return viewValue ? new Date(viewValue) : undefined;
      },
      formatter: function (modelValue) {
          if (!modelValue) {
              return "";
          }
          var date = new Date(modelValue);
          return (date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()).replace(/\b(\d)\b/g, "0$1");
      },
      isEmpty: function (modelValue) {
          return !modelValue;
      }
  };

  this.mask = { regex: ["999.999", "aa-aa-aa"]};

  this.regexOption = {
      regex: "[a-zA-Z0-9._%-]+@[a-zA-Z0-9-]+\\.[a-zA-Z]{2,4}"
  };

  this.functionOption = {
   mask: function () {
      return ["[1-]AAA-999", "[1-]999-AAA"];
  }};

  // Bootstrap Wysiwyg
  // ----------------------------------- 
 
  this.editorFontFamilyList = [
    'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier',
    'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact',
    'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
    'Times New Roman', 'Verdana'
  ];
  
  this.editorFontSizeList = [
    {value: 1, name: 'Small'},
    {value: 3, name: 'Normal'},
    {value: 5, name: 'Huge'}
  ];
}
FormInputController.$inject = ["$scope"];
/**=========================================================
 * Module: FormValidationController.js
 * Controller for input validation using AngularUI Validate
 =========================================================*/

App.controller('FormValidationController', FormValidationController);

function FormValidationController($scope) {
  'use strict';
  
  this.notBlackListed = function(value) {
    var blacklist = ['bad@domain.com','verybad@domain.com'];
    return blacklist.indexOf(value) === -1;
  };

  this.words = function(value) {
    return value && value.split(' ').length;
  };
}
FormValidationController.$inject = ["$scope"];
/**=========================================================
 * Module: MaskedDirective
 * Initializes masked inputs
 =========================================================*/

App.directive('masked', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attributes) {
      
      if($.fn.inputmask)
        element.inputmask(attributes.masked);

    }
  };
});

/**=========================================================
 * Module: SearchFormController.js
 * Provides autofill for top navbar search form
 =========================================================*/

App.controller('SearchFormController', ["$scope", "$state", function ($scope, $state) {
  'use strict';
   $scope.onRouteSelect = function ($model) {
    if($model) {
      $state.go("app.user" , {"id": $model.id});
      $scope.routeSelected = undefined;
    }

  };
  

}]);
/**=========================================================
 * Module: WysiwygDirective.js
 * Initializes the Wysiwyg editor
 =========================================================*/

App.directive('wysiwyg', ["$timeout", function($timeout) {
  'use strict';

  return {
    restrict: 'EA',
    controllerAs: 'editor',
    priority: 2001,
    link: function(scope, element, attrs) {
      
      element.css({
        'overflow':     'scroll',
        'height':       attrs.height || '250px',
        'max-height':   attrs.maxHeight || '300px'
      });

      $timeout(function() {
        element.wysiwyg();
      });
    }
  };

}]);
/**=========================================================
 * Module: climacon.js
 * Include any animated weather icon from Climacon
 =========================================================*/

App.directive('climacon', function(){
  'use strict';
  var SVG_PATH = 'app/vendor/animated-climacons/svgs/',
      SVG_EXT = '.svg';

  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {
      
      var color  = attrs.color  || '#000',
          name   = attrs.name   || 'sun',
          width  = attrs.width  || 20,
          height = attrs.height || 20;

      // Request the svg indicated
      $.get(SVG_PATH + name + SVG_EXT).then(svgLoaded, svgError);

      // if request success put it as online svg so we can style it
      function svgLoaded(xml) {
        var svg = angular.element(xml).find('svg');

        svg.css({
          'width':  width,
          'height': height
        });
        svg.find('.climacon_component-stroke').css('fill', color);

        element.append(svg);
      }
      // If fails write a message
      function svgError() {
        element.text('Error loading SVG: ' + name);
      }

    }
  };
});
App.service('language', ["$translate", function($translate) {
  'use strict';
  // Internationalization
  // ----------------------

  var Language = {
    data: {
      // Handles language dropdown
      listIsOpen: false,
      // list of available languages
      available: {
        'en':    'English',
        'es':    'Español',
        'pt':    'Português',
        'zh-cn': '中国简体',
      },
      selected: 'English'
    },
    // display always the current ui language
    init: function () {
      var proposedLanguage = $translate.proposedLanguage() || $translate.use();
      var preferredLanguage = $translate.preferredLanguage(); // we know we have set a preferred one in App.config
      this.data.selected = this.data.available[ (proposedLanguage || preferredLanguage) ];
      return this.data;

    },
    set: function (localeId, ev) {
      // Set the new idiom
      $translate.use(localeId);
      // save a reference for the current language
      this.data.selected = this.data.available[localeId];
      // finally toggle dropdown
      this.data.listIsOpen = ! this.data.listIsOpen;
    }
  };

  return Language;
}]);
/**=========================================================
 * Module: HeaderNavController
 * Controls the header navigation
 =========================================================*/

App.controller('HeaderNavController', ['$scope', function($scope) {
  'use strict';
  $scope.headerMenuCollapsed = true;

  $scope.toggleHeaderMenu = function() {
    $scope.headerMenuCollapsed = !$scope.headerMenuCollapsed;
  };

}]);
/**=========================================================
 * Module: SettingsController.js
 * Handles app setting
 =========================================================*/

App.controller('SettingsController', ["$scope", "$rootScope", "$localStorage", "language", function($scope, $rootScope, $localStorage, language) {
  'use strict';
  $scope.app = $rootScope.app;

  $scope.themes = [
    {sidebar: 'bg-inverse', brand: 'bg-info', topbar:  'bg-white'},
    {sidebar: 'bg-inverse', brand: 'bg-inverse', topbar:  'bg-white'},
    {sidebar: 'bg-inverse', brand: 'bg-purple', topbar:  'bg-white'},
    {sidebar: 'bg-inverse', brand: 'bg-success', topbar:  'bg-white'},
    {sidebar: 'bg-white br', brand: 'bg-inverse', topbar:  'bg-inverse'},
    {sidebar: 'bg-inverse', brand: 'bg-info', topbar:  'bg-info'},
    {sidebar: 'bg-white br', brand: 'bg-purple', topbar:  'bg-purple'},
    {sidebar: 'bg-white br', brand: 'bg-primary', topbar:  'bg-primary'}
  ];

  $scope.setTheme = function($idx) {
    $scope.app.theme = $scope.themes[$idx];
  };

  // Init internationalization service
  $scope.language = language.init();
  $scope.language.set = angular.bind(language,language.set);

  
}]);
/**=========================================================
 * Module: SummaryController.js
 * Handles app setting
 =========================================================*/

App.controller('SummaryController', ["$scope", "colors", function($scope, colors) {
  'use strict';
  $scope.sparkOps1 = {
    barColor: colors.byName('primary'),
    height: 20
  };
  $scope.sparkOps2 = {
    barColor: colors.byName('info'),
    height: 20
  };
  $scope.sparkOps3 = {
    barColor: colors.byName('turquoise'),
    height: 20
  };

  $scope.sparkData1 = [1,2,3,4,5,6,7,8,9];
  $scope.sparkData2 = [1,2,3,4,5,6,7,8,9];
  $scope.sparkData3 = [1,2,3,4,5,6,7,8,9];

}]);
/**=========================================================
 * Module: GoogleMapController.js
 * Google Map plugin controller
 =========================================================*/

App.controller('GoogleMapController', GoogleMapController);

function GoogleMapController($scope) {
  'use strict';
  var vm = this;
  // Demo 1
  // ----------------------------------- 

  $scope.$watch(function(){
    return vm.center;
   }, function(center) {
     if (center) {
       vm.centerLat = center.lat();
       vm.centerLng = center.lng();
     }
  });
  
  this.updateCenter = function(lat, lng) {
    vm.center = new google.maps.LatLng(lat, lng);
  };

  // Demo 2
  // ----------------------------------- 

  this.options = {
    map: {
      center: new google.maps.LatLng(48, -121),
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    },
  };
  
  this.volcanoes = [
    {
      id: 0,
      name: 'Mount Rainier',
      img: 'http://www.thetrackerfoundation.org/Images/MountRainier_SM.jpg',
      elevationMeters: 4392,
      location: {
        lat: 46.852947,
        lng: -121.760424
      }
    },
    {
      id: 1,
      name: 'Mount Baker',
      img: 'http://www.destination360.com/north-america/us/washington/images/s/washington-mt-baker-ski.jpg',
      elevationMeters: 3287,
      location: {
        lat: 48.776797,
        lng: -121.814467
      }
    },
    {
      id: 2,
      name: 'Glacier Peak',
      img: 'http://www.rhinoclimbs.com/Images/Glacier.9.jpg',
      elevationMeters: 3207,
      location: {
        lat: 48.111844,
        lng: -121.11412
      }
    }
  ];
  
  this.triggerOpenInfoWindow = function(volcano) {
    vm.markerEvents = [
      {
        event: 'openinfowindow',
        ids: [volcano.id]
      },
    ];
  };

  // Demo 3
  // ----------------------------------- 

  this.options3 = {
    map: {
      center: new google.maps.LatLng(48, -121),
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    },
    notselected: {
      icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png'
    },
    selected: {
      icon: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png'
    }
  };

  // add to global scope so the map plugin can see the mutated object
  // when we broadcast the changes
  $scope.volcanoes = this.volcanoes;

  this.getVolcanoOpts = function(volcan) {
    return angular.extend(
     { title: volcan.name },
     volcan.selected ? vm.options3.selected :
        vm.options3.notselected
    );
  };
  
  this.selectVolcano = function(volcan) {
    if (vm.volcan) {
      vm.volcan.selected = false;
    }
    vm.volcan = volcan;
    vm.volcan.selected = true;

    $scope.$broadcast('gmMarkersUpdate', 'volcanoes');

  };

}
GoogleMapController.$inject = ["$scope"];
/**=========================================================
 * Module: VectorMapController.js
 * jVector Maps support
 =========================================================*/

App.controller('VectorMapController', VectorMapController);

function VectorMapController($scope, colors) {
  'use strict';
  var vm = this;
  
  // SERIES & MARKERS FOR WORLD MAP
  // ----------------------------------- 

  this.seriesData = {
    'AU': 15710,    // Australia
    'RU': 17312,    // Russia
    'CN': 123370,    // China
    'US': 12337,     // USA
    'AR': 18613,    // Argentina
    'CO': 12170,   // Colombia
    'DE': 1358,    // Germany
    'FR': 1479,    // France
    'GB': 16311,    // Great Britain
    'IN': 19814,    // India
    'SA': 12137      // Saudi Arabia
  };
  
  this.markersData = [
    { latLng:[41.90, 12.45],  name:'Vatican City'          },
    { latLng:[43.73, 7.41],   name:'Monaco'                },
    { latLng:[-0.52, 166.93], name:'Nauru'                 },
    { latLng:[-8.51, 179.21], name:'Tuvalu'                },
    { latLng:[7.11,171.06],   name:'Marshall Islands'      },
    { latLng:[17.3,-62.73],   name:'Saint Kitts and Nevis' },
    { latLng:[3.2,73.22],     name:'Maldives'              },
    { latLng:[35.88,14.5],    name:'Malta'                 },
    { latLng:[41.0,-71.06],   name:'New England'           },
    { latLng:[12.05,-61.75],  name:'Grenada'               },
    { latLng:[13.16,-59.55],  name:'Barbados'              },
    { latLng:[17.11,-61.85],  name:'Antigua and Barbuda'   },
    { latLng:[-4.61,55.45],   name:'Seychelles'            },
    { latLng:[7.35,134.46],   name:'Palau'                 },
    { latLng:[42.5,1.51],     name:'Andorra'               }
  ];
  
  // set options will be reused later
  this.mapOptions = {
      height:          500,
      map:             'world_mill_en',
      backgroundColor: 'transparent',
      zoomMin:         0,
      zoomMax:         8,
      zoomOnScroll:    false,
      regionStyle: {
        initial: {
          'fill':           colors.byName('gray-dark'),
          'fill-opacity':   1,
          'stroke':         'none',
          'stroke-width':   1.5,
          'stroke-opacity': 1
        },
        hover: {
          'fill-opacity': 0.8
        },
        selected: {
          fill: 'blue'
        },
        selectedHover: {
        }
      },
      focusOn:{ x:0.4, y:0.6, scale: 1},
      markerStyle: {
        initial: {
          fill: colors.byName('warning'),
          stroke: colors.byName('warning')
        }
      },
      onRegionLabelShow: function(e, el, code) {
        if ( vm.seriesData && vm.seriesData[code] )
          el.html(el.html() + ': ' + vm.seriesData[code] + ' visitors');
      },
      markers: vm.markersData,
      series: {
          regions: [{
              values: vm.seriesData,
              scale: [ colors.byName('gray-darker') ],
              normalizeFunction: 'polynomial'
          }]
      },
    };

  // USA MAP
  // ----------------------------------- 
  this.usaMarkersData = [
    {latLng: [33.9783241, -84.4783064],               name: 'Mark_1'},
    {latLng: [30.51220349999999, -97.67312530000001], name: 'Mark_2'},
    {latLng: [39.4014955, -76.6019125],               name: 'Mark_3'},
    {latLng: [33.37857109999999, -86.80439],          name: 'Mark_4'},
    {latLng: [43.1938516, -71.5723953],               name: 'Mark_5'},
    {latLng: [43.0026291, -78.8223134],               name: 'Mark_6'},
    {latLng: [33.836081, -81.1637245],                name: 'Mark_7'},
    {latLng: [41.7435073, -88.0118473],               name: 'Mark_8'},
    {latLng: [39.1031182, -84.5120196],               name: 'Mark_9'},
    {latLng: [41.6661573, -81.339552],                name: 'Mark_10'},
    {latLng: [39.9611755, -82.99879419999999],        name: 'Mark_11'},
    {latLng: [32.735687, -97.10806559999999],         name: 'Mark_12'},
    {latLng: [39.9205411, -105.0866504],              name: 'Mark_13'},
    {latLng: [42.8105356, -83.0790865],               name: 'Mark_14'},
    {latLng: [41.754166, -72.624443],                 name: 'Mark_15'},
    {latLng: [29.7355047, -94.97742740000001],        name: 'Mark_16'},
    {latLng: [39.978371, -86.1180435],                name: 'Mark_17'},
    {latLng: [30.3321838, -81.65565099999999],        name: 'Mark_18'},
    {latLng: [39.0653602, -94.5624426],               name: 'Mark_19'},
    {latLng: [36.0849963, -115.1511364],              name: 'Mark_20'},
    {latLng: [34.0596149, -118.1122679],              name: 'Mark_21'},
    {latLng: [38.3964426, -85.4375574],               name: 'Mark_22'}
  ];

  this.mapOptions2 = angular.extend({}, this.mapOptions,
    {
      map: 'us_mill_en',
      regionStyle: {
        initial: {
          'fill':           colors.byName('info')
        }
      },
      focusOn:{ x:0.5, y:0.5, scale: 1.2},
      markerStyle: {
        initial: {
          fill: colors.byName('turquoise'),
          stroke: colors.byName('turquoise'),
          r: 10
        },
        hover: {
            stroke: colors.byName('success'),
            'stroke-width': 2
          },
      },
      markers: this.usaMarkersData,
      series: {}
    }
  );
}
VectorMapController.$inject = ["$scope", "colors"];

/**=========================================================
 * Module: VectorMapDirective
 * Init jQuery Vector Map plugin
 =========================================================*/

App.directive('vectorMap', function(){
  'use strict';

  return {
    restrict: 'EA',
    scope: {
      mapOptions: '='
    },
    compile: function(tElement, tAttrs, transclude) {
      return {
        post: function(scope, element) {
          var options     = scope.mapOptions,
              mapHeight   = options.height || '300';
          
          element.css('height', mapHeight);
          
          element.vectorMap(options);
        }
      };
    }
  };

});
/**=========================================================
 * Module: PortletsController.js
 * Drag and drop any panel based on jQueryUI portlets
 =========================================================*/
 
App.directive('portlet', ["$timeout", function($timeout) {
  'use strict';

  var storageKeyName = 'portletState';
  var $scope;

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      
      $scope = scope;

      // Component is not optional
      if(!$.fn.sortable) return;

      element.sortable({
        connectWith:          '[portlet]',
        items:                'div.panel',
        handle:               '.portlet-handler',
        opacity:              0.7,
        placeholder:          'portlet box-placeholder',
        cancel:               '.portlet-cancel',
        forcePlaceholderSize: true,
        iframeFix:            false,
        tolerance:            'pointer',
        helper:               'original',
        revert:               200,
        forceHelperSize:      true,
        start:                setListSize,
        update:               savePortletOrder,
        create:               loadPortletOrder
      });

    }
  };

  function savePortletOrder(event, ui) {
    var self = event.target;
    var data = $scope.$storage[storageKeyName];
    
    if(!data) { data = {}; }

    data[self.id] = $(self).sortable('toArray');

    if(data) {
      $timeout(function() {
        $scope.$storage[storageKeyName] = data;
      });
    }
    
    // save portlet size to avoid jumps
    setListSize(self);
  }

  function loadPortletOrder(event) {
    var self = event.target;
    var data = $scope.$storage[storageKeyName];

    if(data) {
      
      var porletId = self.id,
          panels   = data[porletId];

      if(panels) {
        var portlet = $('#'+porletId);
        
        $.each(panels, function(index, value) {
           $('#'+value).appendTo(portlet);
        });
      }

    }

    // save portlet size to avoid jumps
    setListSize(self);
  }

  // Keeps a consistent size in all portlet lists
  function setListSize(event) {
    var $this = $(event.target || event);
    $this.css('min-height', $this.height());
  }

}]);
/**=========================================================
 * Module: SidebarController
 * Provides functions for sidebar markup generation.
 * Also controls the collapse items states
 =========================================================*/

App.controller('SidebarController', ['$rootScope', '$scope', '$location', '$http', '$timeout', 'sidebarMemu', 'appMediaquery', '$window',
  function($rootScope, $scope, $location, $http, $timeout, sidebarMemu, appMediaquery, $window ){
    'use strict';
    var currentState = $rootScope.$state.current.name;
    var $win  = $($window);
    var $html = $('html');
    var $body = $('body');

    // Load menu from json file
    // ----------------------------------- 
    sidebarMemu.load();
    
    // Adjustment on route changes
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      currentState = toState.name;
      // Hide sidebar automatically on mobile
      $('body.aside-toggled').removeClass('aside-toggled');

      $rootScope.$broadcast('closeSidebarMenu');
    });

    // Normalize state on resize to avoid multiple checks
    $win.on('resize', function() {
      if( isMobile() )
        $body.removeClass('aside-collapsed');
      else
        $body.removeClass('aside-toggled');
    });

    $rootScope.$watch('app.sidebar.isCollapsed', function(newValue, oldValue) {
      // Close subnav when sidebar change from collapsed to normal
      $rootScope.$broadcast('closeSidebarMenu');
      $rootScope.$broadcast('closeSidebarSlide');
    });

    // Check item and children active state
    var isActive = function(item) {

      if(!item || !item.sref) return;

      var path = item.sref, prefix = '#';
      if(path === prefix) {
        var foundActive = false;
        angular.forEach(item.subnav, function(value, key) {
          if(isActive(value)) foundActive = true;
        });
        return foundActive;
      }
      else {
        return (currentState === path);
      }
    };


    $scope.getSidebarItemClass = function(item) {
      return (item.type == 'heading' ? 'nav-heading' : '') +
             (isActive(item) ? ' active' : '') ;
    };


    // Handle sidebar collapse items
    // ----------------------------------- 
    var collapseList = [];

    $scope.addCollapse = function($index, item) {
      collapseList[$index] = true; //!isActive(item);
    };

    $scope.isCollapse = function($index) {
      return collapseList[$index];
    };

    $scope.collapseAll = function() {
      collapseAllBut(-1);
    };

    $scope.toggleCollapse = function($index) {

      // States that doesn't toggle drodopwn
      if( (isSidebarCollapsed() && !isMobile()) || isSidebarSlider()  ) return true;
      
      // make sure the item index exists
      if( typeof collapseList[$index] === undefined ) return true;

      collapseAllBut($index);
      collapseList[$index] = !collapseList[$index];
    
      return true;

    };

    function collapseAllBut($index) {
      angular.forEach(collapseList, function(v, i) {
        if($index !== i)
          collapseList[i] = true;
      });
    }

    // Helper checks
    // ----------------------------------- 

    function isMobile() {
      return $win.width() < appMediaquery.tablet;
    }
    function isTouch() {
      return $html.hasClass('touch');
    }
    function isSidebarCollapsed() {
      return $rootScope.app.sidebar.isCollapsed;
    }
    function isSidebarToggled() {
      return $body.hasClass('aside-toggled');
    }
    function isSidebarSlider() {
      return $rootScope.app.sidebar.slide;
    }

}]);

/**=========================================================
 * Module: SidebarDirective
 * Wraps the sidebar. Handles collapsed state and slide
 =========================================================*/

App.directive('sideBar', ['$rootScope', '$window', '$timeout', '$compile', 'appMediaquery', 'support', '$http', '$templateCache',
    function($rootScope, $window, $timeout, $compile, appMediaquery, support, $http, $templateCache) {
  'use strict';
  
  var $win  = $($window);
  var $html = $('html');
  var $body = $('body');
  var $scope;
  var $sidebar;
  var $sidebarNav;
  var $sidebarButtons;

  return {
    restrict: 'E',
    template: '<nav class="sidebar" ng-transclude></nav>',
    transclude: true,
    replace: true,
    link: function(scope, element, attrs) {
      
      $scope   = scope;
      $sidebar = element;
      $sidebarNav = element.children('.sidebar-nav');
      $sidebarButtons = element.find('.sidebar-buttons');

      // depends on device the event we use
      var eventName = isTouch() ? 'click' : 'mouseenter' ;
      $sidebarNav.on( eventName, '.nav > li', function() {
          
        if( isSidebarCollapsed() && !isMobile() ) {
          toggleMenuItem( $(this) );
          if( isTouch() ) {
            sidebarAddBackdrop();
          }
        }

      });

      // Check for click to slide sidebar navigation menu
      $sidebarNav.on('click', '.nav > li', function() {
        if( isSidebarSlider() && !isSidebarCollapsed()) {
          sidebarSliderToggle(this);
        }
      });
      
      // Check for click to slide sidebar bottom item
      $sidebarButtons.on('click', '.btn-sidebar', function() {
        // call parent method
        $scope.collapseAll();
        // slide sidebar 
        sidebarSliderToggle(this);
      });

      // expose a close function to use a go back
      $sidebarNav.on('click', '.sidebar-close', function(){
        sidebarSliderClose();
      });

      // if something ask us to close the sidebar menu
      $scope.$on('closeSidebarMenu', function() {
        sidebarCloseFloatItem();
      });
      // if something ask us to close the sidebar slide
      $scope.$on('closeSidebarSlide', function() {
        sidebarSliderClose();
      });
      
    }
  };

  // Sidebar slide mode
  // ----------------------------------- 
  
  function sidebarSliderClose() {
    if( !$sidebar.hasClass('sidebar-slide')) return;

    if( support.transition ) {
      return $sidebar
        .on(support.transition.end, removeMenuDom)
        .removeClass('sidebar-slide').length;
    }
    else {
      $timeout(removeMenuDom, 500);
      return $sidebar.removeClass('sidebar-slide').length;
    }

    function removeMenuDom() {
      if(support.transition)
        $sidebar.off(support.transition.end);
      $sidebarNav
        .find('.nav-slide').hide()
        .filter('.sidebar-subnav').remove();
    }
  }

  // expect an level 1 li element
  function sidebarSliderToggle(element) {

    var $el = $(element),
        // Find a template
        $item = $el; //$el.siblings('.sidebar-slide-template');
    // if not exists, find a submenu UL
    if( ! $item.hasClass('btn-sidebar'))
      $item = $el.children('ul');
    // make sure other slider are closed
    if( sidebarSliderClose() )
      return;

    if($item.length) {

      var templatePath = $item.attr('compile');
      var newItem, templateContent;

      // Compile content when it contains angular
      if( templatePath ) {
        templateContent = $templateCache.get(templatePath);
        if( templateContent ) {
          prepareItemTemplate( templateContent, templatePath );
        }
        else {
          $http.get(templatePath).success(function(data) {
            // cache the template markup
            $templateCache.put(templatePath, data);
            prepareItemTemplate( data, templatePath );
          });
          
        }
      }
      else {
        newItem = $item.clone();
        addSlideItemToDom(newItem);
      }
    }
  }

  function prepareItemTemplate(markup, id) {
    if( ! $scope.sbSlideItems ) $scope.sbSlideItems = {};
    
    if( ! $scope.sbSlideItems[id]  ) {
      // create an element and compile it
      $scope.sbSlideItems[id] = $compile(markup)($scope.$parent);

    }

    // append to dom
    addSlideItemToDom($scope.sbSlideItems[id]);
  }

  function addSlideItemToDom(newItem) {
    // the first the item is not in dom so we add it
    if ( ! newItem.inDom ) {
      newItem.inDom = true;
      newItem = newItem.prependTo($sidebarNav).addClass('nav-slide');
    }
    else {
      // nex time only show a hidden item
      newItem.show();
    }
    
    $timeout(function() {
      $sidebar.addClass('sidebar-slide')
              .scrollTop(0);
    }, 100);

    // Actives the items
    newItem.on('click.slide.subnav', 'li:not(.sidebar-subnav-header)', function(e){
      e.stopPropagation();
      $(this).off('click.slide.subnav')
        .siblings('li').removeClass('active')
        .end().addClass('active');

    });
  }

  // Handles hover to open items on 
  // collapsed menu
  // ----------------------------------- 
  function toggleMenuItem($listItem) {

    sidebarCloseFloatItem();

    var ul = $listItem.children('ul');

    if( !ul.length )
      return;

    var navHeader = $('.navbar-header');
    var mar =  $rootScope.app.layout.isFixed ?  parseInt( navHeader.outerHeight(true), 0) : 0;

    var subNav = ul.clone().appendTo( '.sidebar-wrapper' );
    
    var itemTop = ($listItem.position().top + mar) - $sidebar.scrollTop();
    var vwHeight = $win.height();

    subNav
      .addClass('nav-floating')
      .css({
        position: $rootScope.app.layout.isFixed ? 'fixed' : 'absolute',
        top:      itemTop,
        bottom:   (subNav.outerHeight(true) + itemTop > vwHeight) ? 0 : 'auto'
      });

    subNav.on('mouseleave', function() {
      subNav.remove();
    });

  }

  function sidebarCloseFloatItem() {
    $('.dropdown-backdrop').remove();
    $('.sidebar-subnav.nav-floating').remove();
  }

  function sidebarAddBackdrop() {
    var $backdrop = $('<div/>', { 'class': 'dropdown-backdrop'} );
    $backdrop.insertAfter($sidebar).on("click", function () {
      sidebarCloseFloatItem();
    });
  }


  function isTouch() {
    return $html.hasClass('touch');
  }
  function isSidebarCollapsed() {
    return $rootScope.app.sidebar.isCollapsed;
  }
  function isSidebarToggled() {
    return $body.hasClass('aside-toggled');
  }
  function isMobile() {
    return $win.width() < appMediaquery.tablet;
  }
  function isSidebarSlider() {
    return $rootScope.app.sidebar.slide;
  }

}]);
/**=========================================================
 * Module: FlotChartOptionsServices.js
 * Make an http request to load the menu structure
 =========================================================*/

App.service('sidebarMemu', ["$rootScope", "$http","$cookies", function($rootScope, $http,$cookies) {
  'use strict';


  var menuJson = 'server/sidebar/sidebar-items.json',
      menuURL  = menuJson + '?v=' + (new Date().getTime()); // jumps cache

  return {
    load: function() {

      $http.get(menuURL)
        .success(function(items) {

           $rootScope.menuItems = items;

        })
        .error(function(data, status, headers, config) {

          alert('Failure loading menu');

        });
    }
  };

}]);
/**=========================================================
 * Module: AngularTableController.js
 * Controller for ngTables
 =========================================================*/

App.controller('AngularTableController', AngularTableController);

function AngularTableController($scope, $filter, ngTableParams) {
  'use strict';
  var vm = this;

  // SORTING
  // ----------------------------------- 

  var data = [
      {name: "Moroni",  age: 50, money: -10   },
      {name: "Tiancum", age: 43, money: 120   },
      {name: "Jacob",   age: 27, money: 5.5   },
      {name: "Nephi",   age: 29, money: -54   },
      {name: "Enos",    age: 34, money: 110   },
      {name: "Tiancum", age: 43, money: 1000  },
      {name: "Jacob",   age: 27, money: -201  },
      {name: "Nephi",   age: 29, money: 100   },
      {name: "Enos",    age: 34, money: -52.5 },
      {name: "Tiancum", age: 43, money: 52.1  },
      {name: "Jacob",   age: 27, money: 110   },
      {name: "Nephi",   age: 29, money: -55   },
      {name: "Enos",    age: 34, money: 551   },
      {name: "Tiancum", age: 43, money: -1410 },
      {name: "Jacob",   age: 27, money: 410   },
      {name: "Nephi",   age: 29, money: 100   },
      {name: "Enos",    age: 34, money: -100  }
  ];

  vm.tableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      sorting: {
          name: 'asc'     // initial sorting
      }
  }, {
      total: data.length, // length of data
      getData: function($defer, params) {
          // use build-in angular filter
          var orderedData = params.sorting() ?
                  $filter('orderBy')(data, params.orderBy()) :
                  data;
  
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
  });

  // FILTERS
  // ----------------------------------- 

  vm.tableParams2 = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      filter: {
          name: '',
          age: ''
          // name: 'M'       // initial filter
      }
  }, {
      total: data.length, // length of data
      getData: function($defer, params) {
          // use build-in angular filter
          var orderedData = params.filter() ?
                 $filter('filter')(data, params.filter()) :
                 data;

          vm.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve(vm.users);
      }
  });

  // SELECT ROWS
  // ----------------------------------- 

  vm.data = data;

  vm.tableParams3 = new ngTableParams({
      page: 1,            // show first page
      count: 10          // count per page
  }, {
      total: data.length, // length of data
      getData: function ($defer, params) {
          // use build-in angular filter
          var filteredData = params.filter() ?
                  $filter('filter')(data, params.filter()) :
                  data;
          var orderedData = params.sorting() ?
                  $filter('orderBy')(filteredData, params.orderBy()) :
                  data;

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
  });

  vm.changeSelection = function(user) {
      // console.info(user);
  };

  // EXPORT CSV
  // -----------------------------------  

  var data4 = [{name: "Moroni", age: 50},
      {name: "Tiancum", age: 43},
      {name: "Jacob", age: 27},
      {name: "Nephi", age: 29},
      {name: "Enos", age: 34},
      {name: "Tiancum", age: 43},
      {name: "Jacob", age: 27},
      {name: "Nephi", age: 29},
      {name: "Enos", age: 34},
      {name: "Tiancum", age: 43},
      {name: "Jacob", age: 27},
      {name: "Nephi", age: 29},
      {name: "Enos", age: 34},
      {name: "Tiancum", age: 43},
      {name: "Jacob", age: 27},
      {name: "Nephi", age: 29},
      {name: "Enos", age: 34}];

  vm.tableParams4 = new ngTableParams({
      page: 1,            // show first page
      count: 10           // count per page
  }, {
      total: data4.length, // length of data4
      getData: function($defer, params) {
          $defer.resolve(data4.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
  });

}
AngularTableController.$inject = ["$scope", "$filter", "ngTableParams"];

/**=========================================================
 * Module: heckAllTableDirective
 * Allows to use a checkbox to check all the rest in the same
 * columns in a Bootstrap table
 =========================================================*/

App.directive('checkAll', function() {
  'use strict';
  
  return {
    restrict: 'A',
    controller: ["$scope", "$element", function($scope, $element){
      
      $element.on('change', function() {
        var $this = $(this),
            index= $this.index() + 1,
            checkbox = $this.find('input[type="checkbox"]'),
            table = $this.parents('table');
        // Make sure to affect only the correct checkbox column
        table.find('tbody > tr > td:nth-child('+index+') input[type="checkbox"]')
          .prop('checked', checkbox[0].checked);

      });
    }]
  };

});
/**=========================================================
 * Module: DemoResponsiveTableController.js
 * Controller for responsive tables components
 =========================================================*/

App.controller("ResponsiveTableController", ['$scope', 'colors', function($scope, colors) {
  'use strict';

  $scope.sparkOps1 = {
    barColor: colors.byName('primary')
  };
  $scope.sparkOps2 = {
    barColor: colors.byName('info')
  };
  $scope.sparkOps3 = {
    barColor: colors.byName('turquoise')
  };

  $scope.sparkData1 = [1,2,3,4,5,6,7,8,9];
  $scope.sparkData2 = [1,2,3,4,5,6,7,8,9];
  $scope.sparkData3 = [1,2,3,4,5,6,7,8,9];
}]);
/**=========================================================
 * Module: demo-alerts.js
 * Provides a simple demo for pagination
 =========================================================*/

App.controller('AlertDemoCtrl', ["$scope", function AlertDemoCtrl($scope) {
  'use strict';

  $scope.alerts = [
    { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
    { type: 'warning', msg: 'Well done! You successfully read this important alert message.' }
  ];

  $scope.addAlert = function() {
    $scope.alerts.push({msg: 'Another alert!'});
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

}]);
/**=========================================================
 * Module: DemoButtonsController.js
 * Provides a simple demo for buttons actions
 =========================================================*/

App.controller('ButtonsCtrl', ["$scope", function ($scope) {
  'use strict';
  $scope.singleModel = 1;

  $scope.radioModel = 'Middle';

  $scope.checkModel = {
    left: false,
    middle: true,
    right: false
  };

}]);
/**=========================================================
 * Module: DemoCarouselController
 * Provides a simple demo for bootstrap ui carousel
 =========================================================*/

App.controller('CarouselDemoCtrl', ["$scope", function ($scope) {
  'use strict';

  $scope.myInterval = 5000;
  var slides = $scope.slides = [];

  $scope.addSlide = function(index) {
    var newWidth = 800 + slides.length;
    index = index || (Math.floor((Math.random() * 2))+1);
    slides.push({
      image: 'app/img/bg' + index + '.jpg',
      text: "Nulla viverra dignissim metus ac placerat."
    });
  };
  for (var i=1; i<=3; i++) {
    $scope.addSlide(i);
  }
}]);
/**=========================================================
 * Module: DemoDatepickerController.js
 * Provides a simple demo for bootstrap datepicker
 =========================================================*/

App.controller('DatepickerDemoCtrl', ["$scope", function ($scope) {
  'use strict';

  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.initDate = new Date('2016-15-20');
  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

}]);

/**=========================================================
 * Module: DemoPaginationController
 * Provides a simple demo for pagination
 =========================================================*/

App.controller('PaginationDemoCtrl', ["$scope", function ($scope) {
  'use strict';

  $scope.totalItems = 64;
  $scope.currentPage = 4;

  $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  $scope.pageChanged = function() {
    console.log('Page changed to: ' + $scope.currentPage);
  };

  $scope.maxSize = 5;
  $scope.bigTotalItems = 175;
  $scope.bigCurrentPage = 1;
}]);
/**=========================================================
 * Module: DemoPopoverController.js
 * Provides a simple demo for popovers
 =========================================================*/

App.controller('PopoverDemoCtrl', ["$scope", function ($scope) {
  'use strict';

  $scope.dynamicPopover = 'Hello, World!';
  $scope.dynamicPopoverTitle = 'Title';

}]);
/**=========================================================
 * Module: DemoProgressController.js
 * Provides a simple demo to animate progress bar
 =========================================================*/

App.controller('ProgressDemoCtrl', ["$scope", function ($scope) {
  'use strict';

  $scope.max = 200;

  $scope.random = function() {
    var value = Math.floor((Math.random() * 100) + 1);
    var type;

    if (value < 25) {
      type = 'success';
    } else if (value < 50) {
      type = 'info';
    } else if (value < 75) {
      type = 'warning';
    } else {
      type = 'danger';
    }

    $scope.showWarning = (type === 'danger' || type === 'warning');

    $scope.dynamic = value;
    $scope.type = type;
  };
  $scope.random();

  $scope.randomStacked = function() {
    $scope.stacked = [];
    var types = ['success', 'info', 'warning', 'danger'];

    for (var i = 0, n = Math.floor((Math.random() * 4) + 1); i < n; i++) {
        var index = Math.floor((Math.random() * 4));
        $scope.stacked.push({
          value: Math.floor((Math.random() * 30) + 1),
          type: types[index]
        });
    }
  };
  $scope.randomStacked();
}]);
/**=========================================================
 * Module: DemoRatingController.js
 * Provides a demo for ratings UI
 =========================================================*/

App.controller('RatingDemoCtrl', ["$scope", function ($scope) {
  'use strict';

  $scope.rate = 7;
  $scope.max = 10;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };

  $scope.ratingStates = [
    {stateOn: 'fa fa-check', stateOff: 'fa fa-check-circle'},
    {stateOn: 'fa fa-star', stateOff: 'fa fa-star-o'},
    {stateOn: 'fa fa-heart', stateOff: 'fa fa-ban'},
    {stateOn: 'fa fa-heart'},
    {stateOff: 'fa fa-power-off'}
  ];

}]);
/**=========================================================
 * Module: DemoTimepickerController
 * Provides a simple demo for bootstrap ui timepicker
 =========================================================*/

App.controller('TimepickerDemoCtrl', ["$scope", function ($scope) {
  'use strict';
  $scope.mytime = new Date();

  $scope.hstep = 1;
  $scope.mstep = 15;

  $scope.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
  };

  $scope.changed = function () {
    console.log('Time changed to: ' + $scope.mytime);
  };

  $scope.clear = function() {
    $scope.mytime = null;
  };
}]);

/**=========================================================
 * Module: DemoToasterController.js
 * Demos for toaster notifications
 =========================================================*/

App.controller('ToasterDemoCtrl', ['$scope', 'toaster', function($scope, toaster) {
  'use strict';
  $scope.toaster = {
      type:  'success',
      title: 'Title',
      text:  'Message'
  };

  $scope.pop = function() {
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

}]);
/**=========================================================
 * Module: DemoTooltipController.js
 * Provides a simple demo for tooltip
 =========================================================*/
App.controller('TooltipDemoCtrl', ["$scope", function ($scope) {
  'use strict';
  $scope.dynamicTooltip = 'Hello, World!';
  $scope.dynamicTooltipText = 'dynamic';
  $scope.htmlTooltip = 'I\'ve been made <b>bold</b>!';

}]);
/**=========================================================
 * Module: DemoTypeaheadController.js
 * Provides a simple demo for typeahead
 =========================================================*/

App.controller('TypeaheadCtrl', ["$scope", "$http", function ($scope, $http) {
  'use strict';
  $scope.selected = undefined;
  $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
  // Any function returning a promise object can be used to load values asynchronously
  $scope.getLocation = function(val) {
    return $http.get('http://localhost:5000/user?where={"uid":{"$regex":"' + val +'"}}').then(function(res){
      var addresses = [];
      angular.forEach(res._items, function(item){
        addresses.push(item.uid);
      });
      return addresses;
    });
  };

  $scope.statesWithFlags = [{'name':'Alabama','flag':'5/5c/Flag_of_Alabama.svg/45px-Flag_of_Alabama.svg.png'},{'name':'Alaska','flag':'e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png'},{'name':'Arizona','flag':'9/9d/Flag_of_Arizona.svg/45px-Flag_of_Arizona.svg.png'},{'name':'Arkansas','flag':'9/9d/Flag_of_Arkansas.svg/45px-Flag_of_Arkansas.svg.png'},{'name':'California','flag':'0/01/Flag_of_California.svg/45px-Flag_of_California.svg.png'},{'name':'Colorado','flag':'4/46/Flag_of_Colorado.svg/45px-Flag_of_Colorado.svg.png'},{'name':'Connecticut','flag':'9/96/Flag_of_Connecticut.svg/39px-Flag_of_Connecticut.svg.png'},{'name':'Delaware','flag':'c/c6/Flag_of_Delaware.svg/45px-Flag_of_Delaware.svg.png'},{'name':'Florida','flag':'f/f7/Flag_of_Florida.svg/45px-Flag_of_Florida.svg.png'},{'name':'Georgia','flag':'5/54/Flag_of_Georgia_%28U.S._state%29.svg/46px-Flag_of_Georgia_%28U.S._state%29.svg.png'},{'name':'Hawaii','flag':'e/ef/Flag_of_Hawaii.svg/46px-Flag_of_Hawaii.svg.png'},{'name':'Idaho','flag':'a/a4/Flag_of_Idaho.svg/38px-Flag_of_Idaho.svg.png'},{'name':'Illinois','flag':'0/01/Flag_of_Illinois.svg/46px-Flag_of_Illinois.svg.png'},{'name':'Indiana','flag':'a/ac/Flag_of_Indiana.svg/45px-Flag_of_Indiana.svg.png'},{'name':'Iowa','flag':'a/aa/Flag_of_Iowa.svg/44px-Flag_of_Iowa.svg.png'},{'name':'Kansas','flag':'d/da/Flag_of_Kansas.svg/46px-Flag_of_Kansas.svg.png'},{'name':'Kentucky','flag':'8/8d/Flag_of_Kentucky.svg/46px-Flag_of_Kentucky.svg.png'},{'name':'Louisiana','flag':'e/e0/Flag_of_Louisiana.svg/46px-Flag_of_Louisiana.svg.png'},{'name':'Maine','flag':'3/35/Flag_of_Maine.svg/45px-Flag_of_Maine.svg.png'},{'name':'Maryland','flag':'a/a0/Flag_of_Maryland.svg/45px-Flag_of_Maryland.svg.png'},{'name':'Massachusetts','flag':'f/f2/Flag_of_Massachusetts.svg/46px-Flag_of_Massachusetts.svg.png'},{'name':'Michigan','flag':'b/b5/Flag_of_Michigan.svg/45px-Flag_of_Michigan.svg.png'},{'name':'Minnesota','flag':'b/b9/Flag_of_Minnesota.svg/46px-Flag_of_Minnesota.svg.png'},{'name':'Mississippi','flag':'4/42/Flag_of_Mississippi.svg/45px-Flag_of_Mississippi.svg.png'},{'name':'Missouri','flag':'5/5a/Flag_of_Missouri.svg/46px-Flag_of_Missouri.svg.png'},{'name':'Montana','flag':'c/cb/Flag_of_Montana.svg/45px-Flag_of_Montana.svg.png'},{'name':'Nebraska','flag':'4/4d/Flag_of_Nebraska.svg/46px-Flag_of_Nebraska.svg.png'},{'name':'Nevada','flag':'f/f1/Flag_of_Nevada.svg/45px-Flag_of_Nevada.svg.png'},{'name':'New Hampshire','flag':'2/28/Flag_of_New_Hampshire.svg/45px-Flag_of_New_Hampshire.svg.png'},{'name':'New Jersey','flag':'9/92/Flag_of_New_Jersey.svg/45px-Flag_of_New_Jersey.svg.png'},{'name':'New Mexico','flag':'c/c3/Flag_of_New_Mexico.svg/45px-Flag_of_New_Mexico.svg.png'},{'name':'New York','flag':'1/1a/Flag_of_New_York.svg/46px-Flag_of_New_York.svg.png'},{'name':'North Carolina','flag':'b/bb/Flag_of_North_Carolina.svg/45px-Flag_of_North_Carolina.svg.png'},{'name':'North Dakota','flag':'e/ee/Flag_of_North_Dakota.svg/38px-Flag_of_North_Dakota.svg.png'},{'name':'Ohio','flag':'4/4c/Flag_of_Ohio.svg/46px-Flag_of_Ohio.svg.png'},{'name':'Oklahoma','flag':'6/6e/Flag_of_Oklahoma.svg/45px-Flag_of_Oklahoma.svg.png'},{'name':'Oregon','flag':'b/b9/Flag_of_Oregon.svg/46px-Flag_of_Oregon.svg.png'},{'name':'Pennsylvania','flag':'f/f7/Flag_of_Pennsylvania.svg/45px-Flag_of_Pennsylvania.svg.png'},{'name':'Rhode Island','flag':'f/f3/Flag_of_Rhode_Island.svg/32px-Flag_of_Rhode_Island.svg.png'},{'name':'South Carolina','flag':'6/69/Flag_of_South_Carolina.svg/45px-Flag_of_South_Carolina.svg.png'},{'name':'South Dakota','flag':'1/1a/Flag_of_South_Dakota.svg/46px-Flag_of_South_Dakota.svg.png'},{'name':'Tennessee','flag':'9/9e/Flag_of_Tennessee.svg/46px-Flag_of_Tennessee.svg.png'},{'name':'Texas','flag':'f/f7/Flag_of_Texas.svg/45px-Flag_of_Texas.svg.png'},{'name':'Utah','flag':'f/f6/Flag_of_Utah.svg/45px-Flag_of_Utah.svg.png'},{'name':'Vermont','flag':'4/49/Flag_of_Vermont.svg/46px-Flag_of_Vermont.svg.png'},{'name':'Virginia','flag':'4/47/Flag_of_Virginia.svg/44px-Flag_of_Virginia.svg.png'},{'name':'Washington','flag':'5/54/Flag_of_Washington.svg/46px-Flag_of_Washington.svg.png'},{'name':'West Virginia','flag':'2/22/Flag_of_West_Virginia.svg/46px-Flag_of_West_Virginia.svg.png'},{'name':'Wisconsin','flag':'2/22/Flag_of_Wisconsin.svg/45px-Flag_of_Wisconsin.svg.png'},{'name':'Wyoming','flag':'b/bc/Flag_of_Wyoming.svg/43px-Flag_of_Wyoming.svg.png'}];

}]);
/**=========================================================
 * Module: ModalController
 * Provides a simple way to implement bootstrap modals from templates
 =========================================================*/

App.controller('ModalController', ["$scope", "$modal", "$log", function ($scope, $modal, $log) {
  'use strict';
  $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: '/myModalContent.html',
      controller: ModalInstanceCtrl,
      size: size
    });

    var state = $('#modal-state');
    modalInstance.result.then(function () {
      state.text('Modal dismissed with OK status');
    }, function () {
      state.text('Modal dismissed with Cancel status');
    });
  };

  // Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $modal service used above.

  var ModalInstanceCtrl = function ($scope, $modalInstance) {

    $scope.ok = function () {
      $modalInstance.close('closed');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };
  ModalInstanceCtrl.$inject = ["$scope", "$modalInstance"];

}]);

/**=========================================================
 * Module: NotificationController.js
 * Initializes the notifications system
 =========================================================*/

App.controller('NotificationController', ["$scope", "$routeParams", function($scope, $routeParams){
  'use strict';
  $scope.autoplace = function (context, source) {
    //return (predictTooltipTop(source) < 0) ?  "bottom": "top";
    var pos = 'top';
    if(predictTooltipTop(source) < 0)
      pos = 'bottom';
    if(predictTooltipLeft(source) < 0)
      pos = 'right';
    return pos;
  };

  // Predicts tooltip top position 
  // based on the trigger element
  function predictTooltipTop(el) {
    var top = el.offsetTop;
    var height = 40; // asumes ~40px tooltip height

    while(el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
    }
    return (top - height) - (window.pageYOffset);
  }

  // Predicts tooltip top position 
  // based on the trigger element
  function predictTooltipLeft(el) {
    var left = el.offsetLeft;
    var width = el.offsetWidth;

    while(el.offsetParent) {
      el = el.offsetParent;
      left += el.offsetLeft;
    }
    return (left - width) - (window.pageXOffset);
  }

}]);




/**=========================================================
 * Module: ScrollableDirective.js
 * Make a content box scrollable
 =========================================================*/

App.directive('scrollable', function() {
  'use strict';
  return {
    restrict: 'EA',
    link: function(scope, elem, attrs) {
      var defaultHeight = 285;

      attrs.height = attrs.height || defaultHeight;

      elem.slimScroll(attrs);

    }
  };
});
/**=========================================================
 * Module: AnimateEnabledDirective.js
 * Enable or disables ngAnimate for element with directive
 =========================================================*/

App.directive('animateEnabled', ['$animate', function ($animate) {
  'use strict';
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(function () {
        return scope.$eval(attrs.animateEnabled, scope);
      }, function (newValue) {
        $animate.enabled(!!newValue, element);
      });
    }
  };
}]);
/**=========================================================
 * Module: EmptyAnchorDirective.js
 * Disables null anchor behavior
 =========================================================*/

App.directive('href', function() {
  'use strict';
  return {
    restrict: 'A',
    compile: function(element, attr) {
        return function(scope, element) {
          if((attr.ngClick || attr.href === '' || attr.href === '#')
              && (!element.hasClass('dropdown-toggle')) ){
            element.on('click', function(e){
              e.preventDefault();
              // e.stopPropagation();
            });
          }
        };
      }
   };
});
/**=========================================================
 * Module: FullscreenDirective
 * Toggle the fullscreen mode on/off
 =========================================================*/

App.directive('toggleFullscreen', function() {
  'use strict';

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      // fullscreen not supported on ie
      if( /Edge\/|Trident\/|MSIE /.test(window.navigator.userAgent) )
        return $('[toggle-fullscreen]').addClass('hide');
      
      if (screenfull.enabled) {

        element.on('click', function (e) {
          e.preventDefault();

          screenfull.toggle();

          // Switch icon indicator
          if(screenfull.isFullscreen)
            $(this).children('em').removeClass('fa-expand').addClass('fa-compress');
          else
            $(this).children('em').removeClass('fa-compress').addClass('fa-expand');
        
        });

      } else {
        element.remove();
      }
    }
  };

});


/**=========================================================
 * Module: ResetKeyDirective.js
 * Removes a key from the browser storage via element click
 =========================================================*/

App.directive('resetKey',  ['$state', '$rootScope', function($state, $rootScope) {
  'use strict';

  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {
      
      var resetKey = attrs.resetKey;

      element.on('click', function (e) {
          e.preventDefault();

          if(resetKey) {
            delete $rootScope.$storage[resetKey];
            $state.go($state.current, {}, {reload: true});
          }
          else {
            $.error('No storage key specified for reset.');
          }
      });
    }
  };

}]);
/**=========================================================
 * Module: ToggleStateDirective.js
 * Toggle a classname from the BODY
 * Elements must have [toggle-state="CLASS-NAME-TO-TOGGLE"]
 * [no-persist] to avoid saving the sate in browser storage
 =========================================================*/

App.directive('toggleState', ['toggleStateService', function(toggle) {
  'use strict';
  
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      var $body = angular.element('body');

      $(element)
        .on('click', function (e) {
          e.preventDefault();
          var classname = attrs.toggleState;
          
          if(classname) {
            if( $body.hasClass(classname) ) {
              $body.removeClass(classname);
              if( ! attrs.noPersist)
                toggle.removeState(classname);
            }
            else {
              $body.addClass(classname);
              if( ! attrs.noPersist)
                toggle.addState(classname);
            }
            
          }

      });
    }
  };
  
}]);

/**=========================================================
 * Module: TitleCaseFilter.js
 * Convert any case to title
 =========================================================*/

App.filter('titlecase', function() {
  'use strict';
  return function(s) {
      s = ( s === undefined || s === null ) ? '' : s;
      return s.toString().toLowerCase().replace( /\b([a-z])/g, function(ch) {
          return ch.toUpperCase();
      });
  };
});
/**=========================================================
 * Module: BrowserDetectionService.js
 * Browser detection service
 =========================================================*/

App.service('browser', function(){
  "use strict";

  var matched, browser;

  var uaMatch = function( ua ) {
    ua = ua.toLowerCase();

    var match = /(opr)[\/]([\w.]+)/.exec( ua ) ||
      /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
      /(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) ||
      /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
      /(msie) ([\w.]+)/.exec( ua ) ||
      ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
      ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
      [];

    var platform_match = /(ipad)/.exec( ua ) ||
      /(iphone)/.exec( ua ) ||
      /(android)/.exec( ua ) ||
      /(windows phone)/.exec( ua ) ||
      /(win)/.exec( ua ) ||
      /(mac)/.exec( ua ) ||
      /(linux)/.exec( ua ) ||
      /(cros)/i.exec( ua ) ||
      [];

    return {
      browser: match[ 3 ] || match[ 1 ] || "",
      version: match[ 2 ] || "0",
      platform: platform_match[ 0 ] || ""
    };
  };

  matched = uaMatch( window.navigator.userAgent );
  browser = {};

  if ( matched.browser ) {
    browser[ matched.browser ] = true;
    browser.version = matched.version;
    browser.versionNumber = parseInt(matched.version);
  }

  if ( matched.platform ) {
    browser[ matched.platform ] = true;
  }

  // These are all considered mobile platforms, meaning they run a mobile browser
  if ( browser.android || browser.ipad || browser.iphone || browser[ "windows phone" ] ) {
    browser.mobile = true;
  }

  // These are all considered desktop platforms, meaning they run a desktop browser
  if ( browser.cros || browser.mac || browser.linux || browser.win ) {
    browser.desktop = true;
  }

  // Chrome, Opera 15+ and Safari are webkit based browsers
  if ( browser.chrome || browser.opr || browser.safari ) {
    browser.webkit = true;
  }

  // IE11 has a new token so we will assign it msie to avoid breaking changes
  if ( browser.rv )
  {
    var ie = "msie";

    matched.browser = ie;
    browser[ie] = true;
  }

  // Opera 15+ are identified as opr
  if ( browser.opr )
  {
    var opera = "opera";

    matched.browser = opera;
    browser[opera] = true;
  }

  // Stock Android browsers are marked as Safari on Android.
  if ( browser.safari && browser.android )
  {
    var android = "android";

    matched.browser = android;
    browser[android] = true;
  }

  // Assign the name and platform variable
  browser.name = matched.browser;
  browser.platform = matched.platform;


  return browser;

});
/**=========================================================
 * Module: ColorsService.js
 * Services to retrieve global colors
 =========================================================*/
 
App.factory('colors', ['appColors', function(appColors) {
  'use strict';
  return {
    byName: function(name) {
      return (appColors[name] || '#fff');
    }
  };

}]);

/**=========================================================
 * Module: SupportService.js
 * Checks for features supports on browser
 =========================================================*/

App.service('support', ["$document", "$window", function($document, $window) {
  'use strict';
  var support = {};
  var doc = $document[0];

  // Check for transition support
  // ----------------------------------- 
  support.transition = (function() {

      var transitionEnd = (function() {

          var element = doc.body || doc.documentElement,
              transEndEventNames = {
                  WebkitTransition: 'webkitTransitionEnd',
                  MozTransition: 'transitionend',
                  OTransition: 'oTransitionEnd otransitionend',
                  transition: 'transitionend'
              }, name;

          for (name in transEndEventNames) {
              if (element.style[name] !== undefined) return transEndEventNames[name];
          }
      }());

      return transitionEnd && { end: transitionEnd };
  })();

  // Check for animation support
  // ----------------------------------- 
  support.animation = (function() {

      var animationEnd = (function() {

          var element = doc.body || doc.documentElement,
              animEndEventNames = {
                  WebkitAnimation: 'webkitAnimationEnd',
                  MozAnimation: 'animationend',
                  OAnimation: 'oAnimationEnd oanimationend',
                  animation: 'animationend'
              }, name;

          for (name in animEndEventNames) {
              if (element.style[name] !== undefined) return animEndEventNames[name];
          }
      }());

      return animationEnd && { end: animationEnd };
  })();

  // Check touch device
  // ----------------------------------- 
  support.touch                 = (
      ('ontouchstart' in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/)) ||
      ($window.DocumentTouch && document instanceof $window.DocumentTouch)  ||
      ($window.navigator['msPointerEnabled'] && $window.navigator['msMaxTouchPoints'] > 0) || //IE 10
      ($window.navigator['pointerEnabled'] && $window.navigator['maxTouchPoints'] > 0) || //IE >=11
      false
  );

  return support;
}]);
/**=========================================================
 * Module: ToggleStateService.js
 * Services to share toggle state functionality
 =========================================================*/

App.service('toggleStateService', ['$rootScope', function($rootScope) {
  'use strict';
  var storageKeyName  = 'toggleState';

  // Helper object to check for words in a phrase //
  var WordChecker = {
    hasWord: function (phrase, word) {
      return new RegExp('(^|\\s)' + word + '(\\s|$)').test(phrase);
    },
    addWord: function (phrase, word) {
      if (!this.hasWord(phrase, word)) {
        return (phrase + (phrase ? ' ' : '') + word);
      }
    },
    removeWord: function (phrase, word) {
      if (this.hasWord(phrase, word)) {
        return phrase.replace(new RegExp('(^|\\s)*' + word + '(\\s|$)*', 'g'), '');
      }
    }
  };

  // Return service public methods
  return {
    // Add a state to the browser storage to be restored later
    addState: function(classname){
      var data = $rootScope.$storage[storageKeyName];
      
      if(!data)  {
        data = classname;
      }
      else {
        data = WordChecker.addWord(data, classname);
      }

      $rootScope.$storage[storageKeyName] = data;
    },

    // Remove a state from the browser storage
    removeState: function(classname){
      var data = $rootScope.$storage[storageKeyName];
      // nothing to remove
      if(!data) return;

      data = WordChecker.removeWord(data, classname);

      $rootScope.$storage[storageKeyName] = data;
    },
    
    // Load the state string and restore the classlist
    restoreState: function($elem) {
      var data = $rootScope.$storage[storageKeyName];
      
      // nothing to restore
      if(!data) return;
      $elem.addClass(data);
    }

  };

}]);
/**=========================================================
 * Module: TouchDragService.js
 * Services to add touch drag to a dom element
 =========================================================*/

App.service('touchDrag', ['$document', 'browser', function($document, browser) {
  'use strict';
  return {
    touchHandler: function (event) {
        var touch = event.changedTouches[0];

        var simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent({
            touchstart: "mousedown",
            touchmove: "mousemove",
            touchend: "mouseup"
        }[event.type], true, true, window, 1,
            touch.screenX, touch.screenY,
            touch.clientX, touch.clientY, false,
            false, false, false, 0, null);

        touch.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    },
    addTo: function (element) {
        element = element || $document;
        if(browser.mobile) {
          element.addEventListener("touchstart", this.touchHandler, true);
          element.addEventListener("touchmove", this.touchHandler, true);
          element.addEventListener("touchend", this.touchHandler, true);
          element.addEventListener("touchcancel", this.touchHandler, true);
        }
    }
  };
}]);

/**=========================================================
 * My Controller and Factory
 * w hadha el jdid
 =========================================================*/



App.factory('userService', ['$rootScope','$http','$cookies', function($rootScope,$http,$cookies) {
  'use strict';

  return {
    getUser : function(id){
      var req = {
                method: 'GET',
                url: $rootScope.app.url.db + '/user/' + id,
                cache: false,
              };
      $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
      return $http(req);
    },
    login : function(login,pw){
      var req = {
                 method : 'GET',
                 url : $rootScope.app.url.db + '/auth?where={"login":"' + login +'","pw":"' + pw +'"}&embedded={"user":1}',
                 cache : false,
                };
      return $http(req);
    },
    getDoc : function(id){
      var req = {
                method: 'GET',
                url: $rootScope.app.url.db + '/doc/' + id,
                cache: false,
              };
      $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
      return $http(req);
    },
    getDocWithUserId : function(id){
      var req = {
                method: 'GET',
                url: $rootScope.app.url.db + '/doc?where={"user":"'+ id + '"}',
                cache: false,
              };
      $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
      return $http(req);
    },
    addAvatar : function(d,src){
      var req = {
                method: 'POST',
                url: $rootScope.app.url.db + '/images/' + src,
                data: d,
                cache: false,
                headers: { 'Content-Type': undefined },
              };
      $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
      return $http(req);
    },
  };
  

}]);

App.factory('GestionUserService', ['$rootScope','$http','$cookies', function($rootScope,$http,$cookies) {
  'use strict';

  return {
    getGrade : function(){
      var req = {
                method: 'GET',
                url: $rootScope.app.url.db + '/grade',
                cache: false,
              };
      $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
      return $http(req);
    },
    getFonction : function(){
      var req = {
                method: 'GET',
                url: $rootScope.app.url.db + '/fct',
                cache: false,
              };
      $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
      return $http(req);
    },
    getStruct : function(){
      var req = {
                method: 'GET',
                url: $rootScope.app.url.db + '/struct',
                cache: false,
              };
      $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
      return $http(req);

    }
  };
  

}]);

/**=========================================================
 * Module: Auth.js
 * Authentificate Controller
 =========================================================*/

App.controller('Authentificate', ["$rootScope","$scope","$http","$cookies","$state",'userService', function ($rootScope,$scope,$http,$cookies,$state,userService) {
  'use strict';  

  $scope.init = function() {
    $scope.authl = "";
    $scope.authp = "";
    $scope.error = "";
  };

  $scope.login = function(){
      userService.login($scope.authl,$scope.authp)
        .success(function(data){
          if(data._items[0].user){
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            $cookies.putObject('tk',data._items[0].token,{'path':'/','expires' : tomorrow});
            var u = {"nom": data._items[0].user.nom , "pren" : data._items[0].user.pren , "uid" : data._items[0].user.uid , "avatar" : data._items[0].user.avatar };
            $cookies.putObject('u',u,{'path':'/','expires' : tomorrow});
            window.location.href = $rootScope.app.url.srv + "/#/app/dashboard";
          }else {
            $scope.init();
            $scope.error = "هناك خطأ الرجاء التثبت فالمعرف و كلمة السر";
          }
        })
        .error(function(err){
          $scope.init();
          $scope.error = "هناك خطأ الرجاء التثبت فالمعرف و كلمة السر";
      });
  };

}]);



App.directive('ngFiles', ['$parse', function ($parse) {

    function fn_link(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function (event) {
            onChange(scope, { $files: event.target.files });
        });
    };

    return {
        link: fn_link
    }
}]);

/**=========================================================
 * Module: Users 
 * users Controller
 =========================================================*/

App.controller('Users', ["$rootScope","$scope","$http","$cookies","$stateParams","toaster",'userService','GestionUserService', function ($rootScope,$scope,$http,$cookies,$stateParams,toaster,userService,GestionUserService){
  'use strict';

  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');
  var formdata = new FormData();

  if($stateParams.id){
    userService.getUser($stateParams.id).success(function(data,status){
      $scope.userav  = data;
      $scope.userav.dtenter = new Date($scope.userav.dtenter);
      $scope.userav._updated = new Date($scope.userav._updated);
      $scope.userav.born = new Date($scope.userav.born);

      if($scope.userav.familystate){
        if($scope.userav.familystate.cong){
          if($scope.userav.familystate.cong.born){
            $scope.userav.familystate.cong.born= new Date($scope.userav.familystate.cong.born);
          }
        }

        if($scope.userav.familystate.kids[0]){
          var i = 0;
          for(var i = 0 ; i <  $scope.userav.familystate.kids.length ; i++){
             if($scope.userav.familystate.kids[i].born){
              $scope.userav.familystate.kids[i].born = new Date($scope.userav.familystate.kids[i].born);
             }
          }
        }
      }
      

      
      if($scope.userav.edu){
        if($scope.userav.edu.dt){
          $scope.userav.edu.dt = new Date($scope.userav.edu.dt);
        }
      }

      

      if($scope.userav.certif){
        for(var i = 0 ; i < $scope.userav.certif.length ; i ++){
          $scope.userav.certif[i].f = new Date($scope.userav.certif[i].f);
          $scope.userav.certif[i].to = new Date($scope.userav.certif[i].to);
        }
      }

      if($scope.userav.grade){
        for(var i = 0 ; i < $scope.userav.grade.length ; i++){
          if($scope.userav.grade[i].dt){
            $scope.userav.grade[i].dt = new Date($scope.userav.grade[i].dt);
          }
        }
      }

      if($scope.userav.fct){
        for(var i = 0 ; i < $scope.userav.fct.length ; i++){
          if($scope.userav.fct[i].dt){
            $scope.userav.fct[i].dt = new Date($scope.userav.fct[i].dt);
          }
        }
      }

    });
  }else if($stateParams.doc){
    userService.getDoc($stateParams.doc).success(function(d,status){
      $scope.editdoc = d;
      $scope.avatar = d.src;
      $scope.editdoc.dt = new Date(d.dt);
    });
  }else if($stateParams.cert && $stateParams.nb){
    userService.getUser($stateParams.cert).success(function(d,status){
      $rootScope.certs = d.certif;
      $scope.editcert = d.certif[$stateParams.nb];
      $scope.editcert.f = new Date($scope.editcert.f);
      $scope.editcert.to = new Date($scope.editcert.to);
      $scope.nb = $stateParams.nb;
      $scope.id = d._id;
      $scope.etag = d._etag;
      $scope.avatar = $scope.editcert.src;
    });
  }else if ($stateParams.ech && $stateParams.nb){
    userService.getUser($stateParams.ech).success(function(e,status){
      $rootScope.echs = e.ech;
      $scope.editech = e.ech[$stateParams.nb];
      $scope.editech.dt = new Date($scope.editech.dt);
      $scope.nb = $stateParams.nb;
      $scope.id = e._id;
      $scope.etag = e._etag;
    });
  }else if($stateParams.fct && $stateParams.nb){
    userService.getUser($stateParams.fct).success(function(e,status){
      $rootScope.foncts = e.fct;
      $scope.editfct = e.fct[$stateParams.nb];
      $scope.editfct.dt = new Date($scope.editfct.dt);
      $scope.nb = $stateParams.nb;
      $scope.id = e._id;
      $scope.etag = e._etag;
    });
  }else if($stateParams.grad && $stateParams.nb){
    userService.getUser($stateParams.grad).success(function(e,status){
      $rootScope.gradess = e.grade;
      $scope.editgrade = e.grade[$stateParams.nb];
      $scope.editgrade.dt = new Date($scope.editgrade.dt);
      $scope.nb = $stateParams.nb;
      $scope.id = e._id;
      $scope.etag = e._etag;
    });
  }else if($stateParams.state && $stateParams.nb){
    userService.getUser($stateParams.state).success(function(e,status){
      $rootScope.states = e.state;
      $scope.editstate = e.state[$stateParams.nb];
      $scope.editstate.dt = new Date($scope.editstate.dt);
      $scope.nb = $stateParams.nb;
      $scope.id = e._id;
      $scope.etag = e._etag;
    });
  }else if($stateParams.aff && $stateParams.nb){
    userService.getUser($stateParams.aff).success(function(e,status){
      $rootScope.affs = e.aff;
      $scope.editaff = e.aff[$stateParams.nb];
      $scope.editaff.dt = new Date($scope.editaff.dt);
      $scope.nb = $stateParams.nb;
      $scope.id = e._id;
      $scope.etag = e._etag;
    });
  }
  
  $scope.setFile = function(element) {
    $scope.currentFile = element.files[0];
     var reader = new FileReader();

    reader.onload = function(event) {
      $scope.avatar = event.target.result;
      $scope.$apply();

    }
    reader.readAsDataURL(element.files[0]);
  }
  
  $scope.getTheFiles = function ($files) {
      angular.forEach($files, function (value, key) {
          formdata.append("img", value);
      });
  };
  
  $scope.init = function(){
        $scope.uid = "";
        $scope.nom = "";
        $scope.pren = "";
        $scope.father = "";
        $scope.mother = "";
        $scope.gender = "";
        $scope.born = "";
        $scope.dtenter = "";
        $scope.dtcin = "";
        $scope.cin = "";
        $scope.adrcin = "";
        $scope.tel = "";
        $scope.email = "";
        $scope.address = "";
        $scope.city = "";
        $scope.title = "";
        $scope.dt = "";
        $scope.ref = "";
        $scope.imginput = "";
        $scope.etag = "";
        $scope.n = "";
        $scope.niv = "";
        $scope.univ = "";
        $scope.r = "";
        $scope.cong.name = "";
        $scope.cong.job = "";
        $scope.cong.born = "";
        $scope.cong.tel = "";
        $scope.kid1 = {};
        $scope.kid2 = {};
        $scope.kid3 = {};
        $scope.kid4 = {};
        $scope.st = "";
        $scope.id = "";

  };

  $scope.success = function(msg){
    $scope.toaster = {
      type:  'success',
      title: 'اظافة',
      text:  'لقد تمت الاظافة بنجاح'
    };
    if(msg){
      $scope.toaster.text = msg;
    }
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.error = function(){
    $scope.toaster = {
      type:  'error',
      title: 'خطأ',
      text:  'هناك خطأ تثبت في المعلومات'
    };
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };


  $scope.preAddUser = function(){
    userService.addAvatar(formdata,'user')
      .success(function(data){
        $scope.addUser(data);
      })
      .error(function(err){
        $scope.error();
    });
  };

  $scope.addUser = function(avatar){
        var dtcin = new Date($scope.dtcin).toGMTString();
        var born = new Date($scope.born).toGMTString();
        var dtenter = new Date($scope.dtenter).toGMTString();
        var user = {
              "uid" : $scope.uid , "nom" : $scope.nom ,"father" : $scope.father,
              "pren" : $scope.pren, "mother" : $scope.mother, "gender" : $scope.gender,
              "born" : born , "dtenter" : dtenter ,
              "cin" : {"num" : $scope.cin , "address" : $scope.adrcin ,"dt" : dtcin } ,
              "tel" : $scope.tel,"email" : $scope.email , 
              "location" : {"address" : $scope.address , "city" : $scope.city},
              "avatar" : avatar,
            };

        var req = {
                method: 'POST',
                url: $rootScope.app.url.db + '/user',
                data: user,
                cache: false,
              };
        $http(req)
          .success(function(data){
            if(data._status ==="OK")
              $scope.success();
              $scope.init();
          })
          .error(function(err){
            $scope.error();
          });   
  };

  $scope.updateUid = function($model){
    $scope.uid = $model.id;
    $scope.etag = $model.etag;
    $scope.certif = $model.certif;
  };

  $scope.preAddDoc = function(){
    userService.addAvatar(formdata,'doc')
      .success(function(data){
        $scope.addDoc(data);
      })
      .error(function(err){
        $scope.error();
    });
  };

  $scope.addDoc = function(src){
    var dt = new Date($scope.dt).toGMTString();
    var doc = {"src" : src ,"title" : $scope.title,"ref": $scope.ref ,"dt" : dt,"user" : $scope.id  };

    var req = {
                method: 'POST',
                url: $rootScope.app.url.db + '/doc',
                data: doc,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.Titulaire = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();
    var doc = {"titulaire" : dt};

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: doc,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success("تم ترسيم العون بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.preAddEdu = function(){
    userService.addAvatar(formdata,'edu')
      .success(function(data){
        $scope.setEdu(data);
      })
      .error(function(err){
        $scope.error();
    });
  };

  $scope.setEdu = function(src){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();
    var edu = {"edu" : {"univ" : $scope.univ ,"title" : $scope.title,"niv": $scope.niv ,"dt" : dt ,"nbr" : $scope.nbr , "src" : src } };

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: edu,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.preAddCert = function(){
    userService.addAvatar(formdata,'cert')
      .success(function(data){
        $scope.addCert(data);
      })
      .error(function(err){
        $scope.error();
    });
  };

  $scope.addCert = function(src){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var f = new Date($scope.f).toGMTString();
    var to = new Date($scope.to).toGMTString();
    var cert = [{"ref" : $scope.ref ,"title" : $scope.title ,"f" : f,"to" : to ,"src" : src } ];
    

    if($scope.certifs){
      cert = cert.concat($scope.certifs);
    }

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"certif" : cert },
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };


  $scope.addEch = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();
    var ech = [{"ref" : $scope.ref ,"deg" : $scope.deg ,"dt" : dt} ];
    

    if($scope.echs){
      ech = ech.concat($scope.echs);
    }
    

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"ech" : ech },
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.setFam = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var kids = [];
    if($scope.cong.born){
      $scope.cong.born = new Date($scope.cong.born).toGMTString();
    }else {
      delete $scope.cong.born;
    }

    if($scope.kid1.born){
      $scope.kid1.born = new Date($scope.kid1.born).toGMTString();
      if($scope.kid1.name){
        kids.push($scope.kid1);
      }
    }

    if($scope.kid2.born){
      $scope.kid2.born = new Date($scope.kid2.born).toGMTString();
      if($scope.kid2.name){
        kids.push($scope.kid2);
      }
    }

    if($scope.kid3.born){
      $scope.kid3.born = new Date($scope.kid3.born).toGMTString();
      if($scope.kid3.name){
        kids.push($scope.kid3);
      }
    }

    if($scope.kid4.born){
      $scope.kid4.born = new Date($scope.kid4.born).toGMTString();
      if($scope.kid4.name){
        kids.push($scope.kid4);
      }
    }
    
    var fam = {
                "familystate" : {
                  "r" : $scope.r,
                  "cong" : $scope.cong,
                  "kids" : kids,
                }
              };

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: fam,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.getU = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.state){
        $scope.statetmp = data.state;
      }

      if(data.edu){
        $scope.title = data.edu.title;
        $scope.dt = new Date(data.edu.dt);
        $scope.niv = data.edu.niv;
        $scope.univ = data.edu.univ;
        $scope.nbr = data.edu.nbr;
        $scope.avatar = data.edu.src;
      }
      if(data.certif){
        $scope.certifs = data.certif;
      }

      
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.get4Doc = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.get4Fct = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.id = data._id;

      if(data.fct){
        $scope.fonctions = data.fct;
      }

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.get4Grad = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.id = data._id;

      if(data.grade){
        $scope.grades = data.grade;
      }

      

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.getU4Ech = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.ech){
        $scope.echs = data.ech;
      }
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.getU4T = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.travlist){
        $scope.travlist = data.travlist;
      }

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };


  $scope.get4State = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.state){
        $scope.sts = data.state;
      }else{
        $scope.error();
      }


      if(data.travlist){
        $scope.travlist = data.travlist;
      }

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };


  $scope.get4Aff = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.aff){
        $scope.afs = data.aff;
      }else{
        $scope.error();
      }
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.getU4cert = function(){
    console.log($scope.uid);
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;
      if(data.certif){
        $scope.certifs = data.certif;
      }
      
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.getU4family = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;
      if(data.familystate){
        $scope.r = data.familystate.r;
        $scope.cong = data.familystate.cong;
        $scope.cong.born = new Date(data.familystate.cong.born);
        if(data.familystate.kids[0]){
          $scope.kid1 = data.familystate.kids[0];
          $scope.kid1.born = new Date(data.familystate.kids[0].born);
        }
        if(data.familystate.kids[1]){
          $scope.kid2 = data.familystate.kids[1];
          $scope.kid2.born = new Date(data.familystate.kids[1].born);
        }
        if(data.familystate.kids[2]){
          $scope.kid3 = data.familystate.kids[2];
          $scope.kid3.born = new Date(data.familystate.kids[2].born);
        }
        if(data.familystate.kids[3]){
          $scope.kid4 = data.familystate.kids[3];
          $scope.kid4.born = new Date(data.familystate.kids[3].born);
        }

      }

      
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.getU4DelDay = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.delday){
        $scope.deldays = data.delday;
      }

      if(data.travlist){
        $scope.travlist = data.travlist;
      }

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };
  
  $scope.addDelDay = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var f = new Date($scope.f).toGMTString();
    var to = new Date($scope.to).toGMTString();
    var mf = moment(f);
    var mto = moment(to);

    var day = mto.diff(mf,'days');

    var d = [{
              "days" : day,
              "ref" : $scope.ref,
              "f" : f,
              "to" : to
            }];

    if($scope.deldays){
      d = d.concat($scope.deldays);
    }

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"delday": d},
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.setState = function(){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    var dt = new Date($scope.dt).toGMTString();
    var state = [{
                  "st" : $scope.st,
                  "dt" : dt,
                  "ref" : $scope.ref,
                }];

    if($scope.statetmp){
      state = state.concat($scope.statetmp);
    }

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"state" : state },
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.preEditDoc = function(){
    if(formdata.get("img")){
      userService.addAvatar(formdata,'doc')
        .success(function(data){
          $scope.editDoc(data);
        })
        .error(function(err){
          $scope.error();
      });
    }else {
      $scope.editDoc();
    }
    
  };

  $scope.editDoc = function(src){

    $http.defaults.headers.common['If-Match'] = $scope.editdoc._etag ;

    var dt = new Date($scope.editdoc.dt).toGMTString();

    var doc = {};

    if( src){
      doc = {"src" : src ,"title" : $scope.editdoc.title,"ref": $scope.editdoc.ref ,"dt" : dt };
    }else {
      doc = {"title" : $scope.editdoc.title,"ref": $scope.editdoc.ref ,"dt" : dt };
    }
    

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/doc/' + $scope.editdoc._id,
                data: doc,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };


  $scope.getDoc = function(){
    userService.getDocWithUserId($scope.id).
      success(function(data,status){

        if(data._items[0]){
          $scope.id = "";
          $scope.docs = data._items;
        }else {
          $scope.error();
          $scope.id = "";
        }
      })
      .error(function(err){
        $scope.error();
        $scope.id = "";
      });
  };


  $scope.preEditCert = function(){

    if(formdata.get("img")){
      userService.addAvatar(formdata,'cert')
        .success(function(data){
          $scope.editCert(data);
        })
        .error(function(err){
          $scope.error();
      });
    }else {
      $scope.editCert();
    }
    
  };

  $scope.editCert = function(src){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    $scope.editcert.f = new Date($scope.editcert.f).toGMTString();
    $scope.editcert.to = new Date($scope.editcert.to).toGMTString();


    if(src){
      $scope.editcert.src = src;
    }
    
    $rootScope.certs[$scope.nb] = $scope.editcert ;

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"certif" : $rootScope.certs},
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.editEch = function(){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    $scope.editech.dt = new Date($scope.editech.dt).toGMTString();
    
    $rootScope.echs[$scope.nb] = $scope.editech ;

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"ech" : $rootScope.echs},
                cache: false,
              };
    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.editFct = function(){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    $scope.editfct.dt = new Date($scope.editfct.dt).toGMTString();

    $scope.editfct.fct = $scope.editfct.fct.title;
    
    $rootScope.foncts[$scope.nb] = $scope.editfct ;

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"fct" : $rootScope.foncts},
                cache: false,
              };
    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.editGrad = function(){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    $scope.editgrade.dt = new Date($scope.editgrade.dt).toGMTString();

    $scope.editgrade.grade = $scope.editgrade.grade.title;
    
    $rootScope.gradess[$scope.nb] = $scope.editgrade ;

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"grade" : $rootScope.gradess},
                cache: false,
              };
    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.editState = function(){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    $scope.editstate.dt = new Date($scope.editstate.dt).toGMTString();

    
    $rootScope.states[$scope.nb] = $scope.editstate ;

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"state" : $rootScope.states},
                cache: false,
              };
    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };


  $scope.editAff = function(){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    $scope.editaff.dt = new Date($scope.editaff.dt).toGMTString();

    $scope.editaff.struct = $scope.struct.struct;
    $scope.editaff.substruct = $scope.substruct.substruct;
    $scope.editaff.subsubstruct = $scope.subsubstruct;

    
    $rootScope.affs[$scope.nb] = $scope.editaff ;

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"aff" : $rootScope.affs},
                cache: false,
              };
    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.initFctOptions = function(){
    GestionUserService.getFonction()
    .success(function(data){
      $scope.fcts = data._items;
    });

  };

  $scope.initGradeOptions = function(){
    GestionUserService.getGrade()
    .success(function(data){
      $scope.gs = data._items;
    });
  };

  $scope.initStructOptions = function(){
    GestionUserService.getStruct()
    .success(function(data){
      $scope.structs = data._items;
    });
  };

  $scope.initSubStructOptions = function(data){
    $scope.substructs = data.substruct;
  };

  $scope.initSubSubStructOptions = function(data){
    $scope.subsubstructs = data.subsubstruct;
  };


  $scope.datediff = function(f,to){
    moment.locale('ar-tn');

    var b = moment(new Date(t));
    var a = moment(new Date(to));


    var y = a.diff(b, 'year');
    b.add(y, 'years');

    var m = a.diff(b, 'months');
    b.add(m, 'months');

    var d = a.diff(b, 'days');
    return {"d":d,"m":m,"y":y};
  };

  $scope.dateexplod = function(tabdate){
    var d = 0;
    var m = 0;
    var y = 0;

    var tmpd = 0;

    var tmpm = 0;

    for(var i = 0 ; i < tabdate.length ; i++){
      d += tabdate[i].d;
      m += tabdate[i].m;
      y += tabdate[i].y;
    }

    tmpd = Math.floor(d/30);
    d = d % 30;

    m += tmpd;
    tmpm = Math.floor(m / 12);

    m = m % 12;

    y+= tmpm;

    return {"d":d,"m":m,"y":y};

  };

  $scope.addListTrav = function(lists,struct,grade,f,to,c,ref){
    var diff = $scope.datediff(f,to);
    var lst = {
              "struct": struct,"grade" : grade,"f" : f , 
              "to":to ,"cause" : c , "m":diff.m, "y" : diff.y , "d" : diff.d, "ref" : ref 
            };
    if(lists){
      lists.push(lst);
      return lists;
    }
    return [lst];
    
  };
  

}]);

App.controller('GestionUser',["$rootScope","$scope","$http","$cookies","toaster","GestionUserService","userService",function($rootScope,$scope,$http,$cookies,toaster,GestionUserService,userService){
  'use strict';
  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');

  $scope.init = function(){
        $scope.uid = "";
        $scope.nom = "";
        $scope.pren = "";
        $scope.father = "";
        $scope.mother = "";
        $scope.gender = "";
        $scope.born = "";
        $scope.dtenter = "";
        $scope.dtcin = "";
        $scope.cin = "";
        $scope.adrcin = "";
        $scope.tel = "";
        $scope.email = "";
        $scope.address = "";
        $scope.city = "";
        $scope.title = "";
        $scope.dt = "";
        $scope.ref = "";
        $scope.imginput = "";
        $scope.etag = "";
        $scope.nbr = "";
        $scope.niv = "";
        $scope.univ = "";
        $scope.r = "";
        $scope.cong.name = "";
        $scope.cong.job = "";
        $scope.cong.born = "";
        $scope.cong.tel = "";
        $scope.kid1 = {};
        $scope.kid2 = {};
        $scope.kid3 = {};
        $scope.kid4 = {};
        $scope.st = "";
        $scope.id = "";
        $scope.fct = "";
        $scope.etag = "";
        $scope.struct = "";
        $scope.substruct = "";
        $scope.subsubstruct = "";

  };

  $scope.success = function(msg){
    $scope.toaster = {
      type:  'success',
      title: 'اظافة',
      text:  'لقد تمت الاظافة بنجاح'
    };
    if(msg){
      $scope.toaster.text = msg;
    }
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.error = function(){
    $scope.toaster = {
      type:  'error',
      title: 'خطأ',
      text:  'هناك خطأ تثبت في المعلومات'
    };
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.getU = function(){
    userService.getUser($scope.uid)
    .success(function(data){
        $scope.etag = data._etag;
        $scope.id = data._id;
        if(data.fct){
          $scope.fcttmp = data.fct;
        }

        if(data.grade){
          $scope.gradetmp = data.grade;
        }

        if(data.aff){
          $scope.afftmp = data.aff;
        }

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.getU4Uuser = function(){
    userService.getUser($scope.u.uid)
    .success(function(data){
        $scope.u = data;
        $scope.u.dtenter = new Date( data.dtenter);
        $scope.u.cin.dt = new Date(data.cin.dt);
        $scope.u.born = new Date(data.born);
        delete $scope.u._updated;
        delete $scope.u._created;
        delete $scope.u._links;
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.initFctOptions = function(){
    GestionUserService.getFonction()
    .success(function(data){
      $scope.fcts = data._items;
    });

  };

  $scope.initGradeOptions = function(){
    GestionUserService.getGrade()
    .success(function(data){
      $scope.gs = data._items;
    });
  };

  $scope.initStructOptions = function(){
    GestionUserService.getStruct()
    .success(function(data){
      $scope.structs = data._items;
    });
  };

  $scope.initSubStructOptions = function(data){
    $scope.substructs = data.substruct;
  };

  $scope.initSubSubStructOptions = function(data){
    $scope.subsubstructs = data.subsubstruct;
  };

  $scope.addFct = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();

    var f = [{
              "fct" : $scope.fct.title,
              "ref" : $scope.ref,
              "dt" : dt,
            }];


    if($scope.fcttmp){
      f = f.concat($scope.fcttmp);
    }

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"fct": f},
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.addGrade = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();

    var g = [{
              "grade" : $scope.grade.title,
              "ref" : $scope.ref,
              "dt" : dt,
            }];
    /*var lst = [];

    //lists,struct,grade,f,to,c,ref
    if($scope.travlist){
      lst = $scope.addListTrav($scope.travlist,$scope.,$scope.gradetmp[0].grade ,);
    }*/

    if($scope.gradetmp){
      g = g.concat($scope.gradetmp);

    }

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"grade": g},
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });
  };


  $scope.addAff = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();

    var aff = [{
              "struct" : $scope.struct.struct,
              "substruct" : $scope.substruct.substruct,
              "subsubstruct" : $scope.subsubstruct,
              "ref" : $scope.ref,
              "dt" : dt,
            }];

    if($scope.afftmp){
      aff = aff.concat($scope.afftmp);
    }

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"aff": aff},
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.updateUser = function(){
    $http.defaults.headers.common['If-Match'] = $scope.u._etag ;

    $scope.u.dtenter = new Date( $scope.u.dtenter).toGMTString();
    $scope.u.cin.dt = new Date($scope.u.cin.dt).toGMTString();
    $scope.u.born = new Date($scope.u.born).toGMTString();

    var u = {};
    angular.copy($scope.u,u);

    delete u._id;
    delete u._etag;


    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db +'/user/' + $scope.u._id,
                data: u,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success("تم التحيين بنجاح");
            $scope.u = {};
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.datediff = function(f,to){
    moment.locale('ar-tn');

    var b = moment(new Date(t));
    var a = moment(new Date(to));


    var y = a.diff(b, 'year');
    b.add(y, 'years');

    var m = a.diff(b, 'months');
    b.add(m, 'months');

    var d = a.diff(b, 'days');
    return {"d":d,"m":m,"y":y};
  };

  $scope.dateexplod = function(tabdate){
    var d = 0;
    var m = 0;
    var y = 0;

    var tmpd = 0;

    var tmpm = 0;

    for(var i = 0 ; i < tabdate.length ; i++){
      d += tabdate[i].d;
      m += tabdate[i].m;
      y += tabdate[i].y;
    }

    tmpd = Math.floor(d/30);
    d = d % 30;

    m += tmpd;
    tmpm = Math.floor(m / 12);

    m = m % 12;

    y+= tmpm;

    return {"d":d,"m":m,"y":y};

  };

  $scope.addListTrav = function(lists,struct,grade,f,to,c,ref){
    var diff = $scope.datediff(f,to);
    var lst = {
              "struct": struct,"grade" : grade,"f" : f , 
              "to":to ,"cause" : c , "m":diff.m, "y" : diff.y , "d" : diff.d, "ref" : ref 
            };
    if(lists){
      lists.push(lst);
      return lists;
    }
    return [lst];
    
  };

}]);

App.controller('ConfigStatic',["$rootScope","$scope","$http","$cookies","$stateParams","toaster","GestionUserService",function($rootScope,$scope,$http,$cookies,$stateParams,toaster,GestionUserService){
  'use strict';
  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');

  if($stateParams.fct && $stateParams.id && $stateParams.etag){
    $scope.editfct = $stateParams.fct;
    $scope.id = $stateParams.id;
    $scope.etag = $stateParams.etag;
  }else if($stateParams.grade && $stateParams.id && $stateParams.etag){
    $scope.editgrad = $stateParams.grade;
    $scope.id = $stateParams.id;
    $scope.etag = $stateParams.etag;
  }

  $scope.initFct = function(){
    $scope.fct= "";
  };

  $scope.initGrade = function(){
    $scope.grade = "";
  }

  $scope.success = function(msg){
    $scope.toaster = {
      type:  'success',
      title: 'اظافة',
      text:  'لقد تمت الاظافة بنجاح'
    };
    if(msg){
      $scope.toaster.text = msg;
    }
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.error = function(){
    $scope.toaster = {
      type:  'error',
      title: 'خطأ',
      text:  'هناك خطأ تثبت في المعلومات'
    };
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.addFct = function(){
    var req = {
                method: 'POST',
                url: $rootScope.app.url.db + '/fct',
                data: {"title": $scope.fct},
                cache: false,
              };
    $http(req)
      .success(function(data){
        if(data._status ==="OK"){
          $scope.initFct();
          $scope.success();
          $scope.getfct();
        }
      })
      .error(function(err){
        $scope.error();
      });
  };

  $scope.getfct = function(){
    GestionUserService.getFonction()
      .success(function(f){
        $scope.FCT = f._items;
      })
      .error(function(err){
        $scope.error();
      });
  };

  $scope.editFct = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/fct/' + $scope.id,
                data: {"title": $scope.editfct},
                cache: false,
              };
    $http(req)
      .success(function(data){
        if(data._status ==="OK"){
          $scope.success("تم التحيين بنجاح");
          $scope.getfct();
        }
      })
      .error(function(err){
        $scope.error();
      });
  };

  $scope.addGrade = function(){
    var req = {
                method: 'POST',
                url: $rootScope.app.url.db + '/grade',
                data: {"title" : $scope.grade } ,
                cache: false,
              };
    $http(req)
      .success(function(data){
        if(data._status ==="OK"){
          $scope.initGrade();
          $scope.getGrad();
          $scope.success();
        }
      })
      .error(function(err){
        $scope.error();
      });
  };

  $scope.getGrad = function(){
    GestionUserService.getGrade()
      .success(function(g){
        $scope.GRADE = g._items;
      })
      .error(function(err){
        $scope.error();
      });
  };

  $scope.editGrade = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/grade/' + $scope.id,
                data: {"title": $scope.editgrad },
                cache: false,
              };
    $http(req)
      .success(function(data){
        if(data._status ==="OK"){
          $scope.success("تم التحيين بنجاح");
          $scope.getGrad();
        }
      })
      .error(function(err){
        $scope.error();
      });
  };

}]);


App.controller('SearchSpec',["$rootScope","$scope","$http","$cookies","$stateParams","$filter","toaster","GestionUserService",function($rootScope,$scope,$http,$cookies,$stateParams,$filter,toaster,GestionUserService){
  'use strict';
  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');

  $scope.Clear = function(){
    delete $scope.res;
    $scope.q = "";
    $scope.gender = "";
    $scope.r = "";
    $scope.st = "";
    $scope.nom  = false;
    $scope.cin = false;
    $scope.uid = false;
    $scope.pren = false;
    
    if($scope.fct){
      $scope.fct.title = "";
    }
    if($scope.grade){
      $scope.grade.title = "";
    }
    
  };

  $scope.Search = function(){
    $scope.qry = '/user?where={';

    if($scope.gender){
      $scope.qry += '"gender":"'+$scope.gender+'"';
    }

    if($scope.r && !$scope.gender){
      $scope.qry += '"familystate.r":"'+$scope.r+'"';
    }else if($scope.r ){
      $scope.qry += ',"familystate.r":"'+$scope.r+'"';
    }

    if($scope.fct && !$scope.gender && !$scope.r){
      $scope.qry += '"fct.0.fct":"'+$scope.fct.title +'"';
    }else if($scope.fct ){
      $scope.qry += ',"fct.0.fct":"'+$scope.fct.title +'"';
    }

    if($scope.grade && !$scope.gender && !$scope.r && !$scope.fct){
      $scope.qry += '"grade.0.grade":"'+$scope.grade.title +'"';
    }else if($scope.grade ){
      $scope.qry += ',"grade.0.grade":"'+$scope.grade.title +'"';
    }

    if($scope.st && !$scope.gender && !$scope.r && !$scope.fct && !$scope.grade){
      $scope.qry += '"state.0.st":"'+$scope.st +'"';
    }else if($scope.st ){
      $scope.qry += ',"state.0.st":"'+$scope.st +'"';
    }

    if($scope.nom && !$scope.grade && !$scope.gender && !$scope.r && !$scope.fct && !$scope.st){
      $scope.qry += '"nom":"'+$scope.q +'"';
    }else if($scope.nom){
      $scope.qry += ',"nom":"'+$scope.q +'"';
    }

    if($scope.pren && !$scope.grade && !$scope.gender && !$scope.r && !$scope.fct && !$scope.st){
      $scope.qry += '"pren":"'+$scope.q +'"';
    }else if($scope.pren){
      $scope.qry += ',"pren":"'+$scope.q +'"';
    }

    if($scope.cin && !$scope.grade && !$scope.gender && !$scope.r && !$scope.fct && !$scope.st){
      $scope.qry += '"cin.num":"'+$scope.q +'"';
    }else if($scope.cin){
      $scope.qry += ',"cin.num":"'+$scope.q +'"';
    }

    if($scope.uid && !$scope.grade && !$scope.gender && !$scope.r && !$scope.fct && !$scope.st){
      $scope.qry += '"uid":"'+$scope.q +'"';
    }else if($scope.uid){
      $scope.qry += ',"uid":"'+$scope.q +'"';
    }

    if($scope.struct && !$scope.grade && !$scope.gender && !$scope.r && !$scope.fct && !$scope.st){
      $scope.qry += '"aff.0.struct":"'+ $scope.struct.struct +'"';
    }else if($scope.struct){
      $scope.qry += ',"aff.0.struct":"'+ $scope.struct.struct +'"';
    }

    if($scope.substruct && !$scope.grade && !$scope.gender && !$scope.r && !$scope.fct && !$scope.st && !$scope.struct){
      $scope.qry += '"aff.0.substruct":"'+ $scope.substruct.substruct +'"';
    }else if($scope.substruct){
      $scope.qry += ',"aff.0.substruct":"'+ $scope.substruct.substruct +'"';
    }

    if($scope.subsubstruct && !$scope.grade && !$scope.grade && !$scope.gender && !$scope.r && !$scope.fct && !$scope.st && !$scope.struct && !$scope.substruct){
      $scope.qry += '"aff.0.subsubstruct":"'+ $scope.subsubstruct +'"';
    }else if($scope.uid){
      $scope.qry += ',"aff.0.subsubstruct":"'+ $scope.subsubstruct +'"';
    }

    if(!$scope.limit){
      $scope.qry += '}&max_results=10';
    }else {
      $scope.qry += '}&max_results=' + $scope.limit;
    }

    

    if($scope.page){
      $scope.qry += '&page=' + $scope.page;
    }else {
      $scope.qry += '&page=1';
      $scope.page = 1;
    }
    
      var req = {
                 method : 'GET',
                 url : $rootScope.app.url.db + $scope.qry,
                 cache : false,
                };
      $http(req)
        .success(function(data){
          if(!data._items[0]){
            $scope.NotFound();
          }else {
            $scope.res = data._items;
            $scope.count = data._meta.total;
            if(!$scope.limit){
              $scope.nbrpage = data._meta.total / 10;
            }else{
              $scope.nbrpage = data._meta.total / $scope.limit;
            }
            if($scope.nbrpage > 1){
              $scope.listpage = [];
              for(var i = 0 ; i < $scope.nbrpage ; i ++){
                $scope.listpage[i] = i+ 1;
              }
            }
          }
          
        })
        .error(function(err){
          console.log(err);
        });
  };

  $scope.SearchFct = function(){

    $scope.qry = '/user?where={';

    if($scope.fct){
      $scope.qry += '"fct.0.fct":"'+$scope.fct.title +'"';
    }

    if($scope.to && $scope.f){
      var to = new Date($scope.to).toGMTString();
      var f = new Date($scope.f).toGMTString();

      $scope.qry += ',"fct.0.dt":{"$gte":"'+ f +'","$lte":"'+ to +'"}';

    }else if($scope.to){
      var to = new Date($scope.to).toGMTString();
      $scope.qry += ',"fct.0.dt":{"$lte":"'+ to +'"}';

    }else if($scope.f){
      var f = new Date($scope.f).toGMTString();
      $scope.qry += ',"fct.0.dt":{"$gte":"'+ f +'"}';
    }

    $scope.qry += '}&max_results=200';

    
      var req = {
                 method : 'GET',
                 url : $rootScope.app.url.db + $scope.qry,
                 cache : false,
                };
      $http(req)
        .success(function(data){
          if(!data._items[0]){
            $scope.NotFound();
          }else {

            for(var i = 0 ;i < data._meta.total ; i++){
              data._items[i].born = new Date(data._items[i].born);
              data._items[i].dtenter = new Date(data._items[i].dtenter);
              data._items[i].fct[0].dt = new Date(data._items[i].fct[0].dt);
              data._items[i].ech[0].dt = new Date(data._items[i].ech[0].dt);
              if(data._items[i].titulaire) 
                data._items[i].titulaire = new Date(data._items[i].titulaire);
            }

            $scope.res = data._items;
            $scope.count = data._meta.total;
          }
          
        })
        .error(function(err){
          console.log(err);
        });
  };


  $scope.SearchGrade = function(){

    $scope.qry = '/user?where={';

    if($scope.grade){
      $scope.qry += '"grade.0.grade":"'+$scope.grade.title +'"';
    }

    if($scope.to && $scope.f){
      var to = new Date($scope.to).toGMTString();
      var f = new Date($scope.f).toGMTString();

      $scope.qry += ',"grade.0.dt":{"$gte":"'+ f +'","$lte":"'+ to +'"}';

    }else if($scope.to){
      var to = new Date($scope.to).toGMTString();
      $scope.qry += ',"grade.0.dt":{"$lte":"'+ to +'"}';

    }else if($scope.f){
      var f = new Date($scope.f).toGMTString();
      $scope.qry += ',"grade.0.dt":{"$gte":"'+ f +'"}';
    }

    $scope.qry += '}&max_results=200';

    
      var req = {
                 method : 'GET',
                 url : $rootScope.app.url.db + $scope.qry,
                 cache : false,
                };
      $http(req)
        .success(function(data){
          if(!data._items[0]){
            $scope.NotFound();
          }else {

            for(var i = 0 ;i < data._meta.total ; i++){
              data._items[i].born = new Date(data._items[i].born);
              data._items[i].dtenter = new Date(data._items[i].dtenter);
              data._items[i].grade[0].dt = new Date(data._items[i].grade[0].dt);
              data._items[i].ech[0].dt = new Date(data._items[i].ech[0].dt);
              if(data._items[i].titulaire) 
                data._items[i].titulaire = new Date(data._items[i].titulaire);
            }

            $scope.res = data._items;
            $scope.count = data._meta.total;
          }
          
        })
        .error(function(err){
          console.log(err);
        });
  };
  $scope.initPage = function(pos){
    $scope.page = pos;
    $scope.Search();
  };

  $scope.isSelected = function(pos){
    pos += 1;
    console.log($scope.l + "   " + $scope.page);
    return pos == $scope.page;
  };


  $scope.NotFound = function(){
    $scope.toaster = {
      type:  'info',
      title: 'بحث',
      text:  'لا توجد نتيجة !'
    };
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };


  $scope.initFctOptions = function(){
    GestionUserService.getFonction()
    .success(function(data){
      $scope.fcts = data._items;
    });

  };

  $scope.initGradeOptions = function(){
    GestionUserService.getGrade()
    .success(function(data){
      $scope.gs = data._items;
    });
  };

  $scope.initStructOptions = function(){
    GestionUserService.getStruct()
    .success(function(data){
      console.log(data);
      $scope.strs = data._items;
    });
  };

  $scope.initSubStructOptions = function(data){
    $scope.substructs = data.substruct;
  };

  $scope.initSubSubStructOptions = function(data){
    $scope.subsubstructs = data.subsubstruct;
  };

}]);


App.controller('GenerateDocs',["$rootScope","$scope","$http","$cookies","$stateParams","$filter","userService",function($rootScope,$scope,$http,$cookies,$stateParams,$filter,userService){
  'use strict';
  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');

  if($stateParams.id){

    if($stateParams.nb){
      $scope.nbr = $stateParams.nb;
    }

    userService.getUser($stateParams.id)
      .success(function(data){
        data.born = new Date(data.born);
        data.aff[0].dt = new Date(data.aff[0].dt);
        data.now = $filter('date')(new Date(), 'yyyy/MM/dd');

        data.uid = $scope.fixuid(data.uid.split(''));
        $scope.usr = data;
        $scope.today = moment().locale('ar-tn').format('LL');

        $scope.fixtab(data.travlist,moment().locale('ar-tn').format('L'));

      })
      .error(function(err){

      });
  }

  $scope.fixuid = function(uid){
    var ind = 0;
    var ud = [];
    for(var i = uid.length - 1 ; i >= 0 ; i --){ 
      ud[ind] = uid[i];
      ind += 1;
    }
    return ud;
  };

  $scope.dateexplod = function(tabdate){
    var d = 0;
    var m = 0;
    var y = 0;

    var tmpd = 0;

    var tmpm = 0;

    for(var i = 0 ; i < tabdate.length ; i++){
      d += tabdate[i].d;
      m += tabdate[i].m;
      y += tabdate[i].y;
    }

    tmpd = Math.floor(d/30);
    d = d % 30;

    m += tmpd;
    tmpm = Math.floor(m / 12);

    m = m % 12;

    y+= tmpm;

    return {"d":d,"m":m,"y":y};

  };

  $scope.datediff = function(f,to){
    var fexp = f.split('/');
    var toexp = to.split('/');

    var a = moment(toexp[1] + "/" + toexp[0] + "/" + toexp[2]);
    var b = moment(fexp[1] + "/" + fexp[0] + "/" + fexp[2]);

    var y = a.diff(b, 'year');
    b.add(y, 'years');

    var m = a.diff(b, 'months');
    b.add(m, 'months');

    var d = a.diff(b, 'days');

    console.log({"d":d,"m":m,"y":y});

    return {"d":d,"m":m,"y":y};


  };

  $scope.addListTrav = function(lists,struct,grade,f,to,c,ref,del){
    var diff = $scope.datediff(f,to);

    if(del){
      var lst = {
              "struct": struct,"grade" : grade,"f" : f , 
              "to":to ,"cause" : c , "m":diff.m, "y" : diff.y , "d" : diff.d, "ref" : ref , "del" : del
            };
    }else {
      var lst = {
              "struct": struct,"grade" : grade,"f" : f , 
              "to":to ,"cause" : c , "m":diff.m, "y" : diff.y , "d" : diff.d, "ref" : ref 
            };
    }
    
    if(lists){
      lists.push(lst);
      return lists;
    }
    return [lst];
    
  };


  $scope.fixtab = function(tab,today){
    console.log(tab);
    var n = tab.length - 1;
    var lst = $scope.addListTrav(tab,tab[n].struct,tab[n].grade,tab[n].to,today,' ',' ');

    for(var i = 0 ; i <= n ; i ++){
      var tmp = lst[i].to.split('/');
      var to = moment(tmp[1] + "/" + tmp[0] + "/" + tmp[2]).subtract(1,'days').locale('ar-tn').format('L');
      lst[i].to = to;
    }



    $scope.res = $scope.dateexplod(lst);

    for(var i = 0 ; i < lst.length ; i ++){
      var tmp = lst[i].to.split('/');
      var to = moment(tmp[1] + "/" + tmp[0] + "/" + tmp[2]).toDate(); 
      var t = lst[i].f.split('/');
      var f = moment(t[1] + "/" + t[0] + "/" + t[2]).toDate();
      lst[i].to = to;
      lst[i].f = f;
    }

    lst[n + 1].to = '--';

    $scope.tab = lst;
  };

}]);


App.controller('USR', ["$rootScope","$scope","$http","$cookies","toaster","userService", function ($rootScope,$scope,$http,$cookies,toaster,userService){
  'use strict';
  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');

  var formdata = new FormData();

  $scope.success = function(msg){
    $scope.toaster = {
      type:  'success',
      title: 'اظافة',
      text:  'لقد تمت الاظافة بنجاح'
    };
    if(msg){
      $scope.toaster.text = msg;
    }
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.error = function(){
    $scope.toaster = {
      type:  'error',
      title: 'خطأ',
      text:  'هناك خطأ تثبت في المعلومات'
    };
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.setFile = function(element) {
    $scope.currentFile = element.files[0];
     var reader = new FileReader();

    reader.onload = function(event) {
      $scope.avatar = event.target.result;
      $scope.$apply();

    }
    reader.readAsDataURL(element.files[0]);
  }
  
  $scope.getTheFiles = function ($files) {
      angular.forEach($files, function (value, key) {
          formdata.append("img", value);
      });
  };


  $scope.init = function(){
        $scope.uid = "";
        $scope.nom = "";
        $scope.pren = "";
        $scope.father = "";
        $scope.mother = "";
        $scope.gender = "";
        $scope.born = "";
        $scope.dtenter = "";
        $scope.dtcin = "";
        $scope.cin = "";
        $scope.adrcin = "";
        $scope.tel = "";
        $scope.email = "";
        $scope.address = "";
        $scope.city = "";
        $scope.dt = "";
        $scope.ref = "";
        $scope.imginput = "";
        $scope.etag = "";
        $scope.id = "";

  };

  $scope.preAddUser = function(){
    userService.addAvatar(formdata,'user')
      .success(function(data){
        $scope.addUser(data);
      })
      .error(function(err){
        $scope.error();
    });
  };

  $scope.addUser = function(avatar){
        var dtcin = new Date($scope.dtcin).toGMTString();
        var born = new Date($scope.born).toGMTString();
        var dtenter = new Date($scope.dtenter).toGMTString();
        var user = {
              "uid" : $scope.uid , "nom" : $scope.nom ,"father" : $scope.father,
              "pren" : $scope.pren, "mother" : $scope.mother, "gender" : $scope.gender,
              "born" : born , "dtenter" : dtenter ,
              "cin" : {"num" : $scope.cin , "address" : $scope.adrcin ,"dt" : dtcin } ,
              "tel" : $scope.tel,"email" : $scope.email , 
              "location" : {"address" : $scope.address , "city" : $scope.city},
              "avatar" : avatar,
            };

        var req = {
                method: 'POST',
                url: $rootScope.app.url.db + '/user',
                data: user,
                cache: false,
              };
        $http(req)
          .success(function(data){
            if(data._status ==="OK")
              $scope.success();
              $scope.init();
          })
          .error(function(err){
            $scope.error();
          });   
  }; 

  $scope.updateUser = function(){
    $http.defaults.headers.common['If-Match'] = $scope.u._etag ;

    $scope.u.dtenter = new Date( $scope.u.dtenter).toGMTString();
    $scope.u.cin.dt = new Date($scope.u.cin.dt).toGMTString();
    $scope.u.born = new Date($scope.u.born).toGMTString();

    var u = {};
    angular.copy($scope.u,u);

    delete u._id;
    delete u._etag;


    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db +'/user/' + $scope.u._id,
                data: u,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success("تم التحيين بنجاح");
            $scope.u = {};
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.getU4Uuser = function(){
    userService.getUser($scope.u.uid)
    .success(function(data){
        $scope.u = data;
        $scope.u.dtenter = new Date( data.dtenter);
        $scope.u.cin.dt = new Date(data.cin.dt);
        $scope.u.born = new Date(data.born);
        delete $scope.u._updated;
        delete $scope.u._created;
        delete $scope.u._links;
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

}]);

App.controller('DOC',["$rootScope","$scope","$http","$cookies","$stateParams","toaster","userService", function ($rootScope,$scope,$http,$cookies,$stateParams,toaster,userService){
  'use strict';
  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');

  var formdata = new FormData();


  if($stateParams.doc){
    userService.getDoc($stateParams.doc).success(function(d,status){
      $scope.editdoc = d;
      $scope.avatar = d.src;
      $scope.editdoc.dt = new Date(d.dt);
    });
  }

  $scope.success = function(msg){
    $scope.toaster = {
      type:  'success',
      title: 'اظافة',
      text:  'لقد تمت الاظافة بنجاح'
    };
    if(msg){
      $scope.toaster.text = msg;
    }
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.error = function(){
    $scope.toaster = {
      type:  'error',
      title: 'خطأ',
      text:  'هناك خطأ تثبت في المعلومات'
    };
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.setFile = function(element) {
    $scope.currentFile = element.files[0];
     var reader = new FileReader();

    reader.onload = function(event) {
      $scope.avatar = event.target.result;
      $scope.$apply();

    }
    reader.readAsDataURL(element.files[0]);
  }
  
  $scope.getTheFiles = function ($files) {
      angular.forEach($files, function (value, key) {
          formdata.append("img", value);
      });
  };


  $scope.init = function(){
        $scope.uid = "";
        $scope.dt = "";
        $scope.ref = "";
        $scope.title = "";
        $scope.etag = "";
        $scope.id = "";

  };

  $scope.getDoc = function(){
    userService.getDocWithUserId($scope.id).
      success(function(data,status){

        if(data._items[0]){
          $scope.id = "";
          $scope.docs = data._items;
        }else {
          $scope.error();
          $scope.id = "";
        }
      })
      .error(function(err){
        $scope.error();
        $scope.id = "";
      });
  };

  $scope.preAddDoc = function(){
    userService.addAvatar(formdata,'doc')
      .success(function(data){
        $scope.addDoc(data);
      })
      .error(function(err){
        $scope.error();
    });
  };

  $scope.addDoc = function(src){
    var dt = new Date($scope.dt).toGMTString();
    var doc = {"src" : src ,"title" : $scope.title,"ref": $scope.ref ,"dt" : dt,"user" : $scope.id  };

    var req = {
                method: 'POST',
                url: $rootScope.app.url.db + '/doc',
                data: doc,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.preEditDoc = function(){
    if(formdata.get("img")){
      userService.addAvatar(formdata,'doc')
        .success(function(data){
          $scope.editDoc(data);
        })
        .error(function(err){
          $scope.error();
      });
    }else {
      $scope.editDoc();
    }
    
  };

  $scope.editDoc = function(src){

    $http.defaults.headers.common['If-Match'] = $scope.editdoc._etag ;

    var dt = new Date($scope.editdoc.dt).toGMTString();

    var doc = {};

    if( src){
      doc = {"src" : src ,"title" : $scope.editdoc.title,"ref": $scope.editdoc.ref ,"dt" : dt };
    }else {
      doc = {"title" : $scope.editdoc.title,"ref": $scope.editdoc.ref ,"dt" : dt };
    }
    

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/doc/' + $scope.editdoc._id,
                data: doc,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.get4Doc = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

}]);


App.controller('CERT',["$rootScope","$scope","$http","$cookies","$stateParams","toaster","userService", function ($rootScope,$scope,$http,$cookies,$stateParams,toaster,userService){
  'use strict';
  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');

  var formdata = new FormData();


  if($stateParams.cert && $stateParams.nb){
    userService.getUser($stateParams.cert).success(function(d,status){
      $rootScope.certs = d.certif;
      $scope.editcert = d.certif[$stateParams.nb];
      $scope.editcert.f = new Date($scope.editcert.f);
      $scope.editcert.to = new Date($scope.editcert.to);
      $scope.nb = $stateParams.nb;
      $scope.id = d._id;
      $scope.etag = d._etag;
      $scope.avatar = $scope.editcert.src;
    });
  }

  $scope.success = function(msg){
    $scope.toaster = {
      type:  'success',
      title: 'اظافة',
      text:  'لقد تمت الاظافة بنجاح'
    };
    if(msg){
      $scope.toaster.text = msg;
    }
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.error = function(){
    $scope.toaster = {
      type:  'error',
      title: 'خطأ',
      text:  'هناك خطأ تثبت في المعلومات'
    };
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.setFile = function(element) {
    $scope.currentFile = element.files[0];
     var reader = new FileReader();

    reader.onload = function(event) {
      $scope.avatar = event.target.result;
      $scope.$apply();

    }
    reader.readAsDataURL(element.files[0]);
  }
  
  $scope.getTheFiles = function ($files) {
      angular.forEach($files, function (value, key) {
          formdata.append("img", value);
      });
  };


  $scope.init = function(){
        $scope.uid = "";
        $scope.f = "";
        $scope.ref = "";
        $scope.to = "";
        $scope.title = "";
        $scope.etag = "";
        $scope.id = "";

  };

  $scope.preEditCert = function(){

    if(formdata.get("img")){
      userService.addAvatar(formdata,'cert')
        .success(function(data){
          $scope.editCert(data);
        })
        .error(function(err){
          $scope.error();
      });
    }else {
      $scope.editCert();
    }
    
  };

  $scope.editCert = function(src){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    $scope.editcert.f = new Date($scope.editcert.f).toGMTString();
    $scope.editcert.to = new Date($scope.editcert.to).toGMTString();


    if(src){
      $scope.editcert.src = src;
    }
    
    $rootScope.certs[$scope.nb] = $scope.editcert ;

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"certif" : $rootScope.certs},
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.getU4cert = function(){
    console.log($scope.uid);
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;
      if(data.certif){
        $scope.certifs = data.certif;
      }
      
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.getU = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;
      if(data.certif){
        $scope.certifs = data.certif;
      }

      
    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.updateUid = function($model){
    $scope.uid = $model.id;
    $scope.etag = $model.etag;
    $scope.certif = $model.certif;
  };

  $scope.addCert = function(src){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var f = new Date($scope.f).toGMTString();
    var to = new Date($scope.to).toGMTString();
    var cert = [{"ref" : $scope.ref ,"title" : $scope.title ,"f" : f,"to" : to ,"src" : src } ];
    

    if($scope.certifs){
      cert = cert.concat($scope.certifs);
    }

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"certif" : cert },
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

}]);

App.controller('PINALITY',["$rootScope","$scope","$http","$cookies","$stateParams","toaster","userService","GestionUserService", function ($rootScope,$scope,$http,$cookies,$stateParams,toaster,userService,GestionUserService){
  'use strict';
  $http.defaults.headers.common['Authorization'] = $cookies.getObject('tk');


  if($stateParams.state && $stateParams.nb){
    userService.getUser($stateParams.state).success(function(e,status){
      $rootScope.states = e.state;
      $scope.editstate = e.state[$stateParams.nb];
      $scope.editstate.dt = new Date($scope.editstate.dt);
      $scope.nb = $stateParams.nb;
      $scope.id = e._id;
      $scope.etag = e._etag;
    });
  }else if($stateParams.grad && $stateParams.nb){
    userService.getUser($stateParams.grad).success(function(e,status){
      $rootScope.gradess = e.grade;
      $scope.editgrade = e.grade[$stateParams.nb];
      $scope.editgrade.dt = new Date($scope.editgrade.dt);
      $scope.nb = $stateParams.nb;
      $scope.id = e._id;
      $scope.etag = e._etag;
    });
  }

  $scope.success = function(msg){
    $scope.toaster = {
      type:  'success',
      title: 'اظافة',
      text:  'لقد تمت الاظافة بنجاح'
    };
    if(msg){
      $scope.toaster.text = msg;
    }
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.error = function(){
    $scope.toaster = {
      type:  'error',
      title: 'خطأ',
      text:  'هناك خطأ تثبت في المعلومات'
    };
    toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
  };

  $scope.datediff = function(f,to){
    var fexp = f.split('/');
    var toexp = to.split('/');

    var a = moment(toexp[1] + "/" + toexp[0] + "/" + toexp[2]);
    var b = moment(fexp[1] + "/" + fexp[0] + "/" + fexp[2]);

    var y = a.diff(b, 'year');
    b.add(y, 'years');

    var m = a.diff(b, 'months');
    b.add(m, 'months');

    var d = a.diff(b, 'days');

    console.log({"d":d,"m":m,"y":y});

    return {"d":d,"m":m,"y":y};


  };


  $scope.addListTrav = function(lists,struct,grade,f,to,c,ref,del){
    var diff = $scope.datediff(f,to);

    if(del){
      var lst = {
              "struct": struct,"grade" : grade,"f" : f , 
              "to":to ,"cause" : c , "m":diff.m, "y" : diff.y , "d" : diff.d, "ref" : ref , "del" : del
            };
    }else {
      var lst = {
              "struct": struct,"grade" : grade,"f" : f , 
              "to":to ,"cause" : c , "m":diff.m, "y" : diff.y , "d" : diff.d, "ref" : ref 
            };
    }
    
    if(lists){
      lists.push(lst);
      return lists;
    }
    return [lst];
    
  };

  $scope.init = function(){
        $scope.uid = "";
        $scope.dt = "";
        $scope.ref = "";
        $scope.st = "";
        $scope.etag = "";
        $scope.id = "";

  };

  $scope.editState = function(){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;

    $scope.editstate.dt = new Date($scope.editstate.dt).toGMTString();

    
    $rootScope.states[$scope.nb] = $scope.editstate ;

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"state" : $rootScope.states},
                cache: false,
              };
    $http(req)
          .success(function(data){
            $scope.success("لقد تم التحيين بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.get4State = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.state){
        $scope.sts = data.state;
      }else{
        $scope.error();
      }

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.setState = function(){

    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();
    var state = [{
                  "st" : $scope.st,
                  "dt" : dt,
                  "ref" : $scope.ref,
                }];

    var to = moment(dt).locale('ar-tn').format('L');


    var lst = [];
    if($scope.statetmp){
      state = state.concat($scope.statetmp); 
    }
   
    if($scope.ultrav.travlist){
      var last = $scope.ultrav.travlist[$scope.ultrav.travlist.length - 1];
      var f = last.to;
      if(last.del){
        var tmp = last.to.split('/');
        f = moment(tmp[1] + "/" + tmp[0] + "/" + tmp[2]).add(last.del,'days').locale('ar-tn').format('L');
      }

      var lst = $scope.addListTrav($scope.ultrav.travlist,$scope.ultrav.aff[0].struct,
                $scope.ultrav.grade[0].grade,f,to,$scope.ref,' ');  
    }else if($scope.ultrav.state){
        var f = moment(new Date($scope.ultrav.state[0].dt)).locale('ar-tn').format('L');
        lst = $scope.addListTrav($scope.ultrav.travlist,$scope.ultrav.aff[0].struct,
              $scope.ultrav.grade[0].grade,f,to,$scope.ref,' ');
    }

    if(lst[0]){
      var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"state" : state , "travlist" : lst },
                cache: false,
              };
    }else {
      var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"state" : state },
                cache: false,
              };
    }
    

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.addDelDay = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    moment.locale('ar-tn');
    var ff = new Date($scope.f).toGMTString();
    var to = new Date($scope.to).toGMTString();
    var mf = moment(new Date($scope.f));
    var mto = moment(new Date($scope.to));

    var day = mto.diff(mf,'days');

    var d = [{
              "days" : day,
              "ref" : $scope.ref,
              "f" : ff,
              "to" : to
            }];

    if($scope.deldays){
      d = d.concat($scope.deldays);
    }

    if($scope.ultrav.travlist){
      var last = $scope.ultrav.travlist[$scope.ultrav.travlist.length - 1];
      var f = last.to;
      var t = moment($scope.f).locale('ar-tn').format('L');
      var lst = $scope.addListTrav($scope.ultrav.travlist,$scope.ultrav.aff[0].struct,
      $scope.ultrav.grade[0].grade,f,t,$scope.ultrav.state[0].st,$scope.ref,day);

    }else if($scope.ultrav.state){
      var f = moment(new Date($scope.ultrav.state[0].dt)).locale('ar-tn').format('L');
      var t = moment($scope.f).locale('ar-tn').format('L');
      var lst = $scope.addListTrav($scope.ultrav.travlist,$scope.ultrav.aff[0].struct,
      $scope.ultrav.grade[0].grade,f,t,$scope.ultrav.state[0].st,$scope.ref,day);

    } else if($scope.ultrav.grade){
      var f = moment(new Date($scope.ultrav.grade[0].dt)).locale('ar-tn').format('L');
      var t = moment($scope.f).locale('ar-tn').format('L');
      var lst = $scope.addListTrav($scope.ultrav.travlist,$scope.ultrav.aff[0].struct,
      $scope.ultrav.grade[0].grade,f,t,$scope.ultrav.state[0].st,$scope.ref,day);
    }
    
    

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"delday": d , "travlist" : lst},
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.getU = function(){
    userService.getUser($scope.uid)
    .success(function(data){
      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.state){
        $scope.statetmp = data.state;
      }

        if(data.grade){
          $scope.gradetmp = data.grade;
        }

        if(data.aff){
          $scope.afftmp = data.aff;
        }

      $scope.ultrav = data;

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.getU4DelDay = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.etag = data._etag;
      $scope.id = data._id;

      if(data.delday){
        $scope.deldays = data.delday;
      }

      $scope.ultrav = data;

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.regDate = function(delday,f,to){

    var days = 0;
    for(var i = 0 ; i< delday.length ; i ++){
      if(moment(new Date(delday[i].f)).isBetween(f,to) && moment(new Date(delday[i].to)).isBetween(f, to) ){
        days += delday[i].days;
      }

    }
    return days;
  };

  $scope.addGrade = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();

    var g = [{
              "grade" : $scope.grade.title,
              "ref" : $scope.ref,
              "dt" : dt,
            }];
    var lst = [];

    if($scope.ultrav.travlist){
      var last = $scope.ultrav.travlist[$scope.ultrav.travlist.length - 1];
      var f = last.to;
      var t = moment($scope.dt).locale('ar-tn').format('L');
      lst = $scope.addListTrav($scope.ultrav.travlist,$scope.ultrav.aff[0].struct,
      $scope.ultrav.grade[0].grade,f,t,$scope.ref,' ');

    }else if($scope.ultrav.grade){

      var f = moment(new Date($scope.ultrav.grade[0].dt)).locale('ar-tn').format('L');
      var t = moment($scope.dt).locale('ar-tn').format('L');
      lst = $scope.addListTrav($scope.ultrav.travlist,$scope.ultrav.aff[0].struct,
      $scope.ultrav.grade[0].grade,f,t,$scope.ref,' ');

      

    }

    if($scope.gradetmp){
      g = g.concat($scope.gradetmp);
    }

    if(lst[0]){
      var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"grade" : g , "travlist" : lst },
                cache: false,
              };
    }else {
      var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: {"grade": g},
                cache: false,
              };
    }

    

    $http(req)
          .success(function(data){
            $scope.success();
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });
  };

  $scope.Titulaire = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var dt = new Date($scope.dt).toGMTString();
    var f ;

    if($scope.ultrav.travlist){
      var last = $scope.ultrav.travlist[$scope.ultrav.travlist.length - 1];
      f = last.to;
    }else if($scope.ultrav.state){
      var d = new Date($scope.ultrav.state[0].dt);
      f = moment(d).locale('ar-tn').format('L');
    }else if($scope.ultrav.grade){
      var d = new Date($scope.ultrav.grade[0].dt);
      f = moment(d).locale('ar-tn').format('L');
    }

    
    var t = moment($scope.dt).locale('ar-tn').format('L');
    var lst = $scope.addListTrav($scope.ultrav.travlist,$scope.ultrav.aff[0].struct,
    $scope.ultrav.grade[0].grade,f,t,'ترسيم',' ');

    var doc = {"titulaire" : dt,"travlist" : lst};

    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/user/' + $scope.id,
                data: doc,
                cache: false,
              };

    $http(req)
          .success(function(data){
            $scope.success("تم ترسيم العون بنجاح");
            $scope.init();
          })
          .error(function(err){
            $scope.error();
          });

  };

  $scope.get4Grad = function(){
    userService.getUser($scope.uid)
    .success(function(data){

      $scope.id = data._id;

      if(data.grade){
        $scope.grades = data.grade;
      }

      

    })
    .error(function(error){
      console.log(error);
      $scope.error();
    });
  };

  $scope.initGradeOptions = function(){
    GestionUserService.getGrade()
    .success(function(data){
      $scope.gs = data._items;
    });
  };

  $scope.getGrad = function(){
    GestionUserService.getGrade()
      .success(function(g){
        $scope.GRADE = g._items;
      })
      .error(function(err){
        $scope.error();
      });
  };

  $scope.editGrade = function(){
    $http.defaults.headers.common['If-Match'] = $scope.etag ;
    var req = {
                method: 'PATCH',
                url: $rootScope.app.url.db + '/grade/' + $scope.id,
                data: {"title": $scope.editgrad },
                cache: false,
              };
    $http(req)
      .success(function(data){
        if(data._status ==="OK"){
          $scope.success("تم التحيين بنجاح");
          $scope.getGrad();
        }
      })
      .error(function(err){
        $scope.error();
      });
  };


}]);


/*App.controller('',[,function(){

}]);*/