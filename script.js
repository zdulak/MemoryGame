"use strict";

const cardTypes = [
    "lemon",
    "banana",
    "watermelon",
    "kiwi",
    "orange",
    "red_apple",
    "green_apple",
    "yellow_fruit",
    "cherry",
    "strawberry"
];

class Card {
    constructor(cardType, x, y, parent) {
        this.cardType = cardType;
        this.checked = false;
        this.htmlTag = document.createElement("div");
        this.htmlTag.classList.add("game-card");
        this.htmlTag.style.backgroundImage = "url(images/cardBack.png)";
        parent.appendChild(this.htmlTag);
        this.setPosition(x, y);
    }
    setPosition(x, y) {
        this.htmlTag.style.left = 5 + (this.htmlTag.offsetWidth + 5) * x + "px";
        this.htmlTag.style.top = 5 + (this.htmlTag.offsetHeight + 5) * y + "px";
    }
}

class Board {
    static get rowSize() {
        return 5;
    }
    static get columnSize() {
        return 4;
    }
    constructor() {
        this.divBoard = document.querySelector(".game-board");
        this.cards = [];
        for (let y = 0; y < Board.columnSize; ++y) {
            const row = [];
            for (let x = 0; x < Board.rowSize; ++x) {
                row.push(new Card(cardTypes[(x + y * Board.rowSize) % cardTypes.length], x, y, this.divBoard));
            }
            this.cards.push(row);
        }
    }
    #projectIndex = function(i) {
        //return [row_index, column_index] for given index
        return [Math.floor(i / Board.rowSize), i % Board.rowSize];
    }
    #getRandomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        //The maximum is exclusive and the minimum is inclusive
        return Math.floor(Math.random() * (max - min)) + min; 
    }
    shuffle() {
        //Modern Fisher–Yates shuffle algorithm
        const size = Board.columnSize*Board.rowSize;
        for (let i = 0; i < size; ++i) {
            const j = this.#getRandomInt(0, size);
            const [rowI, colI] = this.#projectIndex(i);
            const [rowJ, colJ] = this.#projectIndex(j);
            this.cards[rowI][colI].setPosition(colJ,rowJ);
            this.cards[rowJ][colJ].setPosition(colI,rowI);
            [this.cards[rowI][colI], this.cards[rowJ][colJ]] = [this.cards[rowJ][colJ], this.cards[rowI][colI]];
        }
    }
}

class MemoryGame {
    constructor() {
        this.board = new Board();
        this.board.shuffle();
        this.divGame = document.querySelector(".game");
        this.divGame.addEventListener("click", this.cardClick);
    }
    cardClick = (event) => {
        if (event.target.classList.contains("game-card")) {
            console.dir(event.target);
            event.target.style.backgroundImage = "url(images/" + event.target.cardType + ".png)";
        }
    }
}

const game = new MemoryGame(); 