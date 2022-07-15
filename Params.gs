// Telegram bot token
const TELEBOT_TOKEN = '';

// Telegram bot official api (Not Nodejs)
const TELEBOT_API = 'https://api.telegram.org/bot';

// Spreadsheet ID
const SSID = '';

// Deployment URL
const DEP_URL = '';



/*
FORM SETTINGS

*/
// Button spacing to each side, in spaces
const BUTTON_PADDING = "     ";

// maximum days elapsed from activity within which it new activity added
const MAX_DAYS_ELAPSED = 7;

// After previous period's last day, how far away is expiry in subsequent period
const HA_MAINTAINING_PERIOD = 14;

// Number of activities required to clock y1 and y2
const HA_GAINING_Y1_QUOTA = 10;
const HA_GAINING_Y2_QUOTA = 7;



/*
VALID COMMANDS

*/
// List of valid typed commands into bot
const VALID_COMMANDS =  ['/start', '/help', '/authenticate', '/addactivity', '/checkhastatus', '/addlesson', '/checklessonstaus'];

// List of valid activities
const VALID_ACTIVITIES = ['LIFE', 'VOC(1-3)', 'DI', 'FARTLEK', 'SAQ', 'BFM', 'STRENGTH', 'OTHERS'];



/*
SPREADSHEET DATA POSITIONS

*/
// offset of cells from the top
const TOP_OFFSET_CELLS = 3;

// offset of cells from the left
const LEFT_OFFSET_CELLS = 7;

// Nominal roll name column
const NAME_COL = "A";

// Column of telegram Id of each user
const TELE_ID_COL_RANGE = "B4:B102";
const TELE_ID_COL = "B";

// year of service column
const YEAR_COL = "C";

// HA valid column
const HA_VALID_COL = "D";

// HA status column
const HA_STATUS_COL = "E";

// ha last until column
const HA_START_COL = "F";

// HA expiry date column
const HA_EXPIRY_COL = "G"

// recents column
const RECENTS_COL = "H";



/*
UTILITIES

*/
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const MONTHS = [null, "January","February","March","April","May","June","July","August","September","October","November","December"];
