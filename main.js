import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import {Map, View} from 'ol';
import {fromLonLat} from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Select from 'ol/interaction/Select';
// Extracted the coordinates from the attached file and stored it in seperate file.
import COORDINATES from "./coordinates.js";

// Since, the assignment that was given had only 10 images, therefore, I am only showing those coordinates for which i had images when test=true

let test=true;

let features = [];
let imageSource = [];
let imgcoord = [];

// Storing the paths of the images given in imageSource

for (let index = 0; index < 10; index++) {
  imageSource.push("images/HMTpano_000001_00000".concat(index).concat(".jpg"))
}

// only run this code if TEST is true
function fillImgCoordIfTest() {
  for (let i = 0; i < 10; i++) {
    imgcoord.push(i);
  }
  return imgcoord;
}
test && fillImgCoordIfTest();

// Default Styling for each point of vectorLayer 
// vectorLayer shows the coordinates on the map

const pointStyleFunction = () => {
  return new Style({
    image: new CircleStyle({
      radius: 4,
      fill: new Fill({ color: "red" }),
      stroke: new Stroke({ color: "yellow", width: 2 }),
    }),
  });
};

// Creating a feature and appending it to feature array so that it can be added as a point
// to show a coordinate in vectorLayer

const iterate = (coordinates) => {
  coordinates.forEach((coordinate) => {
    let coord= fromLonLat(coordinate);
    features.push(
      new Feature({
        geometry: new Point(coord)
      })
    )
  })
}
iterate(test ? imgcoord : COORDINATES);

// Initilaise vector source and layer 

let vectorSource = new VectorSource({
  features: features,
});
let vectorLayer = new VectorLayer({
  source: vectorSource,
  style: pointStyleFunction,
});

// Initialize a new map with 2 layers - Tile and Vector
// TileLayer shows the basic map of the world - continents, ocean
// VectorLayer shows the coordinates on the map 

const map = new Map({
  target: 'map-container',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer
  ],
  view: new View({
    center: fromLonLat([10.93376479, 50.98380407]),
    zoom: 15,
  }),
});

// Coordinates styling when they are clicked

let selectStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "blue" }),
    stroke: new Stroke({ color: "yellow", width: 2 }),
  }),
})

// Added interaction so that we can interact with the coordinates and allow a user to
// identify which coordinate he has clicked

let selectInteraction = new Select({
  layers: [vectorLayer],
  style: [selectStyle]
});
map.addInteraction(selectInteraction);

// Default image state that has to rendered on initial loading of the page

let imgState= "images/HMTpano_000001_000000.jpg";

// For each coordinate click, update the image if it's available on the basis of coordinates

selectInteraction.on('select', function(event) {
  let p = event.mapBrowserEvent.pixel;
  map.forEachFeatureAtPixel(p, function (feature) {
    let lon =  feature.getProperties().geometry.getCoordinates()[0];
    let lat = feature.getProperties().geometry.getCoordinates()[1];
    let c = [lon,lat]
    for(let i=0;i<imgcoord.length;i++) {
      let cx=c[0];
      let cy=c[1];
      let imgx=fromLonLat(imgcoord[i])[0];
      let imgy=fromLonLat(imgcoord[i])[1];
      if(cx==imgx && cy==imgy) {
        imgState=imageSource[i];

        // Trigger an event to change image
        const event = new CustomEvent('imgChange');
        window.dispatchEvent(event);
      }
    }
  })
}); 

function handleImageChange() {
  console.log("trigger");
    const newPanorama = new PANOLENS.ImagePanorama(imgState);
    viewer.add(newPanorama);
    viewer.setPanorama( newPanorama );
}

// Adding a event listener to custom event

window.addEventListener('imgChange', handleImageChange);

const imageContainer = document.querySelector("#image");
const viewer = new PANOLENS.Viewer({
  container: imageContainer,
});

// Dispatching event for initial render
window.dispatchEvent(new CustomEvent('imgChange'));

