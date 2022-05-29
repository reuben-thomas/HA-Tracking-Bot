class User {

  // class constructor
  constructor(telegram_data) {

    this.chatId = telegram_data.message.from.id;
    this.teleName = telegram_data.message.from.first_name;
    this.verifyUser();        // verifies user registration from spreadsheet
  }
}


/*
  VERIFY USER FUNCTION

  Run once during the constructor to verify the user from registered list, and defines the cells to be updated for each 
  specific user
*/
User.prototype.verifyUser = function() {
    // Checks for position of user ID within spreadsheet
    let ssId = SSID;
    let sheet = SpreadsheetApp.openById(ssId).getSheetByName("NominalRoll");

    // Open column of names and telegram id
    let idArr = sheet.getRange(TELE_ID_COL_RANGE).getValues();
    let haArr = sheet.getRange(HA_VALID_COL_RANGE).getValues();
    let nameArr = sheet.getRange(NAME_COL_RANGE).getValues();
    
    // Remap columns to rows
    idArr = idArr.map(row => row[0]);
    haArr = haArr.map(row => row[0]);
    nameArr = nameArr.map(row => row[0]);
    
    let idIndex = idArr.indexOf(this.chatId);
    
    // User not found, unregisterred
    if(idIndex < 0){
      this.verified = false;
    }
    // User found
    else{
      this.verified = true;
      this.rowNumber = idIndex;
      this.fullName = nameArr[idIndex];
      this.haValidTill = haArr[idIndex];
    }
}



















