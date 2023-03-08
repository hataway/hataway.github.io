const POKEMON_DATA_PATH = 'pokemon_datas_singleform.json'
const MOVE_DATA_PATH = 'move_datas.json'
const MOVE_NAME_PATH = 'all_move_names.json'

function loadJSON(filePath) {   
    var xobj = new XMLHttpRequest();
    var JSONData = null
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filePath, false);

    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            JSONData = JSON.parse(xobj.responseText);
          }
    };
    xobj.send(null); 
    return  JSONData
 }

let pokemonData = loadJSON(POKEMON_DATA_PATH)
let pokemonNames = {'en':[], 'kr':[], 'jp':[]}
for (let i in pokemonData) {
   for (let key in pokemonData[i].name) {
     pokemonNames[key].push(pokemonData[i].name[key])
    }
  }
let moveData = loadJSON(MOVE_DATA_PATH)
let moveName = loadJSON(MOVE_NAME_PATH)

sessionStorage.setItem('pokemonData', JSON.stringify(pokemonData))
sessionStorage.setItem('pokemonNames', JSON.stringify(pokemonNames))
sessionStorage.setItem('skillData', JSON.stringify(moveData))
sessionStorage.setItem('moveNames', JSON.stringify(moveName))
