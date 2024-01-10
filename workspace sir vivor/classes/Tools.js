/**
 * Tools
 * Cassius - https://github.com/sirDonovan/Cassius
 *
 * This file contains functions that are useful globally.
 *
 * @license MIT license
 */

'use strict';
class Tools {
	constructor() {
		this.data = {};
	}

	loadData() {
		this.data.pokedex = require('../data/pokedex.js').BattlePokedex;
		this.data.typeChart = require('../data/effects.js').BattleEffectiveness;
		this.data.convertType = require('../data/effects.js').convertType;
	}

	toId(text) {
		if (!text) return '';
		if (text.id) text = text.id;
		let type = typeof text;
		if (type !== 'string') {
			if (type === 'number') {
				text = '' + text;
			} else {
				return '';
			}
		}
		return text.toLowerCase().replace(/[^a-z0-9]/g, '');
	}

	toName(text) {
		if (!text) return '';
		if (text.name) text = text.name;
		let type = typeof text;
		if (type !== 'string') {
			if (type === 'number') {
				text = '' + text;
			} else {
				return '';
			}
		}
		if (Config.groups && text.charAt(0) in Config.groups) text = text.substr(1);
		return text.trim();
	}

	encrypt(target) {
		let nums = [];
        for (let i = 0; i < target.length; i += 1) {
            let num1 = this.padZeros(target[i].charCodeAt(), 3);
            let num = parseInt(num1);
            
            let c = this.mod(num, Config.e, Config.n);
            nums.push(c);
        }
        return nums.join(" ");
	}

	decrypt(target) {
		let nums = target.split(" ");
        let str = "";
        for (let i = 0; i < nums.length; i++) {
            let num = parseInt(nums[i]);
            let d = this.mod(num, Config.d, Config.n).toString();
            str += String.fromCharCode(parseInt(d));
        }
        return str;
	}

    mod(base, pow, modulus) {
        let powers = [base];
        let cur = base;
        let power = 1;
        while (power < pow) {
            power *= 2;
            cur *= cur;
            cur %= modulus;
            powers.push(cur);
        }
        cur = 1;
        while (pow > 0) {
            if (pow%2 === 1) {
                cur *= powers[0];
                cur %= modulus;
            }
            powers.splice(0, 1);
            pow -= pow%2;
            pow /= 2;
        }
        return cur;
    }

    padZeros(number, numTotal) {
        let str = number.toString();
        while (str.length < numTotal) {
            str = "0" + str;
        }
        return str;
    }
	toString(text) {
		if (!text) return '';
		let type = typeof text;
		if (type === 'string') return text;
		if (type === 'number') return '' + text;
		return JSON.stringify(text);
	}

	normalizeMessage(text) {
		text = this.toString(text);
		if (!text) return '';
		text = text.trim();
		if (text.length > 300) {
			if (text.substr(text.length - 2, 2) === "__") {
				text = text.substr(0, 295) + "__...";
			} else {
				text = text.substr(0, 297) + "...";
			}
		}
		return text;
	}

	random(limit) {
		if (!limit) limit = 2;
		return Math.floor(Math.random() * limit);
	}

	shuffle(array) {
		let currentIndex = array.length, temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	sample(array, amount) {
		if (!(array instanceof Array)) return;
		let len = array.length;
		if (!len) return;
		if (len === 1 || !amount || amount === 1) return array.slice()[Math.floor(Math.random() * len)];
		if (amount > len) {
			amount = len;
		} else if (amount < 0) {
			amount = 0;
		}
		return this.shuffle(array).splice(0, amount);
	}

	generation(num) {
		let generations = [151, 251, 386, 493, 649, 721, 802];
		let i, len = generations.length;
		for (i = 0; i < len; i++) {
			if (generations[i] >= num) {
				break;
			}
		}
		return i + 1;
	}

	effectiveness(move, mon) {
		move = this.toId(move);
		mon = this.toId(mon);
		let moveType;
		if (move.substr(0, 12) === 'hiddenpower') {
			moveType = move.substr(12, move.length - 14);
		} else {
			let realMove = this.data.moves[move];
			moveType = this.toId(realMove.type);
		}
		let realMon = this.data.pokedex[mon];
		//console.log(moveType);
		let curEffect = 1;
		for (let i = 0; i < realMon.types.length; i++) {
			let realType = this.toId(realMon.types[i]);
			curEffect *= this.data.typeChart[this.data.convertType[moveType]][this.data.convertType[realType]];
		}
		return curEffect;
	}

	getSuffix(num) {
		num = num % 100;
		if (num >= 10 && num <= 19) {
			return "th";
		} else if (num % 10 === 1) {
			return "st";
		} else if (num % 10 === 2) {
			return "nd";
		} else if (num % 10 === 3) {
			return "rd";
		} else {
			return "th";
		}
	}
	isPort(mon1, mon2) {
		for (let i = 2; i < Math.min(mon1.length, mon2.length, 5); i++) {
			if (mon1.slice(mon1.length - i) === mon2.slice(0, i)) {
				return (mon1.slice(0, mon1.length - i) + mon2);
			}
		}
		return false;
	}
	turnFirstUpper(str) {
		return str[0].toUpperCase() + str.substr(1).toLowerCase();
	}
	uploadToHastebin(toUpload, callback) {
		let reqOpts = {
			hostname: "hastebin.com",
			method: "POST",
			path: '/documents'
		};
		let req = require('https').request(reqOpts, function (res) {
			res.on('data', function (chunk) {
				try {
					let linkStr = "hastebin.com/" + JSON.parse(chunk.toString())['key'];
					if (typeof callback === "function") callback(true, linkStr);
				} catch (e) {
					if (typeof callback === "function") callback(false, e);
				}
			});
		});
		req.on('error', function (e) {
			if (typeof callback === "function") callback(false, e);
		});
		req.write(toUpload);
		req.end();
	}
}

let tools = new Tools();
tools.loadData();
module.exports = tools;
