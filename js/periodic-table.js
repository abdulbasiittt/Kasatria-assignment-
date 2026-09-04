import * as THREE from "three";

import TWEEN from "three/addons/libs/tween.module.js";

import {
    TrackballControls
} from "three/addons/controls/TrackballControls.js";

import {
    CSS3DRenderer,
    CSS3DObject
} from "three/addons/renderers/CSS3DRenderer.js";

// Google Sheet

const SHEET_ID =
    "1-HcFw3T8b-PhCJzO9-mciM2UaL75uYsaHStsnlP1LGQ";

const SHEET_URL =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// Three.js Variables

let camera;
let scene;
let renderer;
let controls;

const objects = [];

const targets = {
    table: [],
    sphere: [],
    helix: [],
    grid: []
};

// Start

init();
loadSheetData();
animate();

// CSV Parser

function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            cell += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
            row.push(cell);
            cell = "";
        } else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {
            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(cell);
            rows.push(row);

            row = [];
            cell = "";
        } else {
            cell += char;
        }
    }

    if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0].map(header => header.trim());

    return rows
        .slice(1)
        .filter(row =>
            row.some(cell => cell.trim() !== "")
        )
        .map(row => {
            const object = {};

            headers.forEach((header, index) => {
                object[header] =
                    (row[index] || "").trim();
            });

            return object;
        });
}

// Initialize

function init() {
    camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );

    camera.position.z = 5000;

    scene = new THREE.Scene();

    renderer = new CSS3DRenderer();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    const visualization =
        document.getElementById("visualization");

    if (!visualization) {
        console.error(
            "ERROR: #visualization was not found."
        );
        return;
    }

    visualization.appendChild(
        renderer.domElement
    );

    controls = new TrackballControls(
        camera,
        renderer.domElement
    );

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

    // Arrangement Buttons

    document
        .getElementById("table-button")
        .addEventListener("click", function () {
            transform(
                targets.table,
                2000
            );

            setActiveButton(
                "table-button"
            );
        });

    document
        .getElementById("sphere-button")
        .addEventListener("click", function () {
            transform(
                targets.sphere,
                2000
            );

            setActiveButton(
                "sphere-button"
            );
        });

    document
        .getElementById("helix-button")
        .addEventListener("click", function () {
            transform(
                targets.helix,
                2000
            );

            setActiveButton(
                "helix-button"
            );
        });

    document
        .getElementById("grid-button")
        .addEventListener("click", function () {
            transform(
                targets.grid,
                2000
            );

            setActiveButton(
                "grid-button"
            );
        });
}

// Load Google Sheet

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

        if (data.length === 0) {
            throw new Error(
                "No records were found in the Google Sheet."
            );
        }

        createTiles(data);

        createTargets();

        transform(
            targets.table,
            0
        );

        setActiveButton(
            "table-button"
        );

    } catch (error) {
        console.error(
            "Failed to load Google Sheet:"
        );

        console.error(error);
    }
}

// Create Person Tiles

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

        element.style.backfaceVisibility =
            "hidden";

        // Net Worth Colour

        element.style.backgroundColor =
            getNetWorthColour(
                person["Net Worth"]
            );

        // Photo

        if (person["Photo"]) {
            const image =
                document.createElement("img");

            image.src =
                person["Photo"];

            image.alt =
                person["Name"] || "Person";

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

        // Name

        const name =
            document.createElement("div");

        name.style.fontSize =
            "16px";

        name.style.fontWeight =
            "bold";

        name.style.marginBottom =
            "6px";

        name.textContent =
            person["Name"] || "Unknown";

        element.appendChild(name);

        // Age

        const age =
            document.createElement("div");

        age.textContent =
            `Age: ${person["Age"] || "N/A"}`;

        age.style.fontSize =
            "12px";

        element.appendChild(age);

        // Country

        const country =
            document.createElement("div");

        country.textContent =
            person["Country"] || "N/A";

        country.style.fontSize =
            "12px";

        country.style.marginTop =
            "4px";

        element.appendChild(country);

        // Interest

        const interest =
            document.createElement("div");

        interest.textContent =
            person["Interest"] || "N/A";

        interest.style.fontSize =
            "11px";

        interest.style.marginTop =
            "8px";

        interest.style.opacity =
            "0.9";

        element.appendChild(interest);

        // Net Worth

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

        // CSS3D Object

        const objectCSS =
            new CSS3DObject(element);

        objectCSS.userData.index =
            index;

        objectCSS.userData.person =
            person;

        objectCSS.position.x =
            Math.random() * 4000 - 2000;

        objectCSS.position.y =
            Math.random() * 4000 - 2000;

        objectCSS.position.z =
            Math.random() * 4000 - 2000;

        scene.add(objectCSS);

        objects.push(objectCSS);
    });

    console.log(
        `Created ${objects.length} tiles.`
    );
}

// Create Arrangement Targets

function createTargets() {
    targets.table = [];
    targets.sphere = [];
    targets.helix = [];
    targets.grid = [];

    createTableTargets();
    createSphereTargets();
    createDoubleHelixTargets();
    createGridTargets();

    console.log(
        "All arrangement targets created."
    );
}

// Table: 20 × 10

function createTableTargets() {
    const columns = 20;
    const rows = 10;

    const spacingX = 210;
    const spacingY = 250;

    for (
        let i = 0;
        i < objects.length;
        i++
    ) {
        const column =
            i % columns;

        const row =
            Math.floor(i / columns);

        const object =
            new THREE.Object3D();

        object.position.x =
            (column - (columns - 1) / 2)
            * spacingX;

        object.position.y =
            -(
                row -
                (rows - 1) / 2
            )
            * spacingY;

        object.position.z = 0;

        targets.table.push(object);
    }
}

// Sphere

function createSphereTargets() {
    const vector =
        new THREE.Vector3();

    const radius = 1500;

    for (
        let i = 0;
        i < objects.length;
        i++
    ) {
        const phi =
            Math.acos(
                -1 +
                (2 * i) /
                objects.length
            );

        const theta =
            Math.sqrt(
                objects.length *
                Math.PI
            ) * phi;

        const object =
            new THREE.Object3D();

        object.position.setFromSphericalCoords(
            radius,
            phi,
            theta
        );

        vector
            .copy(object.position)
            .multiplyScalar(2);

        object.lookAt(vector);

        targets.sphere.push(object);
    }
}

// Double Helix

function createDoubleHelixTargets() {
    const vector =
        new THREE.Vector3();

    const radius = 900;
    const height = 3200;
    const turns = 4;
    const total = objects.length;

    for (
        let i = 0;
        i < total;
        i++
    ) {
        const strand =
            i % 2;

        const position =
            Math.floor(i / 2);

        const strandCount =
            Math.ceil(total / 2);

        const progress =
            position /
            (strandCount - 1);

        const theta =
            progress *
            Math.PI *
            2 *
            turns;

        const strandOffset =
            strand *
            Math.PI;

        const finalTheta =
            theta +
            strandOffset;

        const y =
            height / 2 -
            progress * height;

        const object =
            new THREE.Object3D();

        object.position.x =
            radius *
            Math.cos(finalTheta);

        object.position.y =
            y;

        object.position.z =
            radius *
            Math.sin(finalTheta);

        vector.x =
            object.position.x * 2;

        vector.y =
            object.position.y;

        vector.z =
            object.position.z * 2;

        object.lookAt(vector);

        targets.helix.push(object);
    }
}

// Grid: 5 × 4 × 10

function createGridTargets() {
    const columns = 5;
    const rows = 4;
    const layers = 10;

    const spacingX = 400;
    const spacingY = 400;
    const spacingZ = 700;

    for (
        let i = 0;
        i < objects.length;
        i++
    ) {
        const column =
            i % columns;

        const row =
            Math.floor(i / columns)
            % rows;

        const layer =
            Math.floor(
                i /
                (columns * rows)
            );

        const object =
            new THREE.Object3D();

        object.position.x =
            (
                column -
                (columns - 1) / 2
            )
            * spacingX;

        object.position.y =
            -(
                row -
                (rows - 1) / 2
            )
            * spacingY;

        object.position.z =
            (
                layer -
                (layers - 1) / 2
            )
            * spacingZ;

        targets.grid.push(object);
    }
}

// Smooth Transformation

function transform(target, duration) {
    TWEEN.removeAll();

    for (
        let i = 0;
        i < objects.length;
        i++
    ) {
        const object =
            objects[i];

        const targetObject =
            target[i];

        if (!targetObject) {
            continue;
        }

        new TWEEN.Tween(
            object.position
        )
            .to(
                {
                    x: targetObject.position.x,
                    y: targetObject.position.y,
                    z: targetObject.position.z
                },
                Math.random() *
                duration +
                duration
            )
            .easing(
                TWEEN.Easing.Exponential.InOut
            )
            .start();

        new TWEEN.Tween(
            object.rotation
        )
            .to(
                {
                    x: targetObject.rotation.x,
                    y: targetObject.rotation.y,
                    z: targetObject.rotation.z
                },
                Math.random() *
                duration +
                duration
            )
            .easing(
                TWEEN.Easing.Exponential.InOut
            )
            .start();
    }
}

// Net Worth Colour

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

    if (amount > 200000) {
        return "rgba(50, 180, 80, 0.85)";
    }

    if (amount < 100000) {
        return "rgba(220, 50, 50, 0.85)";
    }

    return "rgba(240, 150, 40, 0.85)";
}

// Button State

function setActiveButton(buttonId) {
    document
        .querySelectorAll(".controls button")
        .forEach(button => {
            button.classList.remove("active");
        });

    const button =
        document.getElementById(buttonId);

    if (button) {
        button.classList.add("active");
    }
}

// Resize

function onWindowResize() {
    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    controls.handleResize();
}

// Animation

function animate() {
    requestAnimationFrame(
        animate
    );

    TWEEN.update();

    if (controls) {
        controls.update();
    }

    if (renderer) {
        renderer.render(
            scene,
            camera
        );
    }
}
