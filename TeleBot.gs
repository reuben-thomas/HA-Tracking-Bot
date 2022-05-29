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
    this.telegramData = telegram_data;
    this.cmd = telegram_data.message.text;
    this.user = new User(telegram_data);
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
}

/*
  RESPOND TO USER

  Determines and sends user response based on incoming message
*/
TelegramBot.prototype.respondUser = function() {

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
      this.selectDate();
      break;
    
    case '/checklessonstatus':
      this.checkLessonStatus();
      break;

    default:
      var ssId = SSID;
      var sheet = SpreadsheetApp.openById(ssId).getSheetByName("ResponseData"); 
      var dateNow = new Date;
      var formattedDate = dateNow.getDate() + "/" + (dateNow.getMonth() + 1) + "/" + (dateNow.getFullYear() + 1);
      sheet.appendRow([formattedDate, this.user.teleName, this.cmd]);
      return this.sendMessageKeyboard('OK, Activity Recorded', false);
  }
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

  let keyboard1 = [
    [{ 'text': 'LIFE', 'callback_data':'life' }, { 'text': 'TABATA','callback_data':'tabata' }],
    [{ 'text': 'VOC' }, { 'text': 'DI' }],
    [{ 'text': 'Others' }],
    [{ 'text': 'Cancel', 'callback_data':'cancel' }]
  ];
  
  this.sendMessageKeyboard('Enter your activity', keyboard1);
}


/*
  SELECT DATE FUNCTION

  Allows user to select a date over the past 5 days
*/
TelegramBot.prototype.selectDate = function() {

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
    dateArr.push(currentDateString);
    // Count backward one day, increment once
    currentDate.setDate(currentDate.getDate() - 1);
    n++;
  }

  let keyboard = [
    [{ 'text': dateArr[0] + " (Today)"}],
    [{ 'text': dateArr[1]}],
    [{ 'text': dateArr[2]}],
    [{ 'text': dateArr[3]}],
    [{ 'text': dateArr[4]}],
    [{ 'text': "Cancel"}]
  ];
  this.sendMessageKeyboard('Select activity date', keyboard);
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


