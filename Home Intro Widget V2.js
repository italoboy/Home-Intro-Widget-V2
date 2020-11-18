// by italoboy
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: sun;
const YOUR_NAME 	= ''
const LOCALE 		= ''
const API_WEATHER 	= ""; //Load Your api here
const CITY_WEATHER 	= ""; //add your city ID
const THEME_COLOR	= '#ffffff'

const today 		= new Date();

const fm 			= FileManager.iCloud()
const CACHE_FOLDER 	= 'cache/widgetHello'
const CACHE_PATH 	= fm.joinPath(fm.documentsDirectory(), CACHE_FOLDER)
const BG_FILE 		= 'widgetHelloBG.jpg'
const backgroundPath= fm.joinPath(CACHE_PATH, BG_FILE)
const themeColor 	= new Color(THEME_COLOR);

var online = true;
var cacheFound = false;

const padding = 5;

const  localizedText = {
  
	sleepGreeting: ""
	,morningGreeting: ""
	,noonGreeting: ""
	,afternoonGreeting: ""
	,eveningGreeting: ""
	,nightGreeting:""

	// Battery status text set

	,BatteryText0:  " ⚡" 
	,BatteryText1:  " ⚡ "
	,BatteryText2:  " " 
	,BatteryText3:  " " 
	,BatteryText4:  " " 
	,BatteryText5:  " " 
	,BatteryText6:  " " 
	,BatteryText7:  " " 
	,BatteryText8:  " "
	,BatteryText9:  " " 
	,BatteryText10: " " 
	,BatteryText12: "Battery⚡️"

	
	,YearText0: "" 
	,YearText1: " 𝒚𝒐𝒖 𝒅𝒊𝒅 𝒚𝒐𝒖𝒓 𝒃𝒆𝒔𝒕 𝒕𝒐𝒅𝒂𝒚 ?!"

}

// Battery status color set

const FullyChargedColor = new Color("ff5f40") 
const ChargingColor     = new Color("5e5ce6")
const AdequateColor     = new Color("c4fb6d")
const NormalColor       = new Color("d3de32")
const Low1Corl          = new Color("e5df88")
const Low2Corl          = new Color("ffd571")
const ScarcityColor     = new Color("ec0101")
const SColor     = new Color("ffffff")


// Battery font
const BatteryTextFont = Font.boldSystemFont(17); //new Font("Menlo", 12),
const BatteryTextOpacity = (1);
/*
 * BATTERY
 * ==============
*/

// Battery Render

function getBatteryLevel() {
	const batteryLevel = Device.batteryLevel()
	const batteryAscii = Math.round(batteryLevel * 100);
	return batteryAscii + "%";
}
function renderBattery() { 
	const batteryLevel = Device.batteryLevel(); 
	const juice = "▓".repeat(Math.floor(batteryLevel * 10)); 
	const used = "░".repeat(10 - juice.length);
	const batteryAscii = " " + juice + used + " " ; 
	return batteryAscii; 
}

fm.createDirectory(CACHE_PATH,true)
if (!fm.fileExists(backgroundPath)) {
	await setBackground(backgroundPath)
}


if (config.runsInWidget) {
	const widget = await createWidget()
	Script.setWidget(widget);
} else {
	const menu = new Alert()
	menu.message = 'Options'
	menu.addAction('Change Background')
	menu.addAction('Preview Widget')
	menu.addAction('Cancel')

	const resp = await menu.presentAlert()
	switch (resp) {
		case 0:
			await setBackground(backgroundPath)
		case 1:
			const widget = await createWidget()
			widget.presentMedium()
		default:
	}

}


async function createWidget() {
	let weatherurl = `http://api.openweathermap.org/data/2.5/weather?id=${CITY_WEATHER}&APPID=${API_WEATHER}&units=metric`;
	try {
		var wttr = await downloadJson(weatherurl);
		fm.writeString(fm.joinPath(CACHE_PATH, "wttr.json"), JSON.stringify(wttr));
	} catch(e) {
		try {
			online = false;
			await fm.downloadFileFromiCloud(fm.joinPath(CACHE_PATH, "wttr.json"));
			var wttr = JSON.parse(fm.readString(fm.joinPath(CACHE_PATH, "wttr.json")));
			cacheFound = true;
		} catch (e) {
			cacheFound = false;
		}
	}

	const widget = new ListWidget(); 
widget.setPadding(5, 0, 0, 0)
	// Background image
	widget.backgroundImage = Image.fromFile(backgroundPath);
	
	// Greeting label
	let greeting = getGreeting(today)
	let hello = widget.addText(greeting);
	hello.font = Font.boldSystemFont(21);
	hello.textColor = themeColor;
	hello.leftAlignText();
	 
	let hStack = widget.addStack();
	hStack.layoutHorizontally();
	hStack.centerAlignContent()
	
	// Date label in stack
	//const dateString = `${formatDate('EEEE, MMM dd',today)}${nth(today.getDate())}`
	const dateString = formatDate('EEEE d MMMM',today)
	const datetext = hStack.addText(dateString);
	datetext.font = Font.boldSystemFont(20);
	datetext.textColor = themeColor;
	datetext.textOpacity = (0.5);
	datetext.leftAlignText();
	
	// spacer to push date & weather to the sides
	hStack.addSpacer(8)
	
	// weather icon
	const img = await getWeatherIcon(wttr.weather[0].icon)
	const widgetimg = hStack.addImage(img);
	widgetimg.imageSize = new Size(21,21);
	widgetimg.rightAlignImage();
	
	// tempeture
	const tempStr = `${Math.round(wttr.main.temp)}\u2103`
	let temptext = hStack.addText(tempStr+'\xa0\xa0');
	temptext.font = Font.boldSystemFont(20);
	temptext.textColor = themeColor;
	temptext.textOpacity = (0.5);
    temptext.centerAlignText();

	//  offline indicator
	if (!online) {
		let offlinelabel = hStack.addText("⚠️");
	}
	
	//Battery
	let batteryStack = widget.addStack();
	batteryStack.layoutHorizontally();
	batteryStack.setPadding(padding/2 , 0, padding/2, padding)

// Battery icon in stack

const batteryicon = batteryStack.addText(localizedText.BatteryText12);
	batteryicon.font = BatteryTextFont;
if(Device.isCharging() && Device.batteryLevel()  < 1){
  	batteryicon.textColor = SColor; //font color
  
} if(Device.isCharging() && Device.batteryLevel() >= 1 || Device.isFullyCharged()){
  	batteryicon.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0.8 && Device.batteryLevel() <= 1 &&  !Device.isCharging()){
  	batteryicon.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0.5 && Device.batteryLevel() < 0.8 && !Device.isCharging()){
  	batteryicon.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0.3 && Device.batteryLevel() < 0.5 && !Device.isCharging()){
  	batteryicon.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0.2 && Device.batteryLevel() < 0.3 && !Device.isCharging()){
  	batteryicon.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0 &&   Device.batteryLevel() < 0.2 && !Device.isCharging()){
	batteryicon.textColor = SColor; //font color

}
	batteryicon.textOpacity = BatteryTextOpacity; //opacity

// Battery Progress in stack

const batteryLine = batteryStack.addText(renderBattery());
	batteryLine.font = new Font("Menlo", 14); //font and size
if(Device.isCharging() && Device.batteryLevel()  < 1){
  	batteryLine.textColor = ChargingColor; //font color
} if(Device.isCharging() && Device.batteryLevel() >= 1 || Device.isFullyCharged()){
	batteryLine.textColor = FullyChargedColor; //font color
} else if(Device.batteryLevel() >= 0.8 && Device.batteryLevel() <= 1  && !Device.isCharging()){
  	batteryLine.textColor = AdequateColor; //font color
} else if(Device.batteryLevel() >= 0.5 && Device.batteryLevel() < 0.8 && !Device.isCharging()){
 	batteryLine.textColor = NormalColor; //font color
} else if(Device.batteryLevel() >= 0.3 && Device.batteryLevel() < 0.5 && !Device.isCharging()){
  	batteryLine.textColor = Low1Corl; //font color
  
} else if(Device.batteryLevel() >= 0.2 && Device.batteryLevel() < 0.3 && !Device.isCharging()){
  	batteryLine.textColor = Low2Corl; //font color
  
} else if(Device.batteryLevel() >= 0 &&   Device.batteryLevel() < 0.2 && !Device.isCharging()){
  	batteryLine.textColor = ScarcityColor; //font color
}
	batteryLine.textOpacity = BatteryTextOpacity;

// Battery Status in stack

var battery =  getBatteryLevel();

// Battery Status Color

let batterytext = batteryStack.addText(battery);
	batterytext.font = BatteryTextFont; //font and size
if(Device.isCharging() && Device.batteryLevel() < 1){
	batterytext.textColor = SColor; //font color

} if(Device.isCharging() && Device.batteryLevel() >= 1 || Device.isFullyCharged()){
  	batterytext.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0.8 && Device.batteryLevel() <= 1 && !Device.isCharging()){
  	batterytext.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0.5 && Device.batteryLevel() < 0.8 && !Device.isCharging()){
  	batterytext.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0.3 && Device.batteryLevel() < 0.5 && !Device.isCharging()){
  	batterytext.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0.2 && Device.batteryLevel() < 0.3 && !Device.isCharging()){
  	batterytext.textColor = SColor; //font color
  
} else if(Device.batteryLevel() >= 0 && Device.batteryLevel() < 0.2 && !Device.isCharging()){
	batterytext.textColor = SColor; //font color

}
	batterytext.textOpacity = BatteryTextOpacity; //opacity

	 
	// Bottom Spacer to push everyting to the top
	widget.addSpacer();

	return widget
}

async function setBackground(backgroundPath) {
	var selectedBG = await Photos.fromLibrary()
	await fm.writeImage(backgroundPath, selectedBG)
}

function getGreeting(date) {
	// Greetings arrays per time period. 
	var greetingsMorning = [
		`Good morning, ${YOUR_NAME}.`
	];
	var greetingsAfternoon = [
		`Good afternoon, ${YOUR_NAME}.`
	];
	var greetingsEvening = [
		`Good evening, ${YOUR_NAME}.`
	];
	var greetingsNight = [
		`Good night, ${YOUR_NAME}.`
	];
	var greetingsLateNight = [
		`Good night, ${YOUR_NAME}.`
	];

	// Holiday customization
	var holidaysByKey = {
		// month,week,day: datetext
		"11,4,4": "Happy Thanksgiving!"
	}

	var holidaysByDate = {
		// month,date: greeting
		"1,1": "Happy " + (today.getFullYear()).toString() + "!",
		"10,31": "Happy Halloween!",
		"12,25": "Merry Christmas!"
	}

	var greetings = ['Howdy']
	var greeting = greetings[0]
	var hour = date.getHours()

	if (hour < 5 && hour >= 1) { // 1am - 5am
		greetings = greetingsLateNight;
	} else if (hour >= 20 || hour < 1) { // 11pm - 1am
		greetings = greetingsNight
	} else if (hour < 12) { // Before noon (5am - 12pm)
		greetings = greetingsMorning
	} else if (hour >= 12 && hour <= 16) { // 12pm - 5pm
		greetings = greetingsAfternoon
	} else if (hour > 16 && hour < 20) { // 5pm - 11pm
		greetings = greetingsEvening
	} 

	greeting = randomItem(greetings)

	var holidayKey = (date.getMonth() + 1).toString() + "," +  (Math.ceil(date.getDate() / 7)).toString() + "," + (date.getDay()).toString();
	// Overwrite greeting if calculated holiday
	if (holidaysByKey[holidayKey]) {
		greeting = holidaysByKey[holidayKey];
	}

	var holidayKeyDate = formatDate('M,d', date)

		// Overwrite all greetings if specific holiday
	if (holidaysByDate[holidayKeyDate]) {
		greeting = holidaysByDate[holidayKeyDate];
	}

	return greeting

}

function randomItem(array) {
	return array[Math.floor(Math.random() * array.length)]
}

function formatDate(format, date){
	date = date || new Date()
	var df = new DateFormatter()
	df.locale = LOCALE
	df.dateFormat = format
	return df.string(date)
}
function nth(d) {
	// https://stackoverflow.com/a/15397495
	if (d > 3 && d < 21) return 'th';
	switch (d % 10) {
	  case 1:  return "st";
	  case 2:  return "nd";
	  case 3:  return "rd";
	  default: return "th";
	}
}

async function getWeatherIcon(icon_name) {
	var icon_path = fm.joinPath(CACHE_PATH, `${icon_name}.png`)
	if (fm.fileExists(icon_path)) {
		await fm.downloadFileFromiCloud(icon_path)
		return Image.fromFile(icon_path)
	} else {
		// download icon
		const iconImage = await downloadWeatherIcon(icon_name)
		fm.writeImage(icon_path, iconImage)
		return iconImage
	}
}

async function downloadWeatherIcon(icon_name) {
	const url = "http://a.animedlweb.ga/weather/weathers25_2.json";
	const req = new Request(url)
	const json = await req.loadJSON()
	const icon_url = json.icon[`_${icon_name}`]
	const iconImage = await downloadImage(icon_url)
	return iconImage
}

async function downloadImage(url) {
	const request = new Request(url)
	var res = await request.loadImage();
	return res;
}

async function downloadJson(url) {
	const request = new Request(url)
	var res = await request.loadJSON();
	return res;
}
