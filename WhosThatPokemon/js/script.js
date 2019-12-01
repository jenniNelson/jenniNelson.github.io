

loadData().then(poke_dict => {

    console.log(poke_dict)

    let card_manager = new CardManager();
    // let pokedex = new Pokedex(poke_dict, card_manager);
    let matchupview = new Matchups(poke_dict, card_manager);
    let mapview = new MapView(poke_dict, card_manager);

    let fancydex = new FancyDex(poke_dict, card_manager);

    card_manager.update_objects();

    // console.log(pokedex);


});


async function loadData() {
    let raw_pokemon = await loadFile("data/pokemon_data/main_collection.csv");

    let pokemon_dict = {};

    for (let mon of raw_pokemon) {
        pokemon_dict[mon.long_id] = new Pokemon(mon)
    }


//     locs = locs.reduce((accum_obj, item) => {
//         let loc_string = item.locations
//
//         let locs = loc_string.replace(/\]/g,"")
//                 .replace(/\[/g,"")
//                 .replace(/\'/g, "")
//                 .trim()
//                 .split(",");
//         // console.log(locs)
//         item.locations = locs.map( x => {
//             x = x.trim();
//             // console.log(x)
//             if (x.length > 0){
//                 let [game,map,place] = x.split('/')
//                 return {
//                     game: game,
//                     map: map,
//                     place: place,
//                     place_id : place.replace(' ', '_').replace('.', '')
//                 };
//             } else{
//                 return undefined;
//             }
//
// //                                                                []=> ''.split
//         }).filter(x => x !== undefined);
//
//         accum_obj[item.id] = item;
//
//         return accum_obj
//     }, {} );
//     return [pokemon, locs]
    return pokemon_dict
}

async function loadFile(file) {
    let data = await d3.csv(file);
    // .then(d => {
    //     let mapped = d.map(g => {
    //         for (let key in g) {
    //             let numKey = +key;
    //             if (numKey) {
    //                 g[key] = +g[key];
    //             }
    //         }
    //         return g;
    //     });
    //     return mapped;
    // });
    return data;
}

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

        this.callbacks = []
    }

    add_callback(callback){
        this.callbacks.push(callback)
    }

    update_pokemon(which_list, which_card, to_who, checkbox=null){
        // console.log(which_list, which_card, to_who, checkbox)
        if(which_list==="vs" || which_list==="#vs" || which_list==="pvp"){
            this.update_vs(which_card, to_who, checkbox)
        } else if(which_list==="team" || which_list==="#tb" ){
            this.update_team(which_card, to_who, checkbox)
        }
    }

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

    update_objects(cat, which_card, to_who){

        // console.log(this.team, this.vs, this.callbacks)
        console.log("YOOHOO", which_card)

        for (let cb of this.callbacks){
            cb(cat, which_card, to_who);
        }

    }

}

class Pokemon{
    constructor(csv_result) {
        this.name = csv_result.name;
        this.long_id = csv_result.long_id;

        this.stat_total = +csv_result.stat_total;  //ints for stats
        this.hp = +csv_result.hp;
        this.attack = +csv_result.attack;
        this.defense = +csv_result.defense;
        this.sp_attack = +csv_result.sp_attack;
        this.sp_defense = +csv_result.sp_defense;
        this.speed = +csv_result.speed;

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