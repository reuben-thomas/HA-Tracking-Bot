class User {

  // class constructor
  constructor(chatId, teleName) {

    this.chatId = chatId;
    this.teleName = teleName;

    // defaults
    this.verified = false;

    this.fullName = "Unregistered";
    this.serviceYear = 2;
    this.haValidity = "Invalid"
    this.haStatus = "Invalid"
    this.haStart = "Invalid"
    this.haExpiry = "Invalid"

    let ssId = SSID;
    this.nominalRollSheet = SpreadsheetApp.openById(ssId).getSheetByName("NominalRoll");

    this.verifyUser();
  }
}


/*
  VERIFY USER FUNCTION

  Run once during the constructor to verify the user from registered list, and defines the cells to be updated for each 
  specific user
*/
User.prototype.verifyUser = function() {

    // Open column of names and telegram id
    let idArr = this.nominalRollSheet.getRange(TELE_ID_COL_RANGE).getValues();
    idArr = idArr.map(row => row[0]);
    let idIndex = idArr.indexOf(this.chatId);
    
    // User not found, unregisterred
    if(idIndex < 0){
      this.verified = false;
    }
    // User found
    else{
      this.verified = true;
      this.rowNumber = idIndex + TOP_OFFSET_CELLS + 1;

      this.recentsDataRange = RECENTS_COL + this.rowNumber;
      this.statusDataRange = HA_STATUS_COL + this.rowNumber;
      this.startDataRange = HA_START_COL + this.rowNumber;
      this.expiryDataRange = HA_EXPIRY_COL + this.rowNumber;

      let dataRange = NAME_COL + this.rowNumber;
      this.fullName = String(this.nominalRollSheet.getRange(dataRange).getValues());
      dataRange = YEAR_COL + this.rowNumber;
      this.serviceYear = String(this.nominalRollSheet.getRange(dataRange).getValues());
      dataRange = HA_VALID_COL + this.rowNumber;      
      this.haValidity = String(this.nominalRollSheet.getRange(dataRange).getValues());
      this.haStatus = String(this.nominalRollSheet.getRange(this.statusDataRange).getValues());
      this.haStart = String(this.nominalRollSheet.getRange(this.startDataRange).getValues());
      this.haExpiry = String(this.nominalRollSheet.getRange(this.expiryDataRange).getValues());
    }
}


/*
  ADD USER ENTRY

  1. Response Log
     Updates the response sheet to collect all data

  2. Past Activity
     If adding a past activity to a closed period, it is irrelevant and simply logged
  
  3. Update Recents
     Adds the new entry to recents list, sorts by date'

  4. Update by Behavior
     Selects appropriate action and update based on gaining or maintaining or invalid
*/
User.prototype.addUserEntry = function(newEntry) {
  let ssId = SSID;
  let name = this.fullName;
  let date = newEntry.split(" ")[2];
  let activity = newEntry.split(" ")[3];

  // NEW DATA ENTRY
  let newData = date + " " + activity;
  let activitiesArray = [];

  // 1. RESPONSE LOG
  // Adds all responses in list form
  responseSheet = SpreadsheetApp.openById(ssId).getSheetByName("Responses");
  let dateNow = new Date();
  responseSheet.appendRow([dateNow.toLocaleString(), name, activity, date]);

  // 2. PAST IRRELEVANT ACTIVITY
  // If the activity is before the start date, it is considered irrelevant
  let activityDate = date.toDate();
  let startDate = this.haStart.toDate();
  if (startDate > activityDate) {
    this.updateMonthlySheet(date, "1");
    return;
  }

  // 3. UPDATE RECENTS
  // Pulls existing recents, sorts by date, 
  let data = this.nominalRollSheet.getRange(this.recentsDataRange).getValues();
  // Add directly if empty, else add it in list form separated by ","
  if (data != "") {
    newData = data + "," + newData;
    // sort in order of date
    activitiesArray = newData.split(",");
    activitiesArray.sort( this.compareEntries );
  }
  else {
    activitiesArray = [newData];
  }
  // Add new data to recents
  newData = activitiesArray.toString();
  this.nominalRollSheet.getRange(this.recentsDataRange).setValue(newData);

  // 4. UPDATE BY BEHAVIOR
  // Determines appropriate action based on gaining or maintaining
  if (this.haValidity == "INVALID") {
    // Clear the recents, mark expiry date
    this.nominalRollSheet.getRange(this.recentsDataRange).setValue("");
    this.updateMonthlySheet(this.haExpiry, "E");
    
    // Relevant data comprises only of new activity, old are expired
    newData = date + " " + activity;
    activitiesArray = [newData];
    this.nominalRollSheet.getRange(this.recentsDataRange).setValue(newData);
    
    //State changed to gaining
    this.nominalRollSheet.getRange(this.statusDataRange).setValue("GAINING");
    this.updateGainingEntry(activitiesArray);
    return;
  }
  else if (this.haStatus == "GAINING") {
    this.updateGainingEntry(activitiesArray);
    return;
  }
  else if (this.haStatus == "MAINTAINING") {
    this.updateMaintainingEntry(activitiesArray);
    return;
  }
}


/*
  UPDATE GAINING ENTRY

  Determines current ha status

  @param date           string    date in dd/mm/yy
  @param activity       string    activity name
*/
User.prototype.updateGainingEntry = function(activitiesArray) {

  // declare vairables
  let startDateString, expiryDateString;
  let expiryDate;

  // Change expiry to date of newest activity
  expiryDateString = activitiesArray[activitiesArray.length-1].split(" ")[0];
  expiryDate = expiryDateString.toDate();

  // Change start date to date of first activity
  startDateString = activitiesArray[0].split(" ")[0];
  
  // Expiry is the immediate next day, unless on friday, saturday, sunday where expiry is monday
  if (expiryDate.getDay() == 5) {
    expiryDate.setDate(expiryDate.getDate() + 3);
  }
  else if (expiryDate.getDay() == 6) {
    expiryDate.setDate(expiryDate.getDate() + 2);
  }
  else {
    expiryDate.setDate(expiryDate.getDate() + 1);
  }

  // Set expiry date and start date
  expiryDateString = expiryDate.toStdString();
  this.nominalRollSheet.getRange(this.expiryDataRange).setValue(expiryDateString.toString());
  this.nominalRollSheet.getRange(this.startDataRange).setValue(startDateString.toString());

  // Update every entry in monthly calendar
  for (let i = 0; i < activitiesArray.length; i++) {
    let tmpDate = activitiesArray[i].split(" ")[0];
    let tmpLabel = "D" + (i+1).toString();
    this.updateMonthlySheet(tmpDate, tmpLabel);
  }

  // IF GAINING COMPLETE
  if (activitiesArray.length == 7) {
    // clear recents
    this.nominalRollSheet.getRange(this.recentsDataRange).setValue("");
    
    // Change state to maintaining
    this.nominalRollSheet.getRange(this.statusDataRange).setValue("MAINTAINING");

    // Expiry date updated to 14 days after last activity
    expiryDateString = activitiesArray[activitiesArray.length-1].split(" ")[0];
    expiryDate = expiryDateString.toDate();
    expiryDate.setDate(expiryDate.getDate() + 14);
    expiryDateString = expiryDate.toStdString();
    this.nominalRollSheet.getRange(this.expiryDataRange).setValue(expiryDateString.toString());

    // Start date updated to date of last activity
    startDateString = activitiesArray[activitiesArray.length-1].split(" ")[0];
    this.nominalRollSheet.getRange(this.startDataRange).setValue(startDateString.toString());
  }
}


/*
  UPDATE MAINTAINING ENTRY

  Determines current ha status

  @param date           string    date in dd/mm/yy
  @param activity       string    activity name
*/
User.prototype.updateMaintainingEntry = function(activitiesArray) {

  // variables
  let startDate, expiryDate, a1Date, a2Date;
  let startDateString, expiryDateString, a1DateString, a2DateString;
  let lastValidA2Date = null;
  let expiredIndex = null; // last expired index

  // start date
  startDateString = this.haStart;
  startDate = startDateString.toDate();

  // threshold date
  let thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate()-MAX_DAYS_ELAPSED);

  // Process list of dates
  let i = 0;
  while (i < activitiesArray.length) {

    // if this is last/only activity
    if (i == activitiesArray.length-1) {
      a1DateString = activitiesArray[i].split(" ")[0];
      this.updateMonthlySheet(a1DateString, "1");
      return;
    }

    // convert pair of activities to date
    a1DateString = activitiesArray[i].split(" ")[0];
    a1Date = a1DateString.toDate();
    a2DateString = activitiesArray[i+1].split(" ")[0];
    a2Date = a2DateString.toDate();

    let startToA1 = diffDays(startDate, a1Date);
    let startToA2 = diffDays(startDate, a2Date);
    let diffA1toA2 = diffDays(a1Date,a2Date);

    // Valid pair A, B
    if (startToA1 <= 13 && diffA1toA2 <= 7) {
      this.updateMonthlySheet(a1DateString, "A");
      this.updateMonthlySheet(a2DateString, "B");

      // if 2nd activity has passed the threshold, it can no longer be affected, all prior activities may be removed
      if (a2Date < thresholdDate) {
        expiredIndex = i + 1;
      }
      lastValidA2Date = a2Date;
      i = i + 2;
    }
    // Invalid pair, 2nd date still valid
    else if (startToA2 <= 13) {
      this.updateMonthlySheet(a1DateString, "1");
      i = i + 1;
    }
  }

  // OLD ACTIVITIES TO BE REMOVED
  if (expiredIndex != null) {
    
    // remove old activities
    activitiesArray = activitiesArray.slice(expiredIndex + 1);

    // update start
    // TBC its not possible for the array to be empty bc we just entered a valid one
    startDateString = activitiesArray[0].split(" ")[0];
    this.nominalRollSheet.getRange(this.startDataRange).setValue(startDateString);
    
    // update expiry
    expiryDate = a2Date;
    expiryDate.setDate(expiryDate.getDate() + 14);
    expiryDateString = expiryDate.toStdString();
    this.nominalRollSheet.getRange(this.expiryDataRange).setValue(expiryDateString);

    // update recents
    let newData = activitiesArray.toString();
    this.nominalRollSheet.getRange(this.recentsDataRange).setValue(newData);
  }
  // IF THERE ARE VALID PAIRS
  else if (lastValidA2Date != null) {

    // update expiry
    expiryDate = lastValidA2Date;
    expiryDate.setDate(expiryDate.getDate() + 14);
    expiryDateString = expiryDate.toStdString();
    this.nominalRollSheet.getRange(this.expiryDataRange).setValue(expiryDateString);
  }
  // IF THERE ARE NO VALID PAIRS
  else {
    return;
  }
}


/*
  UPDATE MONTHLY DATASHEET

  Updates the monthly datasheet

  @param date               date string of the activity
  @param activityLabel      A, B, D1 depending on type
*/
User.prototype.updateMonthlySheet = function(date, activityLabel) {

  let activityMonth = parseInt(date.split("/")[1]);
  let activityYear = parseInt(date.split("/")[2]);
  let activityMonthYear = MONTHS[activityMonth] + " " + activityYear;
  let col = parseInt(date.split("/")[0]) + LEFT_OFFSET_CELLS;

  let ssId = SSID;
  var monthSheet = SpreadsheetApp.openById(ssId).getSheetByName(activityMonthYear);
  
  // Create sheet for month from template if doesn't exist
  if (!monthSheet) {
    let templateSheet = SpreadsheetApp.openById(ssId).getSheetByName("MonthlyTemplate");
    SpreadsheetApp.openById(ssId).insertSheet(activityMonthYear, {template: templateSheet});
    var newMonthSheet = SpreadsheetApp.openById(ssId).getSheetByName(activityMonthYear);

    // number of days in month of activity
    let daysInMonth = new Date(activityYear, activityMonth, 0).getDate();
    if (daysInMonth < 31) {
      newMonthSheet.deleteColumns(daysInMonth + 1 + LEFT_OFFSET_CELLS, 31 - daysInMonth);   // Delete additional day columns
    }
    newMonthSheet.getRange(this.rowNumber, col).setValue(activityLabel);    
  }
  else {
    monthSheet.getRange(this.rowNumber, col).setValue(activityLabel);    
  }
}


/*
  SORT ENTRIES

  Sorts entries in order of date
*/
User.prototype.compareEntries = function(entryA, entryB) {

  entryA = entryA.split(" ")[0];
  entryB = entryB.split(" ")[0];

  let entryDateA = entryA.toDate();
  let entryDateB = entryB.toDate();

  if (entryDateA < entryDateB) 
  {
    return -1;
  }
  else if (entryDateA > entryDateB)
  {
    return 1;
  }
  else
  {
    return 0;
  }
}






