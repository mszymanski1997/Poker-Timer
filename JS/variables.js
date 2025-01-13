// Main page - left list
const nextBlinds = document.querySelector('.next-blinds');
const averageStack = document.querySelector('.average-stack');
const buyIns = document.querySelector('.buy-ins');
const rebuys = document.querySelector('.rebuys');
const totalChips = document.querySelector('.total-chips');
// Main page - timer
const timerCounter = document.querySelector('.timer__counter');
const currentBlinds = document.querySelector('.current-blinds');
const currentBlindsP = document.querySelector('.current-blinds-text');
const playBtn = document.querySelector('.play-btn');
const pauseBtn = document.querySelector('.pause-btn');
const settingsBtn = document.querySelector('.settings-btn');
const rewindBtn = document.querySelector('.rewind-btn');
const forwardBtn = document.querySelector('.forward-btn');
const playIcon = document.querySelector('#play-icon');
// Main page - right list
const playersIn = document.querySelector('.players-in');
const totalMoney = document.querySelector('.total-money');
const firstReward = document.querySelector('.first-reward');
const secondReward = document.querySelector('.second-reward');
//  Settings
const settings = document.querySelector('.settings');
const settingsContainer = document.querySelector('.settings-container');
const buyInsInput = document.querySelector('.buy-ins-input');
const buyInValueInput = document.querySelector('.buy-in-value-input');
const rebuysInput = document.querySelector('.rebuys-input');
const startingStackInput = document.querySelector('.starting-stack-input');
const playersInInput = document.querySelector('.players-in-input');
const confirmBtn = document.querySelector('.confirm-btn');
const addBreakBtn = document.querySelector('.break');
const breakPopup = document.querySelector('.break-popup');
// Blind settings
const addBtn = document.querySelector('.add-btn');
const deleteBtn = document.querySelector('.delete-btn');
const bigBlindInput = document.querySelector('.big-blind-input');
const smallBlindInput = document.querySelector('.small-blind-input');
const durationInput = document.querySelector('.duration-input');

const blindsData = {
	bigBlind: [],
	smallBlind: [],
	duration: [],
};

const audioPokerChips = document.querySelector('.audio');
const audioChangeBlind = document.querySelector('.ding-audio');

export const variables = {
	nextBlinds,
	averageStack,
	buyIns,
	rebuys,
	totalChips,
	timerCounter,
	currentBlinds,
	playBtn,
	pauseBtn,
	settingsBtn,
	playersIn,
	totalMoney,
	firstReward,
	secondReward,
	settings,
	buyInsInput,
	buyInValueInput,
	rebuysInput,
	startingStackInput,
	playersInInput,
	confirmBtn,
	addBtn,
	deleteBtn,
	bigBlindInput,
	smallBlindInput,
	durationInput,
	settingsContainer,
	playIcon,
	rewindBtn,
	forwardBtn,
	blindsData,
	audioPokerChips,
	audioChangeBlind,
	currentBlindsP,
	addBreakBtn,
	breakPopup
};
