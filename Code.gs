var TelegramData;   //stores all telegram data

// Initializes web app, 
function setWebhook() {
  let drive = DriveApp.getRootFolder();
  
  let result = apiRequest('setWebhook', {
    url: DEP_URL
  });
  Logger.log(result);
}


/*
  API REQUEST

  Run once to set webhook
*/
function apiRequest(method, data) {
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


/*
  VALID REQUEST
  
  Only response if telegram bot request contains valid text message
  Add valid command set
*/
function validRequest_(e) {

  try {
    if (e.postData.type == 'application/json') {
      TelegramData = JSON.parse(e.postData.contents);
      return typeof TelegramData.message.text != 'undefined' 
                 || TelegramData.callback_query.data != 'undefined';
    }
    else return false;
  }
  catch (e) {
    return false;
  }
}


/*
  DO POST
  
*/
function doPost(e) {
  // check valid request
  if (!validRequest_(e)) return;

  let Bot = new TelegramBot(TelegramData);

  if (TelegramData.callback_query){
    Bot.user.chatId = TelegramData.callback_query.from.id;
    Bot.sendMessage("this is a callback");
  }
  else if (TelegramData.message) {
    Bot.respondUser();
  }

}











