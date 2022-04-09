import * as THREE from 'three';
import Stats from "three/examples/jsm/libs/stats.module";

// POSITIONS

const planeMeshParameters = [
    {
        rotation: {
            x: -Math.PI / 2,
        },
        scale: 2,
        position: {
            x: 0,
            y: 40,
            z: 10
        }
    },
    {
        rotation: {
            x: Math.PI / 2,
        },
        scale: 2,
        position: {
            x: 0,
            y: -40,
            z: 10
        }
    },
    {
        rotation: {
            y: Math.PI / 2,
        },
        scale: 2,
        position: {
            x: 40,
            y: 0,
            z: 10
        }
    },
    {
        rotation: {
            y: -Math.PI / 2,
        },
        scale: 2,
        position: {
            x: -40,
            y: 0,
            z: 10
        }
    },
    {
        rotation: {
            x: -Math.PI / 2,
        },
        scale: 2,
        position: {
            x: 0,
            y: 40,
            z: -118
        }
    },
    {
        rotation: {
            x: Math.PI / 2,
        },
        scale: 2,
        position: {
            x: 0,
            y: -40,
            z: -118
        }
    },
    {
        rotation: {
            y: Math.PI / 2,
        },
        scale: 2,
        position: {
            x: 40,
            y: 0,
            z: -118
        }
    },
    {
        rotation: {
            y: -Math.PI / 2,
        },
        scale: 2,
        position: {
            x: -40,
            y: 0,
            z: -118
        }
    }
];

// SHADER

const vertexShader = () => {
    return `
      varying float x;
      varying float y;
      varying float z;
      varying vec3 vUv;
      uniform float u_time;
      uniform float u_amplitude;
      uniform float[64] u_data_arr;
      void main() {
        vUv = position;
        x = abs(position.x);
	      y = abs(position.y);
        float floor_x = round(x);
	      float floor_y = round(y);
        float x_multiplier = (64.0 - x) / 4.0;
        float y_multiplier = (64.0 - y) / 4.0;
        z = sin(u_data_arr[int(floor_x)] / 50.0 + u_data_arr[int(floor_y)] / 50.0) * u_amplitude;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
      }
    `;
};

const fragmentShader = () => {
    return `
    varying float x;
    varying float y;
    varying float z;
    varying vec3 vUv;
    uniform float u_time;
    uniform float[64] u_data_arr;
    void main() {
      gl_FragColor = vec4((u_data_arr[32])/255.0, 0, (u_data_arr[8])/255.0, 1.0);
      // gl_FragColor = vec4((64.0 - abs(x)) / 32.0, (32.0 - abs(y)) / 32.0, (abs(x + y) / 2.0) / 32.0, 1.0);
    }
  `;
};

// MUSIC

let audioContext: AudioContext | undefined, audioElement, dataArray: Uint8Array, analyser: AnalyserNode, source,
    uniforms: any, isPlaying: boolean = false;

uniforms = {
    u_time: {
        type: "f",
        value: 2.0,
    },
    u_amplitude: {
        type: "f",
        value: 4.0,
    },
    u_data_arr: {
        type: "float[64]",
        value: [],
    },
};

const setupAudioContext = () => {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById("audio");
    // @ts-ignore
    console.log(audioElement.duration);
    // @ts-ignore
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

}

// @ts-ignore
document.getElementById("audio").onplay = async function () {
    if (audioContext === undefined) {
        setupAudioContext();
        isPlaying = true;
    }
}

// @ts-ignore
document.getElementById("audio").onpause = async function (){
    isPlaying = false;
}

// THREE.js

const scene = new THREE.Scene();

const stats = Stats();

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
ambientLight.castShadow = false;

const spotLight = new THREE.SpotLight(0xffffff, );
spotLight.intensity = 0.9;
spotLight.position.set(-10, 40, 20);
spotLight.castShadow = true;

const camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    1,
    1000
)
camera.position.z = 80;

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)
document.body.appendChild(stats.dom);

const planeGeometry = new THREE.PlaneGeometry(64, 64, 64, 64);
const planeMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
    uniforms: uniforms,
    wireframe: true
});

let planeMeshArray = [];

planeMeshParameters.forEach(item => {

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

    if(item.rotation.x == undefined){
        planeMesh.rotation.y = item.rotation.y;
    } else {
        planeMesh.rotation.x = item.rotation.x;
    }

    planeMesh.scale.x = item.scale;
    planeMesh.scale.y = item.scale;
    planeMesh.scale.z = item.scale;
    planeMesh.position.x = item.position.x;
    planeMesh.position.y = item.position.y;
    planeMesh.position.z = item.position.z;

    planeMeshArray.push(planeMesh)
    scene.add(planeMesh);

});

scene.add(ambientLight);
scene.add(spotLight);

function animate() {
    requestAnimationFrame(animate)
    render()
    stats.update();
}

function render() {
    if (analyser !== undefined) {
        analyser.getByteFrequencyData(dataArray);
        uniforms.u_data_arr.value = dataArray;
    }
    camera.rotation.z += 0.001;
    renderer.render(scene, camera);
}

animate()