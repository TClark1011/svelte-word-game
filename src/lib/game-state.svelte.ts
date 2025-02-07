import { browser } from '$app/environment';
import { LETTER_STARTING_HEALTH, STARTING_TIME_MS, SUCCESS_BONUS_MS, WORDS } from '$lib/config';
import { letters } from '$lib/misc-constants';
import { dedupe, randomItem, randomItemConditional } from '$lib/utils';

type WordSubmissionError = 'invalid' | 'already-used' | 'dead-letter-used';

export type LetterHealthTracker = Record<string, number>;

const getInitialLetterHealth = (): LetterHealthTracker => {
	const letterHealth: LetterHealthTracker = {};

	letters.forEach((letter) => {
		letterHealth[letter] = LETTER_STARTING_HEALTH;
	});

	return letterHealth;
};

const DEV_ENABLE_TIME_LIMIT_STORAGE_KEY = 'dev_enableTimeLimit';
const DEV_ENABLE_LETTER_DAMAGE_STORAGE_KEY = 'dev_enableLetterDamage';

const getStorageKeyBoolValue = (key: string): boolean | null => {
	if (!browser) return null;
	const fromStorage = sessionStorage.getItem(key);
	if (fromStorage === null) return null;

	if (fromStorage === 'true') return true;
	if (fromStorage === 'false') return false;

	throw new Error(`Invalid value in storage for key ${key}`);
};

export class GameState {
	letterHealth: LetterHealthTracker = $state(getInitialLetterHealth());
	targetWord: string = $state('');
	wordSubmissionError: WordSubmissionError | null = $state(null);
	inputValue: string = $state('');
	timeLeftMs: number = $state(STARTING_TIME_MS);
	lastSubmitAtMs: number = $state(new Date().getTime());
	usedTargetWords: string[] = $state([]);
	submittedWords: string[] = $state([]);
	gameOver: boolean = $state(false);
	previouslyDamagedLetters: string[] = $state([]);

	dev_enableTimeLimit = $state(getStorageKeyBoolValue(DEV_ENABLE_TIME_LIMIT_STORAGE_KEY) ?? true);
	dev_enableLetterDamage = $state(
		getStorageKeyBoolValue(DEV_ENABLE_LETTER_DAMAGE_STORAGE_KEY) ?? true
	);

	constructor(startIndex: number) {
		this.targetWord = WORDS[startIndex];

		$effect(() => {
			// clear the error when the input value changes

			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			this.inputValue; // make the effect track the input value
			this.wordSubmissionError = null;
		});

		$effect(() => {
			if (!browser) return;
			sessionStorage.setItem(
				DEV_ENABLE_TIME_LIMIT_STORAGE_KEY,
				this.dev_enableTimeLimit.toString()
			);
		});

		$effect(() => {
			if (!browser) return;
			sessionStorage.setItem(
				DEV_ENABLE_LETTER_DAMAGE_STORAGE_KEY,
				this.dev_enableLetterDamage.toString()
			);
		});
	}

	private damageLetter(letter: string) {
		if (!this.dev_enableLetterDamage) return;
		const currentHealth = this.letterHealth[letter];

		if (currentHealth === undefined) {
			throw new Error(`Letter ${letter} not found in letter health tracker`);
		}

		const newHealth = currentHealth - 1;
		if (newHealth >= 0) {
			this.letterHealth[letter] = newHealth;
		}
	}

	get usedWords() {
		return [...this.usedTargetWords, ...this.submittedWords];
	}

	setInputValue(value: string) {
		this.inputValue = value.toLowerCase();
		// this.wordSubmissionError = null;
	}

	sendLetter = (letter: string) => {
		this.setInputValue(this.inputValue + letter);
	};

	backspace = () => {
		this.setInputValue(this.inputValue.slice(0, -1));
	};

	letterIsDead(letter: string) {
		return this.letterHealth[letter] === 0;
	}

	submitWord() {
		const wordIsValid = WORDS.includes(this.inputValue);

		if (!wordIsValid) {
			this.wordSubmissionError = 'invalid';
			return;
		}

		const wordHasBeenUsed = this.usedWords.includes(this.inputValue.toLowerCase());
		if (wordHasBeenUsed) {
			this.wordSubmissionError = 'already-used';
			return;
		}

		const wordContainsDeadLetter = this.inputValue
			.split('')
			.some((letter) => this.letterHealth[letter] === 0);
		if (wordContainsDeadLetter) {
			this.wordSubmissionError = 'dead-letter-used';
			return;
		}

		const unusedLetters = this.targetWord
			.split('')
			.filter((letter) => !this.inputValue.includes(letter));
		const damagedLetters = dedupe(unusedLetters);

		damagedLetters.forEach((letter) => {
			this.damageLetter(letter);
		});

		this.previouslyDamagedLetters = damagedLetters;

		const timeSinceLastSubmissionMs = new Date().getTime() - this.lastSubmitAtMs;
		const remainingTimeMs = this.timeLeftMs - timeSinceLastSubmissionMs;
		this.timeLeftMs = remainingTimeMs + SUCCESS_BONUS_MS;

		this.usedTargetWords.push(this.targetWord);
		this.submittedWords.push(this.inputValue);

		this.targetWord = randomItemConditional(WORDS, (word) => !this.usedWords.includes(word));

		this.wordSubmissionError = null;
		this.lastSubmitAtMs = new Date().getTime();
		this.inputValue = '';
	}

	timeoutGameOver() {
		if (!this.dev_enableTimeLimit) return;
		this.gameOver = true;
	}

	restartGame() {
		this.gameOver = false;
		this.letterHealth = getInitialLetterHealth();
		this.targetWord = randomItem(WORDS);
		this.usedTargetWords = [];
		this.submittedWords = [];
		this.inputValue = '';
		this.timeLeftMs = STARTING_TIME_MS;
		this.lastSubmitAtMs = new Date().getTime();
		this.wordSubmissionError = null;
	}
}
