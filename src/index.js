'use strict';
var Alexa = require('alexa-sdk');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.  
//Make sure to enclose your value in quotes, like this: var APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
var APP_ID = undefined;

var SKILL_NAME = "Marathon Pacing Calculator";
var HELP_MESSAGE = "You can ask about marathon pace for certain marathon goal. For example, you may ask the pace for 3 hour marathon.. What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var SORRY_MESSAGE = "Sorry I don't understand. Please provide a valid goal. For example, you may ask the pace for 4 hour marathon.. What can I help you with?";
var STOP_MESSAGE = "Goodbye!";
var RESULT_MESSAGE = "You need to run at "

//=========================================================================================================================================
//Editing anything below this line might break your skill.  
//=========================================================================================================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var iso8601DurationRegex = /(-)?P(?:([\.,\d]+)Y)?(?:([\.,\d]+)M)?(?:([\.,\d]+)W)?(?:([\.,\d]+)D)?T(?:([\.,\d]+)H)?(?:([\.,\d]+)M)?(?:([\.,\d]+)S)?/;

var parseISO8601Duration = function (iso8601Duration) {
    var matches = iso8601Duration.match(iso8601DurationRegex);

    //sign: matches[1] === undefined ? '+' : '-',
    //years: matches[2] === undefined ? 0 : matches[2],
    //months: matches[3] === undefined ? 0 : matches[3],
    //weeks: matches[4] === undefined ? 0 : matches[4],
    var days = matches[5] === undefined ? 0 : matches[5];
    var hours = matches[6] === undefined ? 0 : matches[6];
    var minutes = matches[7] === undefined ? 0 : matches[7];
    var seconds = matches[8] === undefined ? 0 : matches[8];
    return days*24*60*60*60 + hours*60*60 + minutes*60 + seconds;
};

var milePace = function(dur) {
  var milePace = dur / 26.2;
  console.log("milePace: " + milePace);
  return Math.floor(milePace);
}

var kmPace = function(dur) {
  var kmPace = dur / 42.195;
  console.log("kmPace: " + kmPace);
  return Math.floor(kmPace);
}

var paceToStr = function(pace) {
  var ret = "";
  if (pace / 60 >= 1) {
    ret += Math.floor(pace/60) + " minutes ";
  }
  if (pace % 60 != 0) {
    ret += pace%60 + " seconds";
  }
  return ret;
}

var handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'PaceCalcIntent': function () {
      var durSlot = this.event.request.intent.slots["dur"];
      if (durSlot && durSlot.value) {
        var dur = parseISO8601Duration(durSlot.value);
        this.emit(':tell', RESULT_MESSAGE + paceToStr(milePace(dur)) + " per mile or " + paceToStr(kmPace(dur)) + " per km");
      } else {
        this.emit(':tell', SORRY_MESSAGE);
      }
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};
