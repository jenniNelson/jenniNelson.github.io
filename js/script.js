

loadData().then(poke_dict => {

    console.log(poke_dict);

    let card_manager = new CardManager();
    // let pokedex = new Pokedex(poke_dict, card_manager);
    let matchupview = new Matchups(poke_dict, card_manager);
    let mapview = new MapView(poke_dict, card_manager);


    let fancydex = new FancyDex(poke_dict, card_manager);


    let dataLoader = new DataLoader(poke_dict, card_manager, matchupview, fancydex);

    card_manager.update_objects();

    // console.log(pokedex);


});


async function loadData() {
    let raw_pokemon = await loadFile("data/pokemon_data/main_collection.csv");

    let pokemon_dict = {};

    for (let mon of raw_pokemon) {
        pokemon_dict[mon.long_id] = new Pokemon(mon)
    }

    return pokemon_dict
}

async function loadFile(file) {
    let data = await d3.csv(file);
    return data;
}

/** A class for managing who is selected in VS / Team Builder views.  **/
class CardManager{
    constructor() {
        this.vs = {
            0: '001',
            1: '133',
            queue: [0,1]
        };
        this.team = {
            0: '003',
            1: '320',
            2: '412',
            3: '231',
            4: '600',
            5: '165',
            queue: [0,1,2,3,4,5]
        };

        this.iv = '006';

        this.callbacks = [];

        this.rando_mode = false;


    }

    /** Add a callback for this class to call when a change is made to a selection **/
    add_callback(callback){
        this.callbacks.push(callback)
    }

    /** Change who is selected in a particular list **/
    update_pokemon(which_list, which_card, to_who, checkbox=null){
        // console.log(which_list, which_card, to_who, checkbox)
        if(which_list==="vs" || which_list==="#vs" || which_list==="pvp"){
            this.update_vs(which_card, to_who, checkbox)
        } else if(which_list==="team" || which_list==="#tb" ){
            this.update_team(which_card, to_who, checkbox)
        }
    }

    /** Change who is selected in the teambuilder list **/
    update_team(which_card, to_who, checkbox=null){

        // Not a checkbox-style change
        if(checkbox === null){
            let index = this.team.queue.indexOf(which_card);
            if (index > -1) {
              this.team.queue.splice(index, 1);
            }
            this.team[which_card] = to_who;
            this.team.queue.push(which_card);

        }
        if(checkbox === true) {
            let none_free = true;
            for (let i of [0, 1, 2, 3, 4, 5]) {
                if (this.team[i] == null || this.vs[i] === "whodat") {
                    this.team[i] = to_who;
                    this.team.queue.push(i);
                    none_free = false;
                    which_card=i;
                    break;
                }
            }
            if (none_free) {
                which_card = this.team.queue.shift();
                which_card = which_card === undefined ? 0 : which_card;
                this.team[which_card] = to_who;
                this.team.queue.push(which_card);
            }
        } else if(checkbox === false){
            for (let i of [0,1,2,3,4,5]){
                if(this.team[i] === to_who){
                    this.team[i] = null;
                    // Remove from queue
                    let index = this.team.queue.indexOf(i);
                    if (index > -1) {
                      this.team.queue.splice(index, 1);
                    }
                    which_card = i;
                    to_who = null;
                    break;
                }
            }
        }

        if(to_who === null) {
            to_who = "whodat"
        }

        this.update_objects("team", which_card, to_who)
    }

    /** Change who is selected in the VS list **/
    update_vs(which_card, to_who, checkbox=null){

        // Not a checkbox-style change
        if(checkbox === null){
            let index = this.vs.queue.indexOf(which_card);
            if (index > -1) {
              this.vs.queue.splice(index, 1);
            }
            this.vs[which_card] = to_who;
            this.vs.queue.push(which_card);

        }
        if(checkbox === true) {
            let none_free = true;
            for (let i of [0, 1]) {
                if (this.vs[i] == null || this.vs[i] === "whodat") {
                    this.vs[i] = to_who;
                    this.vs.queue.push(i);
                    none_free = false;
                    which_card=i;
                    break;
                }
            }
            if (none_free) {
                which_card = this.vs.queue.shift();
                which_card = which_card === undefined ? 0 : which_card;
                this.vs[which_card] = to_who;
                this.vs.queue.push(which_card);
            }
        } else if(checkbox === false){
            for (let i of [0,1]){
                if(this.vs[i] === to_who){
                    this.vs[i] = null;
                    // Remove from queue
                    let index = this.vs.queue.indexOf(i);
                    if (index > -1) {
                      this.vs.queue.splice(index, 1);
                    }
                    which_card = i;
                    to_who = null;
                    break;
                }
            }
        }

        if(to_who === null ) {
            to_who = "whodat"
        }

        this.update_objects("vs", which_card, to_who)
    }

    /** Call all the registered callbacks **/
    update_objects(cat, which_card, to_who){

        // console.log(this.team, this.vs, this.callbacks)
        // console.log("YOOHOO", which_card)

        for (let cb of this.callbacks){
            cb(cat, which_card, to_who);
        }

    }

}

/** The data structure to hold all info about a particular pokemon **/
class Pokemon{
    constructor(csv_result) {
        if (csv_result===undefined){
            return;
        }
        this.name = csv_result.name;
        this.long_id = csv_result.long_id;

        this.stat_total = +csv_result.stat_total;  //ints for stats
        this.hp = +csv_result.hp;
        this.attack = +csv_result.attack;
        this.defense = +csv_result.defense;
        this.sp_attack = +csv_result.sp_attack;
        this.sp_defense = +csv_result.sp_defense;
        this.speed = +csv_result.speed;

        this.ability1 = ''; //TODO: We don't actually have vanilla abilities easily yet
        this.ability2 = '';

        this.type1 = csv_result.type1; //strings
        this.type2 = csv_result.type2;

        this.ev_from = csv_result.ev_from; //string (long_id)
        this.ev_to = string_to_list(csv_result.ev_to);  //list (long_ids)(may be empty)
        this.is_base = csv_result.is_base; //booleans
        this.is_full_ev = csv_result.is_full_ev;
        this.evo_family = string_to_list(csv_result.evo_family); //list of long ids

        this.capture_rate = csv_result.capture_rate;
        this.gen_introduced = csv_result.gen_introduced; //number
        this.is_legendary = csv_result.is_legendary; //boolean
        this.height_m = csv_result.height_m;
        this.weight_kg = csv_result.weight_kg;

        let raw_locs = string_to_list(csv_result.locations);

        this.locations = raw_locs.map( loc_string => {
            let [game,map,place] = loc_string.split('/')
                return {
                    game: game.replace(/\"/g, ""),
                    map: map.replace(/\"/g, ""),
                    place: place.replace(/\"/g, ""),
                    place_id : place.replace(/\"/g, "").replace(/ /g, '_').replace(/\.|'/g, '')
                };
        }); //list of location strings


        this.rand_type1 = null;
        this.rand_type2 = null;
        this.rand_hp = null;
        this.rand_attack = null;
        this.rand_defense = null;
        this.rand_speed = null;
        this.rand_sp_attack = null;
        this.rand_sp_defense = null;
        this.rand_ability1 = null;
        this.rand_ability2 = null;
        this.rand_item = null;
        this.rand_ev_froms = [];
        this.rand_ev_to = [];
        this.is_randomized = false;

        // TODO: currently for test purposes defaults to true.
        this.is_stats_revealed = false;
        this.is_encountered = false;
        this.revealed_ev_from_idxs = [];
        this.revealed_ev_to_idxs = [];
    }

    getStat(stat) {
        if(!this.is_randomized) {
            return this[stat]
        } else {
            if(this.is_stats_revealed) {
                return this["rand_" +stat]
            }
            return 0;
        }
    }

    getStats() {
        if(!this.is_randomized) {
            return [this.hp, this.attack, this.defense, this.sp_attack, this.sp_defense, this.speed]
        } else {
            if(this.is_stats_revealed) {
                return [this.rand_hp, this.rand_attack, this.rand_defense, this.rand_sp_attack, this.rand_sp_defense, this.rand_speed]
            }
            return [0,0,0,0,0,0];
        }
    }

    getStatTotal() {
        if(!this.is_randomized) {
            return this.stat_total
        } else {
            if(this.is_stats_revealed) {
                return this.rand_hp + this.rand_attack + this.rand_defense + this.rand_sp_attack + this.rand_sp_defense + this.rand_speed
            }
            return 0
        }
    }

    getType() {
        if(!this.is_randomized) {
            return [this.type1, this.type2]
        } else {
            if (this.is_encountered || this.is_stats_revealed) {
                return [this.rand_type1, this.rand_type2]
            }
            return ["missing", ""]
        }
    }

    getAbilities() {
        if(!this.is_randomized) {
            return [this.ability1, this.ability2]
        } else {
            if (this.is_stats_revealed) {
                return [this.rand_ability1, this.rand_ability2]
            }
            return ["???", ""]
        }
    }

    getEvosTo() {
        if(!this.is_randomized) {
            return this.ev_to
        } else {
            return this.rand_ev_to
        }
    }

    getEvosFrom() {
        if(!this.is_randomized) {
            return this.ev_from
        } else {
            return this.rand_ev_froms
        }
    }

    getRevealedEvosFrom() {
        if(!this.is_randomized) {
            return this.ev_from?[this.ev_from]:[]
        } else {
            return this.revealed_ev_from_idxs.map( i => this.rand_ev_froms[i])//this.rand_ev_froms
        }
    }

    reveal_evolutions() {
        for(let i = 0; i < this.rand_ev_to.length; i++) {
            if(!this.revealed_ev_to_idxs.includes(i))
                this.revealed_ev_to_idxs.push(i);
        }
        for(let i = 0; i < this.rand_ev_froms.length; i++) {
            if(!this.revealed_ev_from_idxs.includes(i))
                this.revealed_ev_from_idxs.push(i);
        }
    }

    hide_evolutions() {
        this.revealed_ev_to_idxs = [];
        this.revealed_ev_from_idxs = [];
    }

}

function string_to_list(str) {

    let elements = str.replace(/[\]\[']/g,"")
            // .replace(/\[/g,"")
            // .replace(/\'/g, "")
            .trim()
            .split(",");



    return elements.map(d => d.trim()).filter(d => d.length !== 0 )
}