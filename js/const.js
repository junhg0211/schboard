const sidebar = document.getElementsByClassName("sidebar")[0];
const canvas = document.getElementById("main-canvas");
const componentList = document.getElementById("component-list");
const componentFile = document.getElementById("component-file");

const ctx = canvas.getContext("2d");

const UP = 0;
const LEFT = 1;
const DOWN = 2;
const RIGHT = 3;

const VERTICAL = [UP, DOWN];

const WHITE = "#ffffff";
const WHITE_GREY = "#dfdfdf";
const LIGHT_GREY = "#afafaf";
const GREY = "#7f7f7f";
const BLACK = "#000000";
const RED = "#ff0000";
const YELLOW = "#ffff00";
const GREEN = "#00ff00";
const BACKGROUND_COLOR = "#163b2d";

const GRID_SIZE = 10;