// Telegram bot token
const TELEBOT_TOKEN = "";   // enter your bot token here

// Telegram bot official api (Not Nodejs)
const TELEBOT_API = 'https://api.telegram.org/bot';

// Spreadsheet ID
const SSID = "";  // enter id of the google spreadsheet you would like data to be sent to here

// Deployment URL
const DEP_URL = ""; // the deployment url 


/*
SPREADSHEET DATA POSITIONS

*/
// maximum days elapsed from activity within which it can still be added
const MAX_DAYS_ELAPSED = 5;

// offset of cells from the top
const TOP_OFFSET_CELLS = 5;

// Nominal roll name column
const NAME_COL_RANGE = "A5:A41";

// Column of telegram Id of each user
const TELE_ID_COL_RANGE = "B5:B41";

// HA valid column
const HA_VALID_COL_RANGE = "C5:C41";


