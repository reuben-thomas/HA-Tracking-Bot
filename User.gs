class User {

  // class constructor
  constructor(chatId, teleName) {

    this.chatId = chatId;
    this.teleName = teleName;

    // defaults
    this.verified = false;
    this.fullName = "Unregistered";
    this.haValidTill = "Unregistered";

    this.verifyUser();
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
      this.rowNumber = idIndex + TOP_OFFSET_CELLS;
      this.fullName = nameArr[idIndex];
      this.haValidTill = haArr[idIndex];
    }
}

/*
  ADD USER ENTRY

  Run to add user entry to appropriate row
*/
User.prototype.addUserEntry = function(newEntry) {

  // responses sheet
  var ssId = SSID;
  var responseSheet = SpreadsheetApp.openById(ssId).getSheetByName("ResponseData");

  // opens range to add
  let row = this.rowNumber;
  var col = 0;

  // opens data to include
  let name = this.fullName;
  let weekday = newEntry.split(" ")[1];
  let date = newEntry.split(" ")[2];
  let activity = newEntry.split(" ")[3];

  //
  // 1 RECENT RESPONSES SHEET
  //
  var dataRowRange = "E" + row + ":Z" + row;
  var data = responseSheet.getRange(dataRowRange).getValues();
  var dataRow = data[0];

  col = dataRow.findIndex(cell => cell.length < 1) + LEFT_OFFSET_CELLS + 1; // The row next to the last occupied row
  let newEntryString = date + "," + activity;
  responseSheet.getRange(row, col).setValue(newEntryString);

  // 
  //  2 MONTHLY DATA SHEET
  //
  let activityMonthId = date.split("/")[1];
  let activityMonth = MONTHS[activityMonthId];

  var monthSheet = SpreadsheetApp.openById(ssId).getSheetByName(activityMonth);
  
  // Create sheet for month from template if doesn't exist
  if (!monthSheet) {
    var templateSheet = SpreadsheetApp.openById(ssId).getSheetByName("MonthlyTemplate");
    SpreadsheetApp.openById(ssId).insertSheet(activityMonth, {template: templateSheet});
    var monthSheet = SpreadsheetApp.openById(ssId).getSheetByName(activityMonth);
  }

  col = parseInt(date.split("/")[0]) + LEFT_OFFSET_CELLS;
  monthSheet.getRange(row, col).setValue(1);
  
  //
  //  3 RESPONSE LOG
  //
  responseSheet = SpreadsheetApp.openById(ssId).getSheetByName("Responses");
  responseSheet.appendRow([name, date, activity]);
}
