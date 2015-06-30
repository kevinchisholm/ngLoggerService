/**
  * Custom Logger Service
  *
  * version: 1.0.0
  *
*/
(function (_window) {

  "use strict";

  /*global window: false */

  var ngLoggerKeyName = 'CUSTOM_LOGGER',
      defaultMessagePrefix = ngLoggerKeyName,
      currentMessageIndex = 0,
      messageQueue = [];
      //nextMessage = null;

  //register this service
  angular.module('candidates').factory('ngLogger', ['$localStorage', ngLoggerWrapper]);

  /**
    * The ngLogger service is the value of this executed function.
    *
    * @return object
  */
  function ngLoggerWrapper($localStorage) {
    var loggingOn = loggingKeySet(),
        loggingMode = getLoggingKey(),
        manualMode = isManualMode(),
        isConsoleLog = consoleLogValid(),
        isConsoleDir = consoleDirValid();

    //Bind the keydown event for up and down arrows
    bindUpDownArrows();

    /**
      * Returns a new Logger instance, configurd to use custom message prefix
      *
      * @param messagePrefix (optinoal) string, used as a prefix for all messages passed to this instance.
      *
      * @see Logger
      *
      * @return object, instance of Logger
    */
    function init(messagePrefix) {
      messagePrefix = messagePrefix || defaultMessagePrefix;

      return new Logger(messagePrefix);
    }

    /**
      * Checks to ensure that where is a window.console and window.console.log
      *
      * @return boolean
    */
    function consoleLogValid() {
      var isConsole = (_window.console && _window.console instanceof Object),
        isConsoleLog = (isConsole && _window.console.log && typeof _window.console.log === "function");

      return isConsoleLog;
    }

    /**
      * Checks to ensure that where is a window.console.dir and window.console.dir
      *
      * @return boolean
    */
    function consoleDirValid() {
      return (consoleLogValid() && _window.console.dir && typeof _window.console.dir === "function");
    }

    /**
      * Determines if logging is in manual mode
      *
      * @return boolean
    */
    function isManualMode() {
      return (loggingMode && loggingMode === 2) ? true : false;
    }

    /**
      * Determines if the local storage key is set, which enables logging
      *
      * @see variable: "loggingOn"
      *
      * @return boolean
    */
    function loggingKeySet() {
      return ($localStorage.$default()[ngLoggerKeyName]) ? true : false;
    }

    /**
      * Returns the local storage key based on ngLoggerKeyName
      *
      * @see variables: "loggingOn" & loggingKeySet
      *
      * @return string
    */
    function getLoggingKey() {
      return loggingKeySet() ? $localStorage.$default()[ngLoggerKeyName] : '';
    }

    /**
      * Wrapper for window.console.log
      *
      * @param message (optinoal) string, the actual message to be ouput in the console.
      *
      * @return undefined
    */
    function consoleLog(message) {
      //make sure logging is on
      if(!loggingOn || !isConsoleLog){return; }

      console.log(defaultMessagePrefix + " > " + (message ||  ''));
    }

    /**
      * Wrapper for window.console.dir
      *
      * @param obj (required) object, the object to be inspected in the console
      *
      * @return undefined
    */
    function consoleDir(obj) {
      //make sure logging is on
      if(!loggingOn || !isConsoleDir){return; };

      //make sure a valid object has been provided
      if(!obj || !(obj instanceof Object)){consoleLog('no object provided to consoleDir'); return; }

      //inspect the object
      console.dir(obj);
    }

    /**
      * Binds the keydown event for up and down arrows
      *
      * @return undefined
    */
    function bindUpDownArrows() {
      var nextMessage = null;
      //bind to keydown
      angular.element(document).on("keydown", keydownHandler);

      //the handler for keydown
      function keydownHandler(e) {
        //if user pressed the down arrow
        if (e.keyCode === 40) {
            if(!messageQueue.length){consoleLog('messageQueue is empty'); return; }

            nextMessage = messageQueue.shift();

            //show the next message in the log
            if (typeof nextMessage === 'string'){
              consoleLog(nextMessage);
            } else if (nextMessage instanceof Object){
              consoleDir(nextMessage);
            }
        }

        //if user pressed the up arrow
        if (e.keyCode === 38) {
          if(!messageQueue.length){consoleLog('messageQueue is empty'); return; }

          consoleLog("MESSAGE QUEUE: ");
          consoleDir(messageQueue);
        }
      }
    }

    /**
      * Constructor used for instance logs, allows for a custom message prefix
      *
      * @param messagePrefix (optinoal) string, used as a prefix for all messages passed to this instance.
      *
      * @return undefined
    */
    function Logger(messagePrefix) {
      var counter = -1;

      /**
        * Wrapper for consoleLog
        *
        * @param message (optinoal) string, the actual message to be ouput in the console.
        *
        * @see consoleLog
        *
        * @return Logger instance
      */
      this.log = function(message){
        var customMessage = '';

        customMessage = (messagePrefix + " - " + (++counter) + " : " + (message ||  ''));

        //add this message to the queue, in case manual mode is desired
        messageQueue.push(customMessage);

        //only show the message in real-time if loggingMode is "1"
        if (!manualMode){
          consoleLog(customMessage);
        }

        //make this chainable
        return this;
      };

      /**
        * Wrapper for consoleDir
        *
        * @param obj (optinoal) string, the actual message to be ouput in the console.
        *
        * @see consoleDir
        *
        * @return Logger instance
      */
       this.dir = function(obj) {
        obj = obj || {};

        //add this message to the queue, in case manual mode is desired
        messageQueue.push(obj);

        //only show the message in real-time if loggingMode is "1"
        if (!manualMode){
          consoleDir(obj);
        }
        
        //make this chainable
        return this;
      }

    }

    //return the object that will represent the ngLogger service
    return {
      init: init,
      log: consoleLog,
      dir: consoleDir
      //etc...
    };
  }
}(window));