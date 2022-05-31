// Telegram bot token
const TELEBOT_TOKEN = '1594934478:AAF76vNdzFqEeuxzgJG99wW0mgbc5gZgBX8';

// Telegram bot official api (Not Nodejs)
const TELEBOT_API = "";

// Spreadsheet ID
const SSID = "";

// Deployment URL
const DEP_URL = "";




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




/*
VALID COMMANDS

*/
// List of valid typed commands into bot
const VALID_COMMANDS =  ['/start', '/help', '/authenticate', '/addactivity', '/checkhastatus', '/addlesson', '/checklessonstaus'];

// List of valid callback data, excusing otherwise it must be a new activity entry
const VALID_CALLBACKS = ['LIFE', 'TABATA', 'VOC', 'DI', 'OTHERS'];
