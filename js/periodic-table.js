import * as THREE from "three";

import {
    TrackballControls
} from "three/addons/controls/TrackballControls.js";

import {
    CSS3DRenderer,
    CSS3DObject
} from "three/addons/renderers/CSS3DRenderer.js";

const SHEET_ID =
    "1-HcFw3T8b-PhCJzO9-mciM2UaL75uYsaHStsnlP1LGQ";

const SHEET_URL =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

let camera;
let scene;
let renderer;
let controls;

const objects = [];

let currentArrangement = "table";

init();
loadSheetData();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(
        40,
        1,
        1,
        10000
    );

    camera.position.z = 5000;

    scene = new THREE.Scene();

    const visualization =
        document.getElementById("visualization");

    if (!visualization) {
        console.error(
            "ERROR: #visualization was not found."
        );
        return;
    }

    renderer = new CSS3DRenderer();

    const width =
        visualization.clientWidth;

    const height =
        visualization.clientHeight;

    renderer.setSize(
        width,
        height
    );

    visualization.appendChild(
        renderer.domElement
    );

    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();

    controls = new TrackballControls(
        camera,
        renderer.domElement
    );

    controls.minDistance = 500;
    controls.maxDistance = 10000;
    controls.rotateSpeed = 0.5;

    window.addEventListener(
        "resize",
        onWindowResize
    );

    document
        .getElementById("table-button")
        .addEventListener("click", () => {
            transformTable();
            setActiveButton("table-button");
        });

    document
        .getElementById("sphere-button")
        .addEventListener("click", () => {
            transformSphere();
            setActiveButton("sphere-button");
        });

    document
        .getElementById("helix-button")
        .addEventListener("click", () => {
            transformDoubleHelix();
            setActiveButton("helix-button");
        });

    document
        .getElementById("grid-button")
        .addEventListener("click", () => {
            transformGrid();
            setActiveButton("grid-button");
        });
}

async function loadSheetData() {

    console.log("Loading Google Sheet...");

    try {

        const response =
            await fetch(SHEET_URL);

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const csvText =
            await response.text();

        const data =
            parseCSV(csvText);

        console.log(
            `Successfully loaded ${data.length} records.`
        );

        console.table(data);

        createTiles(data);

        transformTable();

    } catch (error) {

        console.error(
            "Failed to load Google Sheet:"
        );

        console.error(error);

    }
}

function createTiles(data) {

    objects.length = 0;

    data.forEach((person, index) => {

        const element =
            document.createElement("div");

        element.className =
            "person-tile";

        element.style.width =
            "180px";

        element.style.height =
            "220px";

        element.style.border =
            "1px solid rgba(255,255,255,0.5)";

        element.style.borderRadius =
            "8px";

        element.style.boxSizing =
            "border-box";

        element.style.padding =
            "10px";

        element.style.textAlign =
            "center";

        element.style.color =
            "white";

        element.style.fontFamily =
            "Arial, Helvetica, sans-serif";

        element.style.overflow =
            "hidden";

        element.style.backgroundColor =
            getNetWorthColour(
                person["Net Worth"]
            );

        if (person["Photo"]) {

            const image =
                document.createElement("img");

            image.src =
                person["Photo"];

            image.style.width =
                "70px";

            image.style.height =
                "70px";

            image.style.objectFit =
                "cover";

            image.style.borderRadius =
                "50%";

            image.style.marginBottom =
                "8px";

            image.onerror =
                function () {
                    this.style.display =
                        "none";
                };

            element.appendChild(image);
        }

        const name =
            document.createElement("div");

        name.style.fontSize =
            "16px";

        name.style.fontWeight =
            "bold";

        name.style.marginBottom =
            "6px";

        name.textContent =
            person["Name"] ||
            "Unknown";

        element.appendChild(name);

        const age =
            document.createElement("div");

        age.textContent =
            `Age: ${person["Age"] || "N/A"}`;

        age.style.fontSize =
            "12px";

        element.appendChild(age);

        const country =
            document.createElement("div");

        country.textContent =
            person["Country"] ||
            "N/A";

        country.style.fontSize =
            "12px";

        country.style.marginTop =
            "4px";

        element.appendChild(country);

        const interest =
            document.createElement("div");

        interest.textContent =
            person["Interest"] ||
            "N/A";

        interest.style.fontSize =
            "11px";

        interest.style.marginTop =
            "8px";

        interest.style.opacity =
            "0.9";

        element.appendChild(interest);

        const netWorth =
            document.createElement("div");

        netWorth.textContent =
            `Net Worth: ${person["Net Worth"] || "N/A"}`;

        netWorth.style.fontSize =
            "11px";

        netWorth.style.marginTop =
            "8px";

        netWorth.style.fontWeight =
            "bold";

        element.appendChild(netWorth);

        const objectCSS =
            new CSS3DObject(element);

        objectCSS.userData.index =
            index;

        objectCSS.userData.person =
            person;

        scene.add(objectCSS);

        objects.push(objectCSS);
    });

    console.log(
        `Created ${objects.length} tiles.`
    );
}

function getNetWorthColour(value) {

    if (!value) {
        return "rgba(120, 120, 120, 0.8)";
    }

    const cleaned =
        String(value)
            .replace(/[$,]/g, "")
            .replace(/[^\d.-]/g, "");

    const amount =
        parseFloat(cleaned);

    if (isNaN(amount)) {
        return "rgba(120, 120, 120, 0.8)";
    }

    if (amount < 100000) {
        return "rgba(220, 50, 50, 0.85)";
    }

    else if (amount > 200000) {
        return "rgba(50, 180, 80, 0.85)";
    }

    else {
        return "rgba(240, 150, 40, 0.85)";
    }
}

function transformTable() {

    const separationX =
        210;

    const separationY =
        250;

    objects.forEach((object, index) => {

        const column =
            index % 20;

        const row =
            Math.floor(index / 20);

        const x =
            (column - 9.5) *
            separationX;

        const y =
            -(row - 4.5) *
            separationY;

        object.position.x =
            x;

        object.position.y =
            y;

        object.position.z =
            0;

        object.rotation.x =
            0;

        object.rotation.y =
            0;

        object.rotation.z =
            0;
    });

    currentArrangement =
        "table";
}

function transformSphere() {

    const radius =
        1500;

    const total =
        objects.length;

    objects.forEach((object, index) => {

        const phi =
            Math.acos(
                -1 +
                (2 * index) /
                total
            );

        const theta =
            Math.sqrt(
                total * Math.PI
            ) * phi;

        object.position.x =
            radius *
            Math.cos(theta) *
            Math.sin(phi);

        object.position.y =
            radius *
            Math.cos(phi);

        object.position.z =
            radius *
            Math.sin(theta) *
            Math.sin(phi);

        const vector =
            new THREE.Vector3(
                object.position.x,
                object.position.y,
                object.position.z
            );

        object.lookAt(vector);
    });

    currentArrangement =
        "sphere";
}

function transformDoubleHelix() {
    const radius = 600;
    const verticalSpacing = 100;
    const turns = 3;

    const total = objects.length;
    const pointsPerStrand = Math.ceil(total / 2);

    objects.forEach((object, index) => {
        const strand = index % 2;
        const strandIndex = Math.floor(index / 2);

        const angle =
            (strandIndex / pointsPerStrand) *
            (Math.PI * 2 * turns) +
            (strand === 1 ? Math.PI : 0);

        object.position.x = radius * Math.cos(angle);

        object.position.y =
            (strandIndex - (pointsPerStrand - 1) / 2) *
            verticalSpacing;

        object.position.z = radius * Math.sin(angle);

        object.rotation.x = 0;
        object.rotation.y = 0;
        object.rotation.z = 0;
    });

    currentArrangement = "helix";

    console.log("Double helix arrangement applied.");
}
function transformGrid() {

    const separationX =
        450;

    const separationY =
        280;

    objects.forEach((object, index) => {

        const columns =
            6;

        const column =
            index % columns;

        const row =
            Math.floor(index / columns);

        object.position.x =
            (column -
                (columns - 1) / 2) *
            separationX;

        object.position.y =
            -(row - 4) *
            separationY;

        object.position.z =
            0;

        object.rotation.x =
            0;

        object.rotation.y =
            0;

        object.rotation.z =
            0;
    });

    currentArrangement =
        "grid";
}

function setActiveButton(buttonId) {

    document
        .querySelectorAll(
            ".controls button"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );
        });

    document
        .getElementById(buttonId)
        .classList.add(
            "active"
        );
}

function parseCSV(csv) {

    const lines =
        csv
            .trim()
            .split(/\r?\n/);

    if (lines.length < 2) {
        return [];
    }

    const headers =
        parseCSVLine(lines[0])
            .map(
                header =>
                    header.trim()
            );

    const records = [];

    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const values =
            parseCSVLine(lines[i]);

        const record = {};

        headers.forEach(
            (header, index) => {

                record[header] =
                    values[index] !== undefined
                        ? values[index].trim()
                        : "";
            }
        );

        records.push(record);
    }

    return records;
}

function parseCSVLine(line) {

    const result = [];

    let current = "";

    let insideQuotes =
        false;

    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const character =
            line[i];

        if (character === '"') {

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                current += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;
            }

        } else if (
            character === "," &&
            !insideQuotes
        ) {

            result.push(current);

            current = "";

        } else {

            current += character;
        }
    }

    result.push(current);

    return result;
}

function onWindowResize() {

    const visualization =
        document.getElementById(
            "visualization"
        );

    if (!visualization) {
        return;
    }

    const width =
        visualization.clientWidth;

    const height =
        visualization.clientHeight;

    if (
        width === 0 ||
        height === 0
    ) {
        return;
    }

    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
        width,
        height
    );

    controls.handleResize();
}

function animate() {

    requestAnimationFrame(
        animate
    );

    if (controls) {
        controls.update();
    }

    if (
        renderer &&
        scene &&
        camera
    ) {

        renderer.render(
            scene,
            camera
        );
    }
}
