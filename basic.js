let pokemonJSON = JSON.parse(sessionStorage.getItem('pokemonData'))
let skillJSON = JSON.parse(sessionStorage.getItem('skillData'))

class PokemonModel {
  #id = ""
  #name = ""
  #names = {}
  #baseStats = {"H" : 0, "A" : 0, "B" : 0, "C" : 0, "D" : 0, "S" : 0}
  #nature = {"A" : 1, "B" : 1, "C" : 1, "D" : 1, "S" : 1}
  #IVs = {"H" : 31, "A" : 31, "B" : 31, "C" : 31, "D" : 31, "S" : 31}
  #EVs = {"H" : 0, "A" : 0, "B" : 0, "C" : 0, "D" : 0, "S" : 0}
  #realStats = {"H" : -1, "A" : -1, "B" : -1, "C" : -1, "D" : -1, "S" : -1}
  #ranks = {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "S" : 0}
  #level = 50
  #multipliers = {"A" : 1, "B" : 1, "C" : 1, "D" : 1, "S" : 1}
  #weight = 0
  #type = []
  constructor()   {}

  /**
   * Set pokemon's name. Find matching data if exists and set stats.
   * @param {string} name 
   */
  setName(name) {
      this.#name = name
      let match = pokemonJSON.find(p => Object.values(p.name).includes(name))
      if (match != undefined) {
          this.#names = match.name
          this.#id = match.id
          for(let key in this.#baseStats) {
              this.setBaseStat(key, match.stats[key])
          }
          this.#weight = match.weight
      }
  }
  setWeight(weight)   {
      this.#weight = weight
  }

  /**
   * Set pokemon's base stat.
   * @param {string} key - Use only H,A,B,C,D,S
   * @param {int} value - if unknown, -1
   */
  setBaseStat(key, value) {
      this.#baseStats[key] = value
      this.#resetRealStat(key)
  }
  /**
   * Set pokemon's nature.
   * @param {string} key - Use only A,B,C,D,S
   * @param {float} value - Use 0.9, 1.0, or 1.1.
   */
  setNature(key, value) {
      this.#nature[key] = value
      this.#resetRealStat(key)
  }
  /**
   * Set pokemon's ev.
   * @param {string} key - Use only H,A,B,C,D,S
   * @param {int} value 
   */
  setEV(key, value) {
      this.#EVs[key] = value
      this.#resetRealStat(key)
  }
  /**
   * Set pokemon's rank.
   * @param {string} key - Use only A,B,C,D,S
   * @param {int} value - -6 ~ 6
   */
  setRank(key, value) {
      this.#ranks[key] = value
      this.#resetRealStat(key)
  }
  /**
   * Get pokemon's real stat, without rank.
   * @param {string} key - Use only H,A,B,C,D,S
   * @returns {int} - real stat, undefined if not calculatable
   */
  getRealStatNoRank(key)    {
      if (this.#realStats[key] < 0)
          return undefined
      if (key =="H")
          return this.#realStats[key]
      return this.#realStats[key] * this.#multipliers[key]
  }
  /**
   * Get pokemon's real stat, with rank.
   * @param {string} key - Use only H,A,B,C,D,S
   * @returns {int} - real stat, undefined if not calculatable
   */
  getRealStatWithRank(key)    {
      if (this.#realStats[key] < 0)
          return undefined
      if (key =="H")
          return this.#realStats[key]
      return this.#realStats[key] * this.#getRankAsMultiplier(key) * this.#multipliers[key]
  }
  setLevel(level) {
      this.#level = level
  }
  setMultiplier(key, value)   {
      this.#multipliers[key] = value
  }
  getMultiplier(key)  {
      return this.#multipliers[key]
  }

  getName() { return this.#name }
  getNameByLang(language) { 
      if (Object.keys(this.#names).includes(language))
          return this.#names[language]
      else
          return ""
  }
  getId() { return this.#id }
  getBaseStat(key) { return this.#baseStats[key] }
  getEV(key) { return this.#EVs[key] }
  getRank(key) { return this.#ranks[key] }
  getNature(key) { return this.#nature[key] }
  getLevel() { return this.#level }
  getType() {return this.#type }

  
  #getRankAsMultiplier(key)   {
      return (2 + Math.max(0, this.#ranks[key])) / ( 2 - Math.min(0, this.#ranks[key]))
  }

  #resetRealStat(key)   {
      if(key == "H")  {
          this.#realStats[key] = Math.floor((this.#baseStats[key] * 2 + this.#IVs[key] + this.#EVs[key] / 4) 
                                              * (this.#level / 100) + 10 + this.#level)
      }
      else    {
          this.#realStats[key] = Math.floor(((this.#baseStats[key] * 2 + this.#IVs[key] + this.#EVs[key] / 4) 
                                              * (this.#level / 100) + 5) * this.#nature[key])
      }
  }


}

class SkillModel {
  #name = ""
  #category = "" //물리, 특수, 물리(변형), 특수(변형)
  #attackerKey = "A"
  #defenderKey = "B"
  //(안다리걸기, 일렉트릭볼, 헤비봄버, 죽기살기, 바디프레스, 사이코쇼크, 속임수, 프레젠트 등)
  #power = ""  //위력
  #type = "" //타입 : NULL 타입 필요

  constructor()   {}

  /**
   * Set pokemon's name. Find matching data if exists and set stats.
   * @param {string} name 
   */
  setName(name) {
      this.#name = name
      let match = skillJSON.find(p => Object.values(p.name).includes(name))
      if (match != undefined) {
          this.#power = match.power
          this.#type = match.type
          if (match.category == "physical")   {
              this.setToPhysical()
          }
          else if (match.category == "special")   {
              this.setToSpecial()
          }
          this.setException(match.name["kr"])
      }
  }
  setToPhysical() {
      this.#attackerKey = "A"
      this.#defenderKey = "B"
  }
  setToSpecial()  {
      this.#attackerKey = "C"
      this.#defenderKey = "D"
  }
  setException(krName)    {
      if (krName == "바디프레스") {
          this.#attackerKey = "B"
          this.#defenderKey = "B"
      }
      else if (krName == "사이코쇼크")    {
          this.#attackerKey = "C"
          this.#defenderKey = "B"
      }
  }
  setPower(power) {
      this.#power = power
  }

  getPower()  {
      return this.#power
  }
  getCalculationKeys()    {
      return {"attacker" : this.#attackerKey, "defender" : this.#defenderKey}
  }
  getType(){
    return this.#type
  }

}

typeNames = ["normal", "fire", "water", "electric", "grass", "ice", "fight", "poison", "ground", "flying","psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]
typeChart = [
  //N  Fi  Wa  El  Gr  Ic  Fi  Po  Gr  Fl  Ps  Bu  Ro  Gh  Dr  Da  St  Fa
  [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,0.5,  0,  1,  1,0.5,  1],
  [  1,0.5,0.5,  1,  2,  2,  1,  1,  1,  1,  1,  2,0.5,  1,0.5,  1,  2,  1],
  [  1,  2,0.5,  1,0.5,  1,  1,  1,  2,  1,  1,  1,  2,  0,0.5,  1,  1,  1],
  [  1,  1,  2,0.5,0.5,  1,  1,  1,  0,  2,  1,  1,  1,  1,0.5,  1,  1,  1],
  [  1,0.5,  2,  1,0.5,  1,  1,0.5,  2,0.5,  1,0.5,  2,  1,0.5,  1,0.5,  1],
  [  1,0.5,0.5,  1,  2,0.5,  1,  1,  2,  2,  1,  1,  1,  1,  2,  1,0.5,  1],
  [  2,  1,  1,  1,  1,  2,  1,0.5,  1,0.5,0.5,0.5,  2,  0,  1,  2,  2,0.5],
  [  1,  1,  1,  1,  2,  1,  1,0.5,0.5,  1,  1,  1,0.5,0.5,  1,  1,  0,  2],
  [  1,  2,  1,  2,0.5,  1,  1,  2,  1,  0,  1,0.5,  2,  1,  1,  1,  2,  1],
  [  1,  1,  1,0.5,  2,  1,  2,  1,  1,  1,  1,  2,0.5,  1,  1,  1,0.5,  1],
  [  1,  1,  1,  1,  1,  1,  2,  2,  1,  1,0.5,  1,  1,  1,  1,  0,0.5,  1],
  [  1,0.5,  1,  1,  2,  1,0.5,0.5,  1,0.5,  2,  1,  1,0.5,  1,  2,0.5,0.5],
  [  1,  2,  1,  1,  1,  2,0.5,  1,0.5,  2,  1,  2,  1,  1,  1,  1,0.5,  1],
  [  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  1,  1,  2,  1,0.5,  1,  1],
  [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  1,0.5,  0],
  [  1,  1,  1,  1,  1,  1,0.5,  1,  1,  1,  2,  1,  1,  2,  1,0.5,  1,0.5],
  [  1,0.5,0.5,0.5,  1,  2,  1,  1,  1,  1,  1,  1,  2,  1,  1,  1,0.5,  2],
  [  1,0.5,  1,  1,  1,  1,  2,0.5,  1,  1,  1,  1,  1,  1,  2,  2,0.5,  1],
]

let myPokemon = new PokemonModel();
let enemyPokemon = new PokemonModel();
let temp = new PokemonModel();
let myMove = new SkillModel();
var imgpath_myPokemon = "";
var imgpath_enemyPokemon = "";
var skillCategory = "A";
var defenseCategory = "B";
var coefficient = 0;

//이름 배열
var english_name = [];
var korea_name = [];
var japan_name = [];
for(var i = 0; i <pokemonJSON.length;i++){
  korea_name.push(pokemonJSON[i]["name"]["kr"]);
  english_name.push(pokemonJSON[i]["name"]["en"]);
  japan_name.push(pokemonJSON[i]["name"]["jp"]);
}

var korea_move_name = [];
for(var i = 0; i <skillJSON.length;i++){
  korea_move_name.push(skillJSON[i]["name"]["kr"]);
}

//자동완성 함수 
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          // e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
      var myPokemonName = $("#myInput").val();
      myPokemon.setName(myPokemonName);
      setMyBase();
      if(document.getElementById("result").value != null){
        whatPower_func();
      }
    });
}  

function autocomplete_enemy(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        // e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
    var enemyPokemonName = $("#myInput_enemyPokemon").val();
    enemyPokemon.setName(enemyPokemonName);
    setEnemyBase();
    if(document.getElementById("defenseResult").value != null){
      if(enemyPokemon.getBaseStat("H") != 0){
        defenseResult_func();
        damagePercentage();
      }
    }
  });
}  

function autocomplete_move(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        // e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
    whatMove_func();
  });
}  

$('input[type=radio][name=whatClass]').change(function() {
  if (this.value == '물리') {
    skillCategory = "A";
    setMyBase();
    myPokemonsReset();
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '특수') {
    skillCategory = "C";
    setMyBase();
    myPokemonsReset();
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
});

$('input[type=radio][name=whatClassD]').change(function() {
  if (this.value == '물방') {
    $('#assault_vest_div').hide();
    defenseCategory = "B";
    setEnemyBase();
    enemyPokemonsReset();
    if(document.getElementById("result").value != null){
      defenseResult_func();
      whatPower_func();
    }
  }
  else if (this.value == '특방') {
    $('#assault_vest_div').show();
    defenseCategory = "D";
    setEnemyBase();
    enemyPokemonsReset();
    if(document.getElementById("result").value != null){
      defenseResult_func()
      whatPower_func();
    }
  }
});

$('input[type=radio][name=nature]').change(function() {
  if (this.value == '0.9') {
    document.getElementById("nature_myPokemon").value = "0.9";
    myPokemon.setNature(skillCategory, 0.9);
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '1') {
    document.getElementById("nature_myPokemon").value = "1";
    myPokemon.setNature(skillCategory, 1);
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '1.1') {
    document.getElementById("nature_myPokemon").value = "1.1";
    myPokemon.setNature(skillCategory, 1.1);
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
});

$('input[type=radio][name=ev]').change(function() {
  if (this.value == '0') {
    document.getElementById("ev_myPokemon").value = "0";
    myPokemon.setEV(skillCategory, 0);
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '252') {
    document.getElementById("ev_myPokemon").value = "252";
    myPokemon.setEV(skillCategory, 252);
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
});

$('input[type=radio][name=nature_S]').change(function() {
  if (this.value == '0.9') {
    if(document.getElementById("myInput").value != ""){
    document.getElementById("nature_myPokemon_S").value = "0.9";
    myPokemon.setNature("S", 0.9);
    document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
  else if (this.value == '1') {
    if(document.getElementById("myInput").value != ""){
    document.getElementById("nature_myPokemon_S").value = "1";
    myPokemon.setNature("S", 1);
    document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
  else if (this.value == '1.1') {
    if(document.getElementById("myInput").value != ""){
    document.getElementById("nature_myPokemon_S").value = "1.1";
    myPokemon.setNature("S", 1.1);
    document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
});

$('input[type=radio][name=ev_S]').change(function() {
  if (this.value == '0') {
    if(document.getElementById("myInput").value != ""){
    document.getElementById("ev_myPokemon_S").value = "0";
    myPokemon.setEV("S", 0);
    document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
  else if (this.value == '252') {
    if(document.getElementById("myInput").value != ""){
    document.getElementById("ev_myPokemon_S").value = "252";
    myPokemon.setEV("S", 252);
    document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
});

$('input[type=radio][name=nature_enemy_B]').change(function() {
  if (this.value == '0.9') {
      document.getElementById("nature_enemyPokemon_B").value = "0.9";
      enemyPokemon.setNature(defenseCategory, 0.9);
      if(document.getElementById("defenseResult").value != null){
        defenseResult_func();
      }
  }
  else if (this.value == '1') {
      document.getElementById("nature_enemyPokemon_B").value = "1";
      enemyPokemon.setNature(defenseCategory, 1);
      if(document.getElementById("defenseResult").value != null){
        defenseResult_func();
      }
  }
  else if (this.value == '1.1') {
      document.getElementById("nature_enemyPokemon_B").value = "1.1";
      enemyPokemon.setNature(defenseCategory, 1.1);
      if(document.getElementById("defenseResult").value != null){
        defenseResult_func();
      }
  }
});

$('input[type=radio][name=nature_enemyPokemon_S]').change(function() {
  if (this.value == '0.9') {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
      document.getElementById("nature_enemyPokemon_S").value = "0.9";
      enemyPokemon.setNature("S", 0.9);
      document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank("S");
      speedCalculate();
    }
  }
  else if (this.value == '1') {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
    document.getElementById("nature_enemyPokemon_S").value = "1";
    enemyPokemon.setNature("S", 1);
    document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
  else if (this.value == '1.1') {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
    document.getElementById("nature_enemyPokemon_S").value = "1.1";
    enemyPokemon.setNature("S", 1.1);
    document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
});

$('input[type=radio][name=ev_enemyPokemon_H]').change(function() {
  if (this.value == '0') {
    document.getElementById("ev_enemyPokemon_H").value = "0";
    enemyPokemon.setEV("H", 0);
    if(document.getElementById("defenseResult").value != null){
      defenseResult_func();
    }
  }
  else if (this.value == '252') {
    document.getElementById("ev_enemyPokemon_H").value = "252";
    enemyPokemon.setEV("H", 252);
    if(document.getElementById("defenseResult").value != null){
      defenseResult_func();
    }
  }
});

$('input[type=radio][name=ev_enemyPokemon_B]').change(function() {
  if (this.value == '0') {
      document.getElementById("ev_enemyPokemon_B").value = "0";
      enemyPokemon.setEV(defenseCategory, 0);
      if(document.getElementById("defenseResult").value != null){
        defenseResult_func();
      }
  }
  else if (this.value == '252') {
      document.getElementById("ev_enemyPokemon_B").value = "252";
      enemyPokemon.setEV(defenseCategory, 252);
      if(document.getElementById("defenseResult").value != null){
        defenseResult_func();
      }
  }
});

$('input[type=radio][name=ev_enemyPokemon_S]').change(function() {
  if (this.value == '0') {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
    document.getElementById("ev_enemyPokemon_S").value = "0";
    enemyPokemon.setEV("S", 0);
    document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
  else if (this.value == '252') {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
    document.getElementById("ev_enemyPokemon_S").value = "252";
    enemyPokemon.setEV("S", 252);
    document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank("S");
    speedCalculate();}
  }
});

$('input[type=checkbox][name=scaf]').change(function() {
  if ($(this).prop("checked")) {
    if(document.getElementById("myInput").value != ""){
    myPokemon.setMultiplier('S',1.5);
    document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank('S'); 
    speedCalculate();}
  }
  else {
    if(document.getElementById("myInput").value != ""){
    myPokemon.setMultiplier('S',1);
    document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank('S'); 
    speedCalculate();}
  }
});

$('input[type=checkbox][name=scaf_enemy]').change(function() {
  if ($(this).prop("checked")) {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
    enemyPokemon.setMultiplier('S',1.5);
    document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank('S'); 
    speedCalculate();}
  }
  else {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
      enemyPokemon.setMultiplier('S',1);
      document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank('S'); 
    speedCalculate();}
  }
});

$('input[type=checkbox][name=assault_vest]').change(function() {
  if ($(this).prop("checked")) {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
      enemyPokemon.setMultiplier('D',1.5);
      defenseResult_func();
    }
  }
  else {
    if(document.getElementById("myInput_enemyPokemon").value != ""){
      enemyPokemon.setMultiplier('D',1);
      defenseResult_func();
    }
  }
});

var typeValue = 1;
$('input[type=radio][name=type]').change(function() {
  if (this.value == '1') {
    document.getElementById("coefficient").value /= typeValue;
    typeValue = 1;
    document.getElementById("coefficient").value *= typeValue;
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '1.5') {
    document.getElementById("coefficient").value /= typeValue;
    typeValue = 1.5;
    document.getElementById("coefficient").value *= typeValue;
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '2') {
    document.getElementById("coefficient").value /= typeValue;
    typeValue = 2;
    document.getElementById("coefficient").value *= typeValue;
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
});

var compatibility = 1;
$('input[type=radio][name=coefficient]').change(function() {
  if (this.value == '0.25') {
    document.getElementById("coefficient").value /= compatibility;
    compatibility = 0.25;
    document.getElementById("coefficient").value *= compatibility;
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '0.5') {
    document.getElementById("coefficient").value /= compatibility;
    compatibility = 0.5;
    document.getElementById("coefficient").value *= compatibility;
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '1') {
    document.getElementById("coefficient").value /= compatibility;
    compatibility = 1;
    document.getElementById("coefficient").value *= compatibility;
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '2') {
    document.getElementById("coefficient").value /= compatibility;
    compatibility = 2;
    document.getElementById("coefficient").value *= compatibility;
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else if (this.value == '4') {
    document.getElementById("coefficient").value /= compatibility;
    compatibility = 4;
    document.getElementById("coefficient").value *= compatibility;
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
});

function setMyBase(){
  if(document.getElementById("myInput").value != ""){
    document.getElementById("base_myPokemon").value = myPokemon.getBaseStat(skillCategory);
    document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank("S").toFixed(0);
  }
  if(document.getElementById("base_enemyPokemonSpeed").value != null){
    speedCalculate();
  }
}

function setEnemyBase(){
  if(document.getElementById("myInput_enemyPokemon").value != ""){
    document.getElementById("base_enemyPokemon_H").value = enemyPokemon.getBaseStat("H");
    if(defenseCategory == "B"){
      document.getElementById("base_enemyPokemon_B").value = enemyPokemon.getBaseStat("B");
    }
    else if(defenseCategory == "D"){
      document.getElementById("base_enemyPokemon_B").value = enemyPokemon.getBaseStat("D");
    }
    document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank("S").toFixed(0);
  }
  speedCalculate();
}

function whatPokemon_func(){
  if(this.id == "whatPokemon"){
    var myPokemonName = $("#myInput").val();
    myPokemon.setName(myPokemonName);
    setMyBase();
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
  else {
    var enemyPokemonName = $("#myInput_enemyPokemon").val();
    enemyPokemon.setName(enemyPokemonName);
    setEnemyBase();
    if(document.getElementById("defenseResult").value != null){
      defenseResult_func();
      damagePercentage();
    }
  }
}

$("#myInput").on("propertychange change paste input", function() {
  myPokemonsReset();
});

$("#myInput_enemyPokemon").on("propertychange change paste input", function() {
  enemyPokemonsReset();
});

$("#nature_myPokemon").on("propertychange change paste input", function() {
  var nature_replace = fnReplace($("#nature_myPokemon").val());
  myPokemon.setNature(skillCategory, nature_replace);
  if(document.getElementById("result").value != null){
    whatPower_func();
  }
});

$("#nature_enemyPokemon_B").on("propertychange change paste input", function() {
  var nature_replace = fnReplace($("#nature_enemyPokemon_B").val());
  enemyPokemon.setNature(defenseCategory, nature_replace);
  if(document.getElementById("defenseResult").value != null){
    defenseResult_func();
  }
});

$("#ev_myPokemon").on("propertychange change paste input", function() {
  var ev_replace = fnReplace($("#ev_myPokemon").val());
  myPokemon.setEV(skillCategory, ev_replace);
  if(document.getElementById("result").value != null){
    whatPower_func();
  }
});

$("#ev_enemyPokemon_H").on("propertychange change paste input", function() {
  var ev_replace = fnReplace($("#ev_enemyPokemon_H").val());
  enemyPokemon.setEV("H", ev_replace);
  if(document.getElementById("defenseResult").value != null){
    defenseResult_func();
  }
});

$("#ev_enemyPokemon_B").on("propertychange change paste input", function() {
  var ev_replace = fnReplace($("#ev_enemyPokemon_B").val());
  enemyPokemon.setEV(defenseCategory, ev_replace);
  if(document.getElementById("defenseResult").value != null){
    defenseResult_func();
  }
});

$("#ev_myPokemon_S").on("propertychange change paste input", function() {
  var speed_replace = fnReplace($("#ev_myPokemon_S").val());
  myPokemon.setEV('S', speed_replace);
  document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank('S');
  speedCalculate();
});

$("#ev_enemyPokemon_S").on("propertychange change paste input", function() {
  var speed_replace = fnReplace($("#ev_enemyPokemon_S").val());
  enemyPokemon.setEV('S', speed_replace);
  document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank('S');
  speedCalculate();
});

document.getElementById("rank_plus").addEventListener('click', nature_rankplus_func);
document.getElementById("rank_plus_S").addEventListener('click', nature_rankplus_func);
document.getElementById("rank_plus_enemyPokemon").addEventListener('click', nature_rankplus_func);
document.getElementById("rank_plus_enemyPokemon_S").addEventListener('click', nature_rankplus_func);

function nature_rankplus_func(){
  if(this.id == "rank_plus"){
    var currentRank = document.getElementById("rank_myPokemon").value;
    if(currentRank < 6 ){
      document.getElementById("rank_myPokemon").value++;
      myPokemon.setRank(skillCategory, document.getElementById("rank_myPokemon").value);
      if(document.getElementById("result").value != null){
        whatPower_func();
      }
    }
  }
  else if(this.id == "rank_plus_S"){
    var currentRank = document.getElementById("rank_myPokemon_S").value;
    if(currentRank < 6 ){
      document.getElementById("rank_myPokemon_S").value++;
      myPokemon.setRank("S", document.getElementById("rank_myPokemon_S").value);
      document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank("S");
      speedCalculate();
    }
  }
  else if(this.id == "rank_plus_enemyPokemon_S"){
    var currentRank = document.getElementById("rank_enemyPokemon_S").value;
    if(currentRank < 6 ){
      document.getElementById("rank_enemyPokemon_S").value++;
      enemyPokemon.setRank("S", document.getElementById("rank_enemyPokemon_S").value);
      document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank("S");
      speedCalculate();
    }
  }
  else if (this.id == "rank_plus_enemyPokemon"){
    var currentRank = document.getElementById("rank_enemyPokemon").value;
    if(currentRank < 6 ){
      if(defenseCategory == "B"){
        document.getElementById("rank_enemyPokemon").value++;
          enemyPokemon.setRank("B", document.getElementById("rank_enemyPokemon").value);
          if(document.getElementById("defenseResult").value != null){
            defenseResult_func();
          }
        }
        else if(defenseCategory == "D"){
          document.getElementById("rank_enemyPokemon").value++;
          enemyPokemon.setRank("D", document.getElementById("rank_enemyPokemon").value);
          if(document.getElementById("defenseResult").value != null){
            defenseResult_func();
          }
        }
      }
  }
}

document.getElementById("rank_minus").addEventListener('click', nature_rankminus_func);
document.getElementById("rank_minus_S").addEventListener('click', nature_rankminus_func);
document.getElementById("rank_minus_enemyPokemon").addEventListener('click', nature_rankminus_func);
document.getElementById("rank_minus_enemyPokemon_S").addEventListener('click', nature_rankminus_func);

function nature_rankminus_func(){
  if(this.id == "rank_minus"){
    var currentRank = document.getElementById("rank_myPokemon").value;
    if(currentRank > -6 ){
      document.getElementById("rank_myPokemon").value--;
      myPokemon.setRank(skillCategory, document.getElementById("rank_myPokemon").value);
      if(document.getElementById("result").value != null){
        whatPower_func();
      }
    }
  }
  else if(this.id == "rank_minus_S"){
    var currentRank = document.getElementById("rank_myPokemon_S").value;
    if(currentRank > -6 ){
      document.getElementById("rank_myPokemon_S").value--;
      myPokemon.setRank("S", document.getElementById("rank_myPokemon_S").value);
      document.getElementById("base_myPokemonSpeed").value = myPokemon.getRealStatWithRank("S");
      speedCalculate();
    }
  }
  else if(this.id == "rank_minus_enemyPokemon_S"){
    var currentRank = document.getElementById("rank_enemyPokemon_S").value;
    if(currentRank > -6 ){
      document.getElementById("rank_enemyPokemon_S").value--;
      enemyPokemon.setRank("S", document.getElementById("rank_enemyPokemon_S").value);
      document.getElementById("base_enemyPokemonSpeed").value = enemyPokemon.getRealStatWithRank("S");
      speedCalculate();
    }
  }
  else if(this.id == "rank_minus_enemyPokemon"){
    var currentRank = document.getElementById("rank_enemyPokemon").value;
    if(currentRank > -6 ){
      if(defenseCategory == "B"){
        document.getElementById("rank_enemyPokemon").value--;
        enemyPokemon.setRank("B", document.getElementById("rank_enemyPokemon").value);
        if(document.getElementById("defenseResult").value != null){
          defenseResult_func();
        }
      }
      else if(defenseCategory =="D"){
        document.getElementById("rank_enemyPokemon").value--;
        enemyPokemon.setRank("D", document.getElementById("rank_enemyPokemon").value);
        if(document.getElementById("defenseResult").value != null){
          defenseResult_func();
        }
      }
    }
  }
}

$("#rank_myPokemon").on("propertychange change paste input", function() {
  var rank_replace = fnReplace($("#rank_myPokemon").val());
  myPokemon.setRank(skillCategory, rank_replace);
  if(document.getElementById("result").value != null){
    whatPower_func();
  }
});

$("#rank_enemyPokemon").on("propertychange change paste input", function() {
  var rank_replace = fnReplace($("#rank_enemyPokemon").val());
  enemyPokemon.setRank(defenseCategory, rank_replace);
  if(document.getElementById("defenseResult").value != null){
    defenseResult_func();
  }
});

document.getElementById("multiply_0.5").addEventListener('click', multiplyCoefficient);
document.getElementById("multiply_0.75").addEventListener('click', multiplyCoefficient);
document.getElementById("multiply_1.1").addEventListener('click', multiplyCoefficient);
document.getElementById("multiply_1.2").addEventListener('click', multiplyCoefficient);
document.getElementById("multiply_1.3").addEventListener('click', multiplyCoefficient);
document.getElementById("multiply_1.5").addEventListener('click', multiplyCoefficient);
document.getElementById("multiply_2").addEventListener('click', multiplyCoefficient);
document.getElementById("reset").addEventListener('click', multiplyCoefficient);

function multiply(i){
  var coefficientNum = i/10;
  document.getElementById("coefficient").value *= i;
  document.getElementById("coefficient").value /= 10;
  $('.coefficientTag').append(
    '<button type = "button" class ="btnRemove" id ="tag">'+coefficientNum+'</button>'
  );
  $('.btnRemove').click (function(){
    document.getElementById("coefficient").value /= coefficientNum;
    //$(this).prev().remove();
    $(this).remove();
    count++;
  });
  if(document.getElementById("result").value != null){
    whatPower_func();
  }
}

function multiplyCoefficient(){
  if(($(this).attr('id'))=='multiply_0.5'){
    multiply(5);
  }
  else if(($(this).attr('id'))=='multiply_0.75'){
    multiply(7.5);
  }
  else if(($(this).attr('id'))=='multiply_1.1'){
    console.log("d");
    multiply(11);

  }
  else if(($(this).attr('id'))=='multiply_1.2'){
    multiply(12);
  }
  else if(($(this).attr('id'))=='multiply_1.3'){
    multiply(13);
  }
  else if(($(this).attr('id'))=='multiply_1.5'){
    multiply(15);
  }
  else if(($(this).attr('id'))=='multiply_2'){
    multiply(20);
  }
  else if(($(this).attr('id'))=='reset'){
    document.getElementById("coefficient").value = "1";
    $("#notMyType").prop("checked", true);
    $("#coefficient_1").prop("checked", true);
    typeValue = 1;
    compatibility = 1;
    $(".coefficientTag").empty();
    if(document.getElementById("result").value != null){
      whatPower_func();
    }
  }
};

$("#coefficient").on("propertychange change paste input", function() {
  var coefficient_replace = fnReplace($("#coefficient").val());
  if(document.getElementById("result").value != null){
      var currentPower = document.getElementById("power").value;
      var result = myPokemon.getRealStatWithRank(skillCategory) * currentPower * coefficient_replace;
      document.getElementById("result").value = Math.round(result);
  }
});

$("#power").on("propertychange change paste input", function() {
  var power_replace = fnReplace($("#power").val());
  myMove.setPower(power_replace);
  if(document.getElementById("result").value != null){
    whatPower_func();
  }
});

//document.getElementById("whatPower").addEventListener('click', whatPower_func);
function whatPower_func(){
  if(document.getElementById("myInput").value == "") {
    document.getElementById("result").value = 0;
  }
  else{
    var result = myPokemon.getRealStatWithRank(skillCategory) * document.getElementById("power").value * document.getElementById("coefficient").value;
    document.getElementById("result").value = Math.floor(result);
    damagePercentage();
  }
}

function defenseResult_func(){
  if(document.getElementById("myInput_enemyPokemon").value == "") {
    document.getElementById("defenseResult").value = 0;
  }
  else{
    var result = enemyPokemon.getRealStatNoRank("H") * enemyPokemon.getRealStatWithRank(defenseCategory) / 0.411;
    document.getElementById("defenseResult").value = Math.floor(result);
    damagePercentage();
  }
}

function damagePercentage(){
  if(document.getElementById("result").value == "0" || document.getElementById("defenseResult").value == "0"){
    document.getElementById("percentage").value = "0";
  }
  else {
    var percentageMIN = document.getElementById("result").value * 100 / ((document.getElementById("defenseResult").value * 0.411) * 50 / 22 / 0.85 );
    var percentageMAX = document.getElementById("result").value * 100 / ((document.getElementById("defenseResult").value * 0.411) * 50 / 22 );
    var damageMIN = enemyPokemon.getRealStatWithRank("H") * document.getElementById("result").value / ((document.getElementById("defenseResult").value * 0.411) * 50 / 22 / 0.85 );
    var damageMAX = enemyPokemon.getRealStatWithRank("H") * document.getElementById("result").value / ((document.getElementById("defenseResult").value * 0.411) * 50 / 22 );
    
    // else if(skillCategory == "C"){
    //   var percentageMIN = document.getElementById("result").value * 100 / ((document.getElementById("defenseResult_D").value * 0.411) * 50 / 22 / 0.85 );
    //   var percentageMAX = document.getElementById("result").value * 100 / ((document.getElementById("defenseResult_D").value * 0.411) * 50 / 22 );
    //   var damageMIN = enemyPokemon.getRealStatWithRank("H") * document.getElementById("result").value  / ((document.getElementById("defenseResult").value * 0.411) * 50 / 22 / 0.85 );
    //   var damageMAX = enemyPokemon.getRealStatWithRank("H") * document.getElementById("result").value  / ((document.getElementById("defenseResult").value * 0.411) * 50 / 22 );
    // }
    document.getElementById("percentage").value = percentageMIN.toFixed(2) + "% ~ " + percentageMAX.toFixed(2) + "%";
    document.getElementById("damage").value = damageMIN.toFixed(0) + " ~ " + damageMAX.toFixed(0);
  }
}

function fnReplace(val) {
  var ret = 0;
  if(typeof val != "undefined" && val != null && val != ""){
      ret = Number(val.replace(/,/gi,''));
  }
  return ret;        
}

function whatMove_func(){
  var myMoveName = $("#myInput_move").val();
  myMove.setName(myMoveName);
  document.getElementById("power").value = myMove.getPower();
  for(var i = 0; i < myPokemon.getType().length; i++){
    if(myPokemon.getType()[i] == myMove.getType()){
    }
  }
  if(document.getElementById("result").value != null){
    whatPower_func();
  }
}

function speedCalculate(){
  if(myPokemon.getRealStatWithRank("S") != null && enemyPokemon.getRealStatWithRank("S") != null){
    if(myPokemon.getRealStatWithRank("S") > enemyPokemon.getRealStatWithRank("S")){
      document.getElementById("speed").value = "선공"
    }
    else if(myPokemon.getRealStatWithRank("S") == enemyPokemon.getRealStatWithRank("S")){
      document.getElementById("speed").value = "동속"
    }
    else {
      document.getElementById("speed").value = "후공"
    }
  }
}

function myPokemonsReset(){
  $('#nature_mid').prop("checked",true);
  document.getElementById("nature_myPokemon").value = 1;
  myPokemon.setNature(skillCategory, 1);
  $('#basic_ev').prop("checked",true);
  document.getElementById("ev_myPokemon").value = 0;
  myPokemon.setEV(skillCategory, 1);
  document.getElementById("rank_myPokemon").value = 0;
  myPokemon.setRank(skillCategory, 0);
  whatPower_func();
  damagePercentage();
}

function enemyPokemonsReset(){
  $('#nature_mid_B').prop("checked",true);
  document.getElementById("nature_enemyPokemon_B").value = 1;
  enemyPokemon.setNature(defenseCategory, 1);
  $('#basic_ev_enemyPokemon_B').prop("checked",true);
  document.getElementById("ev_enemyPokemon_B").value = 0;
  enemyPokemon.setEV(defenseCategory, 1);
  document.getElementById("rank_enemyPokemon").value = 0;
  enemyPokemon.setRank(defenseCategory, 0);
  $('#assault_vest').prop("checked",false);
  enemyPokemon.setMultiplier('D',1);
  if(enemyPokemon.getBaseStat("H") != 0){
    defenseResult_func();
    damagePercentage();
  }
}

function speedReset(){
  $('#nature_mid_S').prop("checked",true);
  document.getElementById("nature_myPokemon_S").value = 1;
  myPokemon.setNature('S', 1);
  $('#basic_ev_S').prop("checked",true);
  document.getElementById("ev_myPokemon_S").value = 0;
  myPokemon.setEV('S', 1);
  document.getElementById("rank_myPokemon_S").value = 0;
  myPokemon.setRank('S', 0);

  $('#nature_enemyPokemon_mid_S').prop("checked",true);
  document.getElementById("nature_enemyPokemon_S").value = 1;
  enemyPokemon.setNature('S', 1);
  $('#basic_ev_enemyPokemon_S').prop("checked",true);
  document.getElementById("ev_enemyPokemon_S").value = 0;
  enemyPokemon.setEV('S', 1);
  document.getElementById("rank_enemyPokemon_S").value = 0;
  enemyPokemon.setRank('S', 0);

  $('#scaf').prop("checked",false);
  myPokemon.setMultiplier('S',1);
  enemyPokemon.setMultiplier('S',1);
}

document.getElementById("switch").addEventListener('click', switchPokemon);
function switchPokemon(){
  var newMyPokemonName = $("#myInput_enemyPokemon").val();
  var newEnemyPokemonName = $("#myInput").val();

  document.getElementById("myInput").value = newMyPokemonName;
  myPokemon.setName(newMyPokemonName);
  setMyBase();

  document.getElementById("myInput_enemyPokemon").value = newEnemyPokemonName;
  enemyPokemon.setName(newEnemyPokemonName);
  setEnemyBase();
  
  myPokemonsReset();
  enemyPokemonsReset();
  speedReset();  
}
