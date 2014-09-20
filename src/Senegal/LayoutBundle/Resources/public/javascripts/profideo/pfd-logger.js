;(function($) {

  var Logger = {

    // level for logger
    // @note: log level (int) is the index in this array
    loglevels:  ['info', 'warn', 'error', 'debug'],
//      info:   [ 0, 'INFO' ],
//      warn:   [ 1, 'WARN' ],
//      error:  [ 2, 'ERROR' ],
//      debug:  [ 3, 'DEBUG' ]
//    },
//
    // current level to log
    currentLogLevel: 2,

    // activattion status logger
    active: false,

    activate: function() {
      this.active = true;
      this.info('Logger ON');
    },
    desactivate: function() {
      this.info('Logger OFF');
      this.active = false;
    },
    setLogLevel: function(level) { // define the level to log (info, warn, error, debug )
      level = level.toLowerCase();
      //console.log(level);
      for(var index in this.loglevels) {
        if(this.loglevels[index] == level) {
          this.currentLogLevel = index;
          return;
        }
      }
      this.error('Invalid log level ' + level);
    },
    info: function(message) { // log an info
      this.writeLog(message, 0);
    },
    warn: function(message) { // log a warning
      this.writeLog(message, 1);
    },
    error: function(message) { // log an error
      this.writeLog(message, 2);
    },
    debug: function(message) { // log a debug
      this.writeLog(message, 3);
    },
    writeLog: function(message, level) { // function to write in console the log
      if (typeof(console) != 'undefined' && typeof(console.log) == 'function' && this.active) {
        var sDate    = new Date();
        var sDay     = sDate.getDay() > 9 ? sDate.getDay() : '0' + sDate.getDay();
        var sMonth   = sDate.getMonth() > 9 ? sDate.getMonth() : '0' + sDate.getMonth();
        var sYear    = sDate.getFullYear();

        var sHour    = sDate.getHours() > 9 ? sDate.getHours() : '0' + sDate.getHours();
        var sMinutes = sDate.getMinutes() > 9 ? sDate.getMinutes() : '0' + sDate.getMinutes();
        var sSeconds = sDate.getSeconds() > 9 ? sDate.getSeconds() : '0' + sDate.getSeconds();

        var sTodayHour = sHour + ':' + sMinutes + ':' + sSeconds;
        if(typeof(level) == 'undefined') {
          console.log('Invalid log level');
          return;
        }
        if(typeof(message) == 'undefined') {
          console.log('Empty message');
          return;
        }
        if(level <= this.currentLogLevel) {
          if(typeof(message) == 'object') {
            console[this.loglevels[level]](sTodayHour + ' - log object : ');
            console.log(message);
            return;
          } else {
            console[this.loglevels[level]](sTodayHour + ' - ' + message);
          }
        }
      }
    }
  }

  window.logger = Logger;

})(jQuery);
