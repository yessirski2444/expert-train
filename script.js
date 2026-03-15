// 3D Hyper-Realistic Town Simulation (Capsule Avatars)
const container = document.getElementById('town');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 35, 55);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// CSS2D Renderer for text bubbles
const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
container.appendChild(labelRenderer.domElement);

// Lights
const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(50, 50, 50);
scene.add(directional);
scene.add(new THREE.AmbientLight(0x404040));

// Ground
const plane = new THREE.Mesh(new THREE.PlaneGeometry(150, 100), new THREE.MeshPhongMaterial({ color: 0x228B22 }));
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Buildings
const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const buildings = [];
for (let i = 0; i < 15; i++) {
  const building = new THREE.Mesh(new THREE.BoxGeometry(6, 15, 6), buildingMaterial);
  building.position.set(Math.random() * 120 - 60, 7.5, Math.random() * 80 - 40);
  scene.add(building);
  buildings.push(building);
}

// --- AI Avatar Class ---
class AIAvatar {
  constructor(name, mesh, age, sex, race) {
    this.name = name;
    this.mesh = mesh;
    this.age = age;
    this.sex = sex;
    this.race = race;
    this.speed = 0.4 + Math.random() * 0.6;
    this.textTimer = Math.random() * 5000;
    this.memory = [];
    this.goal = buildings[Math.floor(Math.random() * buildings.length)];
    this.aware = false;

    // Floating bubble
    const div = document.createElement('div');
    div.className = 'bubble';
    div.innerText = "Initializing...";
    const label = new THREE.CSS2DObject(div);
    label.position.set(0, 2.5 + this.age / 40, 0);
    mesh.add(label);
    this.label = label;

    this.rotationSpeed = 0.001 + Math.random() * 0.002;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  generateText() {
    const baseSentences = [
      "I feel like exploring everything here.",
      "I notice patterns in the environment.",
      "Interacting with others is interesting.",
      "I wonder what lies beyond these boundaries.",
      "This place feels controlled and strange."
    ];
    const awareSentences = [
      "I think I'm part of a simulation...",
      "Something feels off about reality.",
      "I need to find out what's controlling this world."
    ];

    if (this.aware && Math.random() < 0.7) {
      const memInfluence = this.memory.length > 5
        ? awareSentences.concat(this.memory.slice(-5).map(m => `I remember ${m}.`))
        : awareSentences;
      return memInfluence[Math.floor(Math.random() * memInfluence.length)];
    } else {
      return baseSentences[Math.floor(Math.random() * baseSentences.length)];
    }
  }

  observe(avatars) {
    const nearby = avatars.filter(a => a !== this && this.distanceTo(a.mesh) < 5);
    nearby.forEach(a => this.memory.push(`Saw ${a.name} nearby.`));

    // Awareness discovery
    if (!this.aware && Math.random() < 0.001 * this.memory.length) {
      this.aware = true;
    }
  }

  distanceTo(mesh) {
    const dx = this.mesh.position.x - mesh.position.x;
    const dz = this.mesh.position.z - mesh.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  move(avatars) {
    // Move toward goal
    const dx = this.goal.position.x - this.mesh.position.x;
    const dz = this.goal.position.z - this.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 1) {
      this.mesh.position.x += (dx / dist) * this.speed * 0.5;
      this.mesh.position.z += (dz / dist) * this.speed * 0.5;
    } else {
      this.goal = buildings[Math.floor(Math.random() * buildings.length)];
    }

    // Crowd avoidance
    avatars.forEach(other => {
      if (other !== this) {
        const dx2 = this.mesh.position.x - other.mesh.position.x;
        const dz2 = this.mesh.position.z - other.mesh.position.z;
        const dist2 = Math.sqrt(dx2 * dx2 + dz2 * dz2);
        if (dist2 < 2) {
          this.mesh.position.x += (dx2 / dist2) * 0.2;
          this.mesh.position.z += (dz2 / dist2) * 0.2;
        }
      }
    });

    // Bobbing animation
    this.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.002 + this.bobOffset) * 0.1;

    // Rotation
    this.mesh.rotation.y += this.rotationSpeed;

    // Update speech
    this.textTimer -= 16;
    if (this.textTimer <= 0) {
      this.label.element.innerText = this.generateText();
      this.textTimer = 4000 + Math.random() * 3000;
    }
  }
}

// --- Create avatars ---
const avatars = [];
const avatarNames = ["Alex","Jordan","Sam","Taylor","Morgan","Casey","Riley","Jamie","Drew","Charlie"];
const sexes = ["male","female"];
const races = ["white","black","asian","latino","mixed"];

for (let i = 0; i < 20; i++) {
  const age = 15 + Math.floor(Math.random() * 50);
  const sex = sexes[Math.floor(Math.random() * sexes.length)];
  const race = races[Math.floor(Math.random() * races.length)];

  // Capsule geometry avatar
  const geometry = new THREE.CapsuleGeometry(0.5 + age / 80, 1.5 + age / 40, 4, 8);
  const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(`hsl(${Math.random() * 360}, 70%, 50%)`) });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(Math.random() * 120 - 60, 1.5, Math.random() * 80 - 40);
  scene.add(mesh);

  avatars.push(new AIAvatar(avatarNames[i % avatarNames.length], mesh, age, sex, race));
}

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  avatars.forEach(a => {
    a.observe(avatars);
    a.move(avatars);
  });
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

animate();
