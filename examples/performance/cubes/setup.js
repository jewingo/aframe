var URL_PARAMS = getUrlParams();
var DEFAULT_NUM_OBJECTS = 5000;
var NUM_OBJECTS = URL_PARAMS.numobjects || DEFAULT_NUM_OBJECTS;
var WIDTH = 100;
var sceneEl = document.querySelector('a-scene');

for (var i = 0; i < NUM_OBJECTS; i++) {
  var entity = document.createElement('a-entity');

  if (URL_PARAMS.component) {
    entity.setAttribute(URL_PARAMS.component, '');
  }

  entity.setAttribute('position', getRandomPosition());
  entity.setAttribute('geometry', {primitive: 'box'});
  entity.setAttribute('material', {color: getRandomColor(), shader: 'flat'});
  sceneEl.appendChild(entity);
}

function getRandomPosition () {
  return {
    x: Math.random() * WIDTH - WIDTH / 2,
    y: Math.random() * WIDTH - WIDTH / 2,
    z: Math.random() * WIDTH - WIDTH
  };
}

function getRandomColor () {
  return '#' + ('000000' + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
}

function getUrlParams () {
  var match;
  var pl = /\+/g;  // Regex for replacing addition symbol with a space
  var search = /([^&=]+)=?([^&]*)/g;
  var decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); };
  var query = window.location.search.substring(1);
  var urlParams = {};

  match = search.exec(query);
  while (match) {
    urlParams[decode(match[1])] = decode(match[2]);
    match = search.exec(query);
  }
  return urlParams;
}
