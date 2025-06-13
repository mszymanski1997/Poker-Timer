import {
	nextBlinds,
	averageStack,
	buyIns,
	rebuys,
	totalChips,
	timerCounter,
	currentBlinds,
	currentBlindsP,
	currentAnteP,
	currentAnte,
	currentLevel,
	playBtn,
	settingsBtn,
	rewindBtn,
	forwardBtn,
	playIcon,
	playersIn,
	totalMoney,
	firstReward,
	secondReward,
	settings,
	settingsContainer,
	buyInsInput,
	buyInValueInput,
	rebuysInput,
	startingStackInput,
	confirmBtn,
	playersInInput,
	addBlindBtn,
	addBreakBtn,
	breakModal,
	closeModalBtn,
	warningMessage,
} from './dom-elements.js';

const blindsData = {
	bigBlind: [],
	ante: [],
	smallBlind: [],
	duration: [],
};

const audioPokerChips = document.querySelector('.audio');
const audioChangeBlind = document.querySelector('.ding-audio');

let i = 0;
let time = 25 * 60;
let timerInterval;
let validationErrors = [];
let id = 0;
const screenWidth = window.innerWidth;
let everythingWasDeleted = false;
let breakCounter = 0;

// Function displays the settings

const showSettings = () => {
	settings.classList.remove('animation-hide-start');
	settings.classList.add('animation-start');
	settings.classList.toggle('disabled');
	const allInputs = document.querySelectorAll('.blind-input');
	allInputs.forEach((input) => {
		input.addEventListener('input', (e) => updateInputsFontSize(e.target));
	});
	addIds();

	const allDurationInputs = document.querySelectorAll('.duration-input');
	allDurationInputs.forEach((input) => {
		const currentID = input.closest('.settings-div').id;

		if (currentID == i) {
			input.addEventListener('input', (e) =>
				dynamicChangeOfDuration(e.target.value)
			);
		}
	});
};

// Function allows editing the current blind duration by increasing or decreasing it based on the difference from the new one

const dynamicChangeOfDuration = (newTime) => {
	if (isNaN(parseInt(newTime))) {
		console.warn('Błędna wartość inputa:', newTime);
		return;
	}

	let timerText = timerCounter.textContent;

	const currentTime =
		timerText.length >= 4
			? parseInt(timerText.slice(0, 2))
			: parseInt(timerText.slice(0, 1));
	const newInputTime = parseInt(newTime);
	let differnce;
	if (currentTime > newInputTime) {
		differnce = currentTime - newInputTime;
	} else {
		differnce = newInputTime - currentTime;
	}

	const timeAfterChanges =
		timerText.slice(-2) == '00'
			? currentTime > newInputTime
				? currentTime - differnce
				: currentTime + differnce
			: currentTime > newInputTime
			? currentTime - differnce - 1
			: currentTime + differnce - 1;

	const currentSeconds = timerText.slice(-2);

	time = timeAfterChanges * 60 + parseInt(currentSeconds);
	minutes = timeAfterChanges;
	seconds = parseInt(currentSeconds);

	seconds = seconds < 10 ? '0' + seconds : seconds;

	timerCounter.textContent = `${minutes}:${seconds}`;
};

// Function fills the arrays with blinds and their durations, overwriting the time variable

const fillBlindsObject = () => {
	blindsData.bigBlind = [];
	blindsData.ante = [];
	blindsData.smallBlind = [];
	blindsData.duration = [];
	validationErrors = [];

	const validInput = (input, min) => {
		if (!input.value) {
			validationErrors.push('isEmpty');
			return min;
		} else if (input.value < min) {
			validationErrors.push('lowerThanMin');
			return min;
		} else {
			return input.value;
		}
	};

	const allAnteInputs = document.querySelectorAll('.ante-input');
	allAnteInputs.forEach((input) => {
		blindsData.ante.push(validInput(input, 0));
	});

	const allSmallBlindInputs = document.querySelectorAll('.small-blind-input');
	allSmallBlindInputs.forEach((input) => {
		blindsData.smallBlind.push(validInput(input, 1));
	});

	const allDurationInputs = document.querySelectorAll('.duration-input');
	allDurationInputs.forEach((input) => {
		blindsData.duration.push(validInput(input, 1));
	});

	const allBigBlindInputs = document.querySelectorAll('.big-blind-input');
	allBigBlindInputs.forEach((input, index) => {
		if (input.value === undefined) {
			blindsData.bigBlind.push('BREAK');
			blindsData.smallBlind.splice(index, 0, 'BREAK');
			blindsData.ante.splice(index, 0, 'BREAK');
		} else {
			blindsData.bigBlind.push(validInput(input, 1));
		}
	});
};

// Function checks if the arrays already contain elements; if not, it disables the button for undoing

const checkRewindBtn = () => {
	if (i == 0) {
		rewindBtn.disabled = true;
	} else {
		rewindBtn.disabled = false;
	}

	if (i + 1 >= blindsData.bigBlind.length) {
		forwardBtn.disabled = true;
	} else {
		forwardBtn.disabled = false;
	}
};

// Function hides the settings, checks if they can still be edited, and if so, displays them on the page. It also adds a warning if the next blind is not defined.

const hideSettings = () => {
	fillBlindsObject();

	if (blindsData.bigBlind.length === 0) {
		showBreakModal();
		warningMessage.textContent = 'You need to add at least one blind';
		return;
	}

	if (validationErrors.includes('isEmpty')) {
		showBreakModal();
		warningMessage.textContent = 'Every input field must be filled';
		return;
	}

	if (validationErrors.includes('lowerThanMin')) {
		showBreakModal();
		warningMessage.textContent =
			'All inputs values except ante must be higher than 0';
		return;
	}

	settings.classList.remove('animation-start');
	setValues();
	settings.classList.add('animation-hide-start');
	setBlinds();

	if (i == blindsData.bigBlind.length - 1) {
		nextBlinds.textContent = 'Add new blinds';
	}

	if (currentBlinds.classList.contains('editable')) {
		time = blindsData.duration[i] * 60;
		currentBlinds.classList.remove('editable');
		timerCounter.textContent = `${blindsData.duration[0]}:00`;
	}

	saveToLocalStorage();
	forwardBtn.disabled = false;

	setTimeout(() => {
		settings.classList.toggle('disabled');
	}, 400);

	checkRewindBtn();

	if (everythingWasDeleted) {
		i = 0;
		clearInterval(timerInterval);
		currentBlindsP.textContent = 'Current Blinds';
		currentAnteP.style.visibility = 'visible';
		currentBlinds.textContent = `${blindsData.bigBlind[i]}/${blindsData.smallBlind[i]}`;
		time = blindsData.duration[i] * 60;
		minutes = Math.floor(time / 60);
		seconds = time % 60;
		seconds = seconds < 10 ? '0' + seconds : seconds;
		timerCounter.textContent = `${minutes}:${seconds}`;
		everythingWasDeleted = false;
	}

	if (timerCounter.textContent === 'GAME OVER') {
		currentBlinds.textContent = '';
		nextBlinds.textContent = 'Add new blinds';
	}

	if (
		timerCounter.textContent === 'GAME OVER' &&
		i < blindsData.duration.length
	) {
		clearInterval(timerInterval);
		currentBlindsP.textContent = 'Current Blinds';
		currentAnteP.style.visibility = 'visible';
		currentBlinds.textContent = `${blindsData.bigBlind[i]}/${blindsData.smallBlind[i]}`;
		time = blindsData.duration[i] * 60;
		timerInterval = setInterval(countTime, 1000);
	}
};

// Function places values on the sides of the timer

const setValues = () => {
	buyIns.textContent = buyInsInput.value;
	rebuys.textContent = rebuysInput.value;
	playersIn.textContent = playersInInput.value;

	totalChips.textContent =
		(+buyInsInput.value + +rebuysInput.value) * startingStackInput.value;

	if (playersInInput.value == 0) {
		averageStack.textContent = 'Complete the data';
	} else {
		averageStack.textContent = Math.floor(
			+totalChips.textContent / playersInInput.value
		);
	}

	totalMoney.textContent = `${
		(+buyInsInput.value + +rebuysInput.value) * buyInValueInput.value
	}zł`;

	const totalMoneyValue = parseFloat(totalMoney.textContent);

	firstReward.textContent = `1. ${Math.round(totalMoneyValue * 0.7)}zł`;
	secondReward.textContent = `2. ${Math.round(totalMoneyValue * 0.3)}zł`;
};

// Function handles the play/pause button control

const handlePlayBtn = () => {
	if (playIcon.classList.contains('fa-play')) {
		playIcon.classList.remove('fa-play');
		playIcon.classList.add('fa-pause');
		timerInterval = setInterval(countTime, 1000);
	} else {
		playIcon.classList.remove('fa-pause');
		playIcon.classList.add('fa-play');
		timerInterval = clearInterval(timerInterval);
	}
};

// Function is responsible for the timer operation

const countTime = () => {
	let minutes = Math.floor(time / 60);
	let seconds = time % 60;

	seconds = seconds < 10 ? '0' + seconds : seconds;

	timerCounter.textContent = `${minutes}:${seconds}`;

	if (minutes === 1 && seconds == 0) {
		audioPokerChips.play();
	}

	if (time > 0) {
		time--;
	} else {
		clearInterval(timerInterval);
		audioChangeBlind.play();
		i++;
		if (i < blindsData.bigBlind.length) {
			changeBlinds();
		} else {
			timerCounter.textContent = 'GAME OVER';
			currentBlinds.textContent = '';
			currentBlindsP.textContent = '';
			nextBlinds.textContent = 'Add new blinds';
			currentAnteP.style.visibility = 'hidden';
			currentLevel.textContent = 'GAME OVER';
			handlePlayBtn();
		}
	}
};

// Function switches the blinds to the next ones

const changeBlinds = () => {
	if (i >= blindsData.bigBlind.length && i > 0) {
		clearInterval(timerInterval);
		return;
	} else {
		currentBlindsP.textContent = 'Current Blinds';
		currentAnteP.style.visibility = 'visible';
		setBlinds();
		checkRewindBtn();
	}

	time = blindsData.duration[i] * 60;
	countTime();
	timerInterval = setInterval(countTime, 1000);
	console.log(i);

	if (i == blindsData.bigBlind.length - 1) {
		nextBlinds.textContent = 'Add new blinds';
	}
};

// Function handles the rewind button

const handleRewidnBtn = () => {
	if (i <= 0) {
		return;
	} else {
		clearInterval(timerInterval);
		forwardBtn.disabled = false;
		i--;
		changeBlinds();
		if (playIcon.classList.contains('fa-play')) {
			playIcon.classList.remove('fa-play');
			playIcon.classList.add('fa-pause');
		}
		if (blindsData.bigBlind[i] === 'BREAK') {
			breakCounter = breakCounter - 2;
		}
	}

	checkRewindBtn();
};

// Function handles the forward button

const handleForwardBtn = () => {
	if (i + 1 >= blindsData.duration.length) {
		return;
	} else {
		clearInterval(timerInterval);
		i++;
		changeBlinds();
		if (playIcon.classList.contains('fa-play')) {
			playIcon.classList.remove('fa-play');
			playIcon.classList.add('fa-pause');
		}
	}

	if (i + 1 == blindsData.duration.length) {
		nextBlinds.textContent = 'Add new blinds';
		forwardBtn.disabled = true;
	}

	if (i !== 0) {
		rewindBtn.disabled = false;
	}
};

// Function adds a new break

const addBreak = () => {
	let newBlinds = document.createElement('div');
	newBlinds.setAttribute(
		'class',
		'settings-container__break big-blind-input settings-div'
	);
	newBlinds.innerHTML = `<div class="input-field "><label for="break-length" class="break-label">Break length:</label>
                    <input type="number" id="break-length" class="break-input duration-input" placeholder="Minutes">
                </div>
                <button class="settings-container__break-btn delete-btn">
                    <i class="fa-solid fa-xmark"></i>
                </button>`;
	settingsContainer.appendChild(newBlinds);
	settingsContainer.scrollTop = settingsContainer.scrollHeight;

	const allDeleteBtn = document.querySelectorAll('.delete-btn');

	allDeleteBtn.forEach((btn) =>
		btn.addEventListener('click', removeSettingsDiv)
	);
};

// Function renders the settings div visually along with its data from objects

const removeSettingsDiv = (e) => {
	const settingDiv = e.target.closest('.settings-div');
	const removedId = parseInt(settingDiv.id, 10);
	settingDiv.remove();

	if (removedId < i) {
		console.log('id < i');
		const allSettingsDivs = document.querySelectorAll('.settings-div');
		allSettingsDivs.forEach((settingDiv) => {
			settingDiv.id = settingDiv.id - 1;
		});
		console.log(allSettingsDivs);
		i--;
	} else if (removedId == i) {
		time = blindsData.duration[i + 1] * 60;
		minutes = Math.floor(time / 60);
		seconds = time % 60;
		seconds = seconds < 10 ? '0' + seconds : seconds;

		timerCounter.textContent = `${minutes}:${seconds}`;
		handlePlayBtn();

		if (i + 1 >= blindsData.duration.length) {
			console.log('id = i');
			timerCounter.textContent = 'GAME OVER';
			currentBlinds.textContent = '';
			currentBlindsP.textContent = '';
			currentAnteP.style.visibility = 'hidden';
			currentLevel.textContent = 'GAME OVER';
			nextBlinds.textContent = 'Add new blinds';
		}
	}

	console.log(i);

	if (!settingsContainer.querySelector('.settings-div')) {
		everythingWasDeleted = true;
	}
};

// Function opens the modal

const showBreakModal = () => {
	breakModal.showModal();
	settings.classList.add('modal-open');
	addBlindBtn.classList.add('modal-open');
	addBreakBtn.classList.add('modal-open');
	isValid = true;
};

// Function closes the modal

const closeModal = () => {
	breakModal.close();
	settings.classList.remove('modal-open');
	addBlindBtn.classList.remove('modal-open');
	addBreakBtn.classList.remove('modal-open');
};

// Function adds new blinds in the settings

const addNewBlinds = () => {
	let newBlinds = document.createElement('div');
	newBlinds.setAttribute('class', 'blinds-settings settings-div');
	newBlinds.innerHTML = `<label>
                    <p>Big Blind:</p>
                    <input type="number" class="big-blind-input blind-input" >
                </label>
                <label>
                    <p>Ante:</p>
                    <input type="number" class="ante-input blind-input" >
                </label>
                <label>
                    <p>Small Blind:</p>
                    <input type="number" class="small-blind-input blind-input" >
                </label>
                <label>
                    <p>Duration:</p>
                    <input type="number" class="duration-input blind-input" placeholder="Minutes" min='0' >
                </label>

                <button class="blinds-settings__btn delete-btn"><i class="fa-solid fa-xmark"></i></button>`;
	settingsContainer.appendChild(newBlinds);
	settingsContainer.scrollTop = settingsContainer.scrollHeight;

	const allInputs = document.querySelectorAll('.blind-input');
	allInputs.forEach((input) => {
		input.addEventListener('input', (e) => updateInputsFontSize(e.target));
	});

	const allDeleteBtn = document.querySelectorAll('.delete-btn');
	allDeleteBtn.forEach((btn) =>
		btn.addEventListener('click', removeSettingsDiv)
	);

	addIds();
};

// Function decreases the font size in the input depending on the resolution and the number of digits in it

const updateInputsFontSize = (input) => {
	const inputNumber = parseInt(input.value);

	if (screenWidth <= 549) {
		if (inputNumber >= 10000) {
			input.style.fontSize = '12px';
			if (inputNumber >= 1000000) {
				input.style.fontSize = '10px';
				if (inputNumber >= 100000000) {
					input.style.fontSize = '8px';
				}
			}
		} else {
			input.style.fontSize = '15px';
		}
	}

	if (screenWidth > 1450) {
		if (inputNumber >= 100000) {
			input.style.fontSize = '13px';
			if (inputNumber >= 10000000) {
				input.style.fontSize = '11px';
			}
		} else {
			input.style.fontSize = '15px';
		}
	}
};

// Function sets the height of blinds, current and future, as well as the ante in the visual layer

const setBlinds = () => {
	if (blindsData.bigBlind[i] === 'BREAK') {
		breakCounter++;
		currentBlinds.textContent = 'BREAK';
		currentLevel.textContent = 'BREAK';
	} else {
		currentBlinds.textContent = `${formatBlind(
			blindsData.bigBlind[i]
		)}/${formatBlind(blindsData.smallBlind[i])}`;
		currentLevel.textContent = i + 1 - breakCounter;
	}

	if (blindsData.ante[i] === 'BREAK') {
		currentAnteP.classList.add('disabled');
	} else {
		currentAnteP.classList.remove('disabled');
		currentAnte.textContent = formatBlind(blindsData.ante[i]);
	}

	if (blindsData.bigBlind[i + 1] === 'BREAK') {
		nextBlinds.textContent = 'BREAK';
	} else {
		nextBlinds.textContent = `${formatBlind(
			blindsData.bigBlind[i + 1]
		)}/${formatBlind(blindsData.smallBlind[i + 1])}`;
	}
};

// Function to save div elements in localStorage

const saveToLocalStorage = () => {
	const settingsData = [];
	const allSettings = document.querySelectorAll('.settings-div');

	allSettings.forEach((setting) => {
		if (setting.classList.contains('blinds-settings')) {
			const bigBlind = setting.querySelector('.big-blind-input').value || '';
			const ante = setting.querySelector('.ante-input').value || '';
			const smallBlind =
				setting.querySelector('.small-blind-input').value || '';
			const duration = setting.querySelector('.duration-input').value || '';
			settingsData.push({
				type: 'blind',
				bigBlind,
				ante,
				smallBlind,
				duration,
			});
		} else if (setting.classList.contains('settings-container__break')) {
			const breakLength = setting.querySelector('.break-input').value || '';
			settingsData.push({ type: 'break', breakLength });
		}
	});

	localStorage.setItem('settingsData', JSON.stringify(settingsData));
};

// Function to restore div elements from localStorage

const loadFromLocalStorage = () => {
	const settingsData = JSON.parse(localStorage.getItem('settingsData')) || [];

	settingsData.forEach(
		({ type, bigBlind, ante, smallBlind, duration, breakLength }) => {
			if (type === 'blind') {
				let newBlinds = document.createElement('div');
				newBlinds.setAttribute('class', 'blinds-settings settings-div');
				newBlinds.innerHTML = `
		  <label>
			<p>Big Blind:</p>
			<input type="number" class="big-blind-input blind-input" value="${bigBlind}">
		  </label>
		  <label>
			<p>Ante:</p>
			<input type="number" class="ante-input blind-input" value="${ante}">
		  </label>
		  <label>
			<p>Small Blind:</p>
			<input type="number" class="small-blind-input blind-input" value="${smallBlind}">
		  </label>
		  <label>
			<p>Duration:</p>
			<input type="number" class="duration-input blind-input" step="10" value="${duration}" placeholder="Minutes" >
		  </label>
		  <button class="blinds-settings__btn delete-btn"><i class="fa-solid fa-xmark"></i></button>`;
				settingsContainer.appendChild(newBlinds);

				const deleteBtn = newBlinds.querySelector('.blinds-settings__btn');
				deleteBtn.addEventListener('click', removeSettingsDiv);
			} else if (type === 'break') {
				let newBreak = document.createElement('div');
				newBreak.setAttribute(
					'class',
					'settings-container__break settings-div big-blind-input'
				);
				newBreak.innerHTML = `
		  <div class="input-field">
			<label for="break-length" class="break-label">Break length:</label>
			<input type="number" id="break-length" class="break-input duration-input" value="${breakLength}" placeholder="Minutes">
		  </div>
		  <button class="settings-container__break-btn delete-btn">
			<i class="fa-solid fa-xmark"></i>
		  </button>`;
				settingsContainer.appendChild(newBreak);

				const deleteBreakBtn = newBreak.querySelector(
					'.settings-container__break-btn'
				);
				deleteBreakBtn.addEventListener('click', removeSettingsDiv);
			}
		}
	);
};

// Function formats blinds to display abbreviations like 1M instead of 1000000

const formatBlind = (value) => {
	if (value >= 1000000) {
		return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
	} else if (value >= 10000) {
		return (value / 1000).toFixed(1).replace('.0', '') + 'K';
	}
	return value;
};

// Function adds IDs for dynamically appearing divs with blinds or breaks

const addIds = () => {
	id = 0;
	const allSettingsDivs = document.querySelectorAll('.settings-div');
	allSettingsDivs.forEach((settingDiv) => {
		settingDiv.id = id;
		id++;
	});
};

checkRewindBtn();
settingsBtn.addEventListener('click', showSettings);
confirmBtn.addEventListener('click', hideSettings);
playBtn.addEventListener('click', handlePlayBtn);
forwardBtn.addEventListener('click', handleForwardBtn);
rewindBtn.addEventListener('click', handleRewidnBtn);
addBlindBtn.addEventListener('click', addNewBlinds);
addBreakBtn.addEventListener('click', addBreak);
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('DOMContentLoaded', loadFromLocalStorage);
