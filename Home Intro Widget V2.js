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
	// 每个时段问候语
	sleepGreeting: "赶紧睡觉!!!"
	,morningGreeting: "早上好.靓仔"
	,noonGreeting: "中午好.靓仔"
	,afternoonGreeting: "下午好.靓仔"
	,eveningGreeting: "晚上好.靓仔"
	,nightGreeting:"睡觉时间.靓仔"

	// Battery status text set
	// 电量状态提示语设置
	,BatteryText0:  " ⚡" //当接入充电电源提示符
	,BatteryText1:  " ⚡ 已充满电!请拔下电源!" //当充满电还在充电中
	,BatteryText2:  " 电量充足,很有安全感!!!" //当电量在80-100%
	,BatteryText3:  " 电量充足,不出远门没有问题!" //当电量在70-80%
	,BatteryText4:  " 电量还有大半呢,不用着急充电!" //当电量在50-70%
	,BatteryText5:  " 电量用了一半,有时间就充电啦!" //当电量在40-50%
	,BatteryText6:  " 电量用了大半了,尽快充电啦!" //当电量在30-40%
	,BatteryText7:  " 电量就快用完,赶紧充电!" //当电量在20-30%
	,BatteryText8:  " 电量就剩不到20%了,尽快充电!" //当电量在10-20%
	,BatteryText9:  " 电量将耗尽,再不充电我就关机了!" //当电量少于10%
	,BatteryText10: " 正在充入电能中..." //当电量在 < 50%
	,BatteryText12: "Battery⚡️" //电量前的文字

	//年进度
	,YearText0: "今年" //年进度前的文字
	,YearText1: " 𝒚𝒐𝒖 𝒅𝒊𝒅 𝒚𝒐𝒖𝒓 𝒃𝒆𝒔𝒕 𝒕𝒐𝒅𝒂𝒚 ?!" //年进度标语

}

// Battery status color set
// 电量状态颜色设置
const FullyChargedColor = new Color("ff5f40") //满电提示颜色（判断条件：电量在充电中，并充满电的状态）
const ChargingColor     = new Color("5e5ce6") //正在充电中  （判断条件：在充电中且未充满电）
const AdequateColor     = new Color("c4fb6d") //电量充足颜色（判断条件：电量在80-100%）
const NormalColor       = new Color("d3de32") //电量正常颜色（判断条件：电量在50-79%）
const Low1Corl          = new Color("e5df88") //电量低颜色  （判断条件：电量在30-49%）
const Low2Corl          = new Color("ffd571") //电量偏低颜色（判断条件：电量在20-39%）
const ScarcityColor     = new Color("ec0101") //电量极低颜色（判断条件：电量在0-19%）
const SColor     = new Color("ffffff") //电量极低颜色（判断条件：电量在0-19%）


// 电量提示语字体大小设置
const BatteryTextFont = Font.boldSystemFont(17); //如果使用非系统字体请用这个格式：new Font("Menlo", 12),""内是字体,数字是字体大小
const BatteryTextOpacity = (1); //字体不透明度0-1,0.5=半透明
/*
 * BATTERY/电池电量
 * ==============
*/

// Battery Render
// 电量信息
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
// 电量图标、标签、颜色
const batteryicon = batteryStack.addText(localizedText.BatteryText12);
	batteryicon.font = BatteryTextFont;
if(Device.isCharging() && Device.batteryLevel()  < 1){
  	batteryicon.textColor = SColor; //font color,充电状态字体颜色
} if(Device.isCharging() && Device.batteryLevel() >= 1 || Device.isFullyCharged()){
  	batteryicon.textColor = SColor; //font color,满电提示字体颜色
} else if(Device.batteryLevel() >= 0.8 && Device.batteryLevel() <= 1 &&  !Device.isCharging()){
  	batteryicon.textColor = SColor; //font color,电量充足字体颜色
} else if(Device.batteryLevel() >= 0.5 && Device.batteryLevel() < 0.8 && !Device.isCharging()){
  	batteryicon.textColor = SColor; //font color,电量正常字体颜色
} else if(Device.batteryLevel() >= 0.3 && Device.batteryLevel() < 0.5 && !Device.isCharging()){
  	batteryicon.textColor = SColor; //font color,电量偏低字体颜色
} else if(Device.batteryLevel() >= 0.2 && Device.batteryLevel() < 0.3 && !Device.isCharging()){
  	batteryicon.textColor = SColor; //font color,电量低字体颜色
} else if(Device.batteryLevel() >= 0 &&   Device.batteryLevel() < 0.2 && !Device.isCharging()){
	batteryicon.textColor = SColor; //font color,电量不足字体颜色
}
	batteryicon.textOpacity = BatteryTextOpacity; //opacity,不透明度

// Battery Progress in stack
// 电量进度条、颜色
const batteryLine = batteryStack.addText(renderBattery());
	batteryLine.font = new Font("Menlo", 14); //font and size,字体与大小
if(Device.isCharging() && Device.batteryLevel()  < 1){
  	batteryLine.textColor = ChargingColor; //font color,充电状态字体颜色
} if(Device.isCharging() && Device.batteryLevel() >= 1 || Device.isFullyCharged()){
	batteryLine.textColor = FullyChargedColor; //font color,满电提示字体颜色
} else if(Device.batteryLevel() >= 0.8 && Device.batteryLevel() <= 1  && !Device.isCharging()){
  	batteryLine.textColor = AdequateColor; //font color,电量充足字体颜色
} else if(Device.batteryLevel() >= 0.5 && Device.batteryLevel() < 0.8 && !Device.isCharging()){
 	batteryLine.textColor = NormalColor; //font color,电量正常字体颜色
} else if(Device.batteryLevel() >= 0.3 && Device.batteryLevel() < 0.5 && !Device.isCharging()){
  	batteryLine.textColor = Low1Corl; //font color,电量偏低字体颜色
} else if(Device.batteryLevel() >= 0.2 && Device.batteryLevel() < 0.3 && !Device.isCharging()){
  	batteryLine.textColor = Low2Corl; //font color,电量低字体颜色
} else if(Device.batteryLevel() >= 0 &&   Device.batteryLevel() < 0.2 && !Device.isCharging()){
  	batteryLine.textColor = ScarcityColor; //font color,电量不足字体颜色
}
	batteryLine.textOpacity = BatteryTextOpacity;

// Battery Status in stack
// 电量状态、提示语
var battery =  getBatteryLevel();

// Battery Status Color
// 电量状态颜色
let batterytext = batteryStack.addText(battery);
	batterytext.font = BatteryTextFont; //font and size,字体与大小
if(Device.isCharging() && Device.batteryLevel() < 1){
	batterytext.textColor = SColor; //font color,充电状态字体颜色
} if(Device.isCharging() && Device.batteryLevel() >= 1 || Device.isFullyCharged()){
  	batterytext.textColor = SColor; //font color,满电提示字体颜色
} else if(Device.batteryLevel() >= 0.8 && Device.batteryLevel() <= 1 && !Device.isCharging()){
  	batterytext.textColor = SColor; //font color,电量充足字体颜色
} else if(Device.batteryLevel() >= 0.5 && Device.batteryLevel() < 0.8 && !Device.isCharging()){
  	batterytext.textColor = SColor; //font color,电量正常字体颜色
} else if(Device.batteryLevel() >= 0.3 && Device.batteryLevel() < 0.5 && !Device.isCharging()){
  	batterytext.textColor = SColor; //font color,电量偏低字体颜色
} else if(Device.batteryLevel() >= 0.2 && Device.batteryLevel() < 0.3 && !Device.isCharging()){
  	batterytext.textColor = SColor; //font color,电量低字体颜色
} else if(Device.batteryLevel() >= 0 && Device.batteryLevel() < 0.2 && !Device.isCharging()){
	batterytext.textColor = SColor; //font color,电量不足字体颜色
}
	batterytext.textOpacity = BatteryTextOpacity; //opacity,不透明度

	 
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
