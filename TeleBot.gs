const FUNCTION_LIST_HTML =
  '<b>Basic Commands</b>\n' +
  '/start - Bot Info\n' +
  '/help - Show all commands\n' +
  '/authenticate - Your unique telegram ID to be shown to ops spec\n' +
  '\n<b>HA Tracking</b>\n' +
  '/addactivity - Add an activity to your log\n' +
  '/checkhastatus - Retrieves your current HA validity\n' +
  '\n<b>Lesson Tracking</b>\n' +
  '/addlesson - Update your lesson progress\n' +
  '/checklessonstatus - Retrieves your lesson progress'
  ;

/*
  TELEGRAM BOT CLASS
*/
class TelegramBot {

  // constructor
  constructor(telegram_data) {

    // IF CALLBACK
    if (telegram_data.callback_query)
    {
      this.telegramData = telegram_data;
      this.cmd = telegram_data.callback_query.data;

      // user details
      var chatId = telegram_data.callback_query.from.id;
      var teleName = telegram_data.callback_query.message.chat.first_name;
      this.user = new User(chatId, teleName);

      // respond user callback
      this.respondUserCallback();
    }

    // IF FIRST MESSAGE
    else if (telegram_data.message) {
      // new request data
      this.telegramData = telegram_data;
      this.cmd = telegram_data.message.text;

      // user details
      let chatId = telegram_data.message.from.id;
      let teleName = telegram_data.message.from.first_name;
      this.user = new User(chatId, teleName);

      // base respond user
      this.respondUser();
    }

    // If neither callback nor message, invalid trigger
    else {
      return;
    }
  }

  // function to send api request
  request(method, data) {
    let options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(data)
    };
    let response = UrlFetchApp.fetch(TELEBOT_API + TELEBOT_TOKEN + '/' + method, options);
    if (response.getResponseCode() == 200) {
      return JSON.parse(response.getContentText());
    }
    return false;
  }

  // function to send message through bot
  sendMessage(text, mode) {
    mode = mode || 'None';
    return this.request('sendMessage', {
      'chat_id': this.user.chatId,
      'text': text,
      'parse_mode': mode
    });
  }

  // function to send message and wait for reply
  sendMessageForceReply(text, mode) {
    mode = mode || 'None';
    return this.request('sendMessage', {
      'chat_id': this.user.chatId,
      'text': text,
      'parse_mode': mode,
      reply_markup: JSON.stringify({"force_reply": true})
    });
  }

  // function to modify keyboard with set of options
  sendMessageKeyboard(text, keyboard, mode) {
    mode = mode || 'None';
    keyboard = keyboard ?
      { 'keyboard': keyboard } :
      { 'remove_keyboard': true };
    return this.request('sendMessage', {
      'chat_id': this.user.chatId,
      'text': text,
      'parse_mode': mode,
      'reply_markup': JSON.stringify(keyboard)
    });
  }

  // function to modify keyboard with set of options
  sendMessageInlineKeyboard(text, keyboard, mode) {
    mode = mode || 'None';
    keyboard = keyboard ?
      { 'inline_keyboard': keyboard } :
      { 'remove_keyboard': true };

    return this.request('sendMessage', {
      'chat_id': this.user.chatId,
      'text': text,
      'parse_mode': mode,
      'reply_markup': JSON.stringify(keyboard)
    });
  }

  // function to send a menu with commands
  sendMenuButtons() {
    return this.request('MenuButtonCommands', {
      'type': 'commads'
    });
  }

  // function to delete message
  deleteMessage(message_id) {
    return this.request('deleteMessage', {
      'chat_id': this.user.chatId,
      'message_id': message_id
    });
  }
}


/*
  RESPOND TO USER

  Determines and sends user response based on incoming message
*/
TelegramBot.prototype.respondUser = function() {

  // If invalid command
  if (VALID_COMMANDS.indexOf(this.cmd) < 0) {
    this.sendMessage("Sorry, I don't understand.\nPlease run /help for a list of valid commands");
    return;
  }

  // If valid command
  switch(this.cmd) {
    case '/start':
      this.start();
      break;

    case '/help':
      this.help();
      break;

    case '/addactivity':
      this.addActivity();
      break;

    case '/checkhastatus':
      this.checkHaStatus();
      break;

    case '/authenticate':
      this.authenticate();
      break;

    case '/addlesson':
      this.selectDate("hello");
      break;
    
    case '/checklessonstatus':
      this.checkLessonStatus();
      break;
  }


}


/*
  RESPOND TO USER CALLBACKS

  Determines and sends user response based on callbacks triggered
*/
TelegramBot.prototype.respondUserCallback = function() {

  // Clear the menu after usage
  this.deleteMessage(this.telegramData.callback_query.message.message_id);

  // Cancellation behavior
  if (this.cmd == 'CANCEL') {
    this.sendMessage("Cancelled, all selections reset");
    return;
  }

  // Valid activity callbacks
  if (VALID_CALLBACKS.indexOf(this.cmd) > -1) {
    this.selectEventDate(this.cmd);
    return;
  }

  // If data confirmed, ready to be entered
  if (this.cmd.includes("CONFIRMED")) {
    this.sendMessage("New activity added");
    return;
  }

  // New entry
  this.confirmEntry(this.cmd);
  return;
}


/*
  START

  Introduces user to bot function, determines if they are already on registered list
*/
TelegramBot.prototype.start = function() {

  if (this.user.verified) {
    let printedName = this.user.fullName.charAt(0) + this.user.fullName.substring(1).toLowerCase();
    this.sendMessage("Hello " + printedName + "!\nWelcome to 38SCE HA tracking bot, here's what I can do for you\n");
  }
  else{
    this.sendMessage('Unauthorized user, please run /authenticate and contact the ops spec to enroll');
    this.sendMessage('Functionality Resumes for Testing')  
  }

  this.sendMessage(FUNCTION_LIST_HTML, 'HTML');
}


/*
  HELP

  Shows user list of available commands and their functions
*/
TelegramBot.prototype.help = function() {
  this.sendMessage(FUNCTION_LIST_HTML, 'HTML');
}


/*
  AUTHENTICATE

  Displays user's registration number to be shown to ops spec
*/
TelegramBot.prototype.authenticate = function() {
  let text =
    'Your Private ID :\n<b>' + this.user.chatId + '</b>\n\n' +
    'Your Public Name :\n<b>' + this.user.teleName + '</b>\n\n' +
    '⚠ Note :\n<u><i>This ID may be synonymous with your phone number. To be shared with the ops spec only.</i></u>'
    ;
  this.sendMessage(text, 'HTML');
}


/*
  ADDACTIVITY FUNCTION

  Allows user to select activity, then date and a confirmation
*/
TelegramBot.prototype.addActivity = function() {

    var keyboard = [
    [{
      "text": "LIFE",
      "callback_data": "LIFE"
    }],
    [{
      "text": "TABATA",
      "callback_data": "TABATA"
    }],
    [{
      "text": "VOC",
      "callback_data": "VOC"
    }],
    [{
      "text": "DI",
      "callback_data": "DI"
    }],
    [{
      "text": "Others",
      "callback_data": "OTHERS"
    }],
    [{
      "text": "Cancel",
      "callback_data": "CANCEL"
    }]
  ];

  this.sendMessageInlineKeyboard("Select activity", keyboard);
}


/*
  SELECT DATE FUNCTION

  Allows user to select a date over the past 5 days
*/
TelegramBot.prototype.selectEventDate = function(activityName) {

  const weekdayList = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  
  // current date string
  let currentDate = new Date();
  let currentDateString = "";
  let dateArr = [];
  let n = 0;

  // creates string array of dates 
  while (n < MAX_DAYS_ELAPSED) {
    // Create string to be printed
    currentDateString = weekdayList[currentDate.getDay()] + " " 
                        + currentDate.getDate() + "/" 
                        + (currentDate.getMonth() + 1) + "/"
                        + (currentDate.getFullYear() + 1);
    // Add to list of dates
    dateArr.push(currentDateString.toString());
    // Count backward one day, increment once
    currentDate.setDate(currentDate.getDate() - 1);
    n++;
  }

  var keyboard = [
    [{
      "text": dateArr[0] + " (Today)",
      "callback_data": dateArr[0] + "," + activityName
    }],
    [{
      "text": dateArr[1],
      "callback_data": dateArr[1] + "," + activityName
    }],
    [{
      "text": dateArr[2],
      "callback_data": dateArr[2] + "," + activityName
    }],
    [{
      "text": dateArr[3],
      "callback_data": dateArr[3] + "," + activityName
    }],
    [{
      "text": dateArr[4],
      "callback_data": dateArr[4] + "," + activityName
    }],
    [{
      "text": "Cancel",
      "callback_data": "CANCEL"
    }]
  ];

  this.sendMessageInlineKeyboard('Select date for ' + activityName, keyboard);
}


/*
  CHECK HA STATUS FUNCTION

  Retrieves the user's present HA status and displays it to the user
*/
TelegramBot.prototype.checkHaStatus = function() {
  let text = "Your HA is valid until: " + this.user.haValidTill;
  this.sendMessage(text);
}


/*
  ADD LESSON FUNCTION

  Allows user to add a custom conduct
*/
TelegramBot.prototype.addLesson = function() {
  this.sendMessage("Sorry, this feature is in development.");
}


/*
  CHECK LESSON STATUS FUNCTION

  Retrieves the user's present lessons completed
*/
TelegramBot.prototype.checkLessonStatus = function() {
  this.sendMessage("Sorry, this feature is in development.");
}


/*
  CONFIRMATION ENTRY FUNCTION

  Prints out full details of user's activity for confirmation
*/
TelegramBot.prototype.confirmEntry = function(newData) {

  entryArr = newData.split(',');

  newDataHtml = 
    '<b>Name:</b> ' + this.user.fullName + 
    '\n<b>Activity:</b> ' + entryArr[1] + 
    '\n<b>Date:</b> ' + entryArr[0] + 
    '\n\n<b>Current HA Status:</b> ' + this.user.haValidTill; 

  var keyboard = [
    [{
      "text": "Yes",
      "callback_data": "CONFIRMED " + newData 
    },
    {
      "text": "No",
      "callback_data": "CANCEL"
    }]
  ];

  this.sendMessage(newDataHtml, 'HTML');
  this.sendMessageInlineKeyboard("Confirm Entry", keyboard); 
}


