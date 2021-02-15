// class DefaultDict {
//   constructor(defaultVal) {
//     return new Proxy({}, {
//       get: (target, name) => name in target ? target[name] : defaultVal
//     })
//   }
// }


function long_id_from_id(id){
    let long_id = "000" + id;
    return long_id.substr(long_id.length - 3);
}

class DataLoader {

    constructor(poke_dict, card_manager, matchup_panel, fancy_dex) {
        this.log_uploader_button = document.getElementById("rando_log_selector_worker");
        this.log_uploader_button.addEventListener("change", ev => this.read_new_log(ev.target.files[0]));
        this.save_uploader_button = document.getElementById("saved_state_selector_worker");
        this.save_uploader_button.addEventListener("change", ev => this.read_saved_state(ev.target.files[0]));
        this.save_button = document.getElementById("file_saver");
        this.save_button.addEventListener("click", ev => this.get_saved_state());
        this.spoil_toggle = true;
        this.spoil_me_button = document.getElementById("spoil_me");
        this.spoil_me_button.addEventListener("click", ev => this.spoil_me());
        this.poke_dict = poke_dict;
        this.card_manager = card_manager;
        this.fancy_dex = fancy_dex;
        this.matchup_panel = matchup_panel;

    }

    spoil_me(){
        if (this.spoil_toggle){

            for(let mon_id in this.poke_dict){
                this.poke_dict[mon_id].is_encountered = true;
                this.poke_dict[mon_id].is_stats_revealed = true;
                this.poke_dict[mon_id].reveal_evolutions();
            }
            this.spoil_me_button.value = "Un-Spoil Me";
            this.spoil_toggle = !this.spoil_toggle;

            let sorted = Object.values(this.poke_dict).sort( (a, b) => b.rand_ev_froms.length - a.rand_ev_froms.length);
            console.log(sorted[0])


        } else {
            for(let mon_id in this.poke_dict){
                this.poke_dict[mon_id].is_encountered = false;
                this.poke_dict[mon_id].is_stats_revealed = false;
                this.poke_dict[mon_id].hide_evolutions();
            }
            this.spoil_me_button.value = "Spoil Me";
            this.spoil_toggle = !this.spoil_toggle;
        }
        this.matchup_panel.refresh_panes();
        this.fancy_dex.update_post_randomize();

    }

    read_saved_state(file){
        let that = this;
        var reader = new FileReader();
        reader.onload = function(event) {
            let saved_state = JSON.parse(event.target.result);

            if(saved_state["pokemon"] == null || saved_state["team"] == null || saved_state["vs"] == null || saved_state["rando_mode"] == null || saved_state["individual_view"] == null){
                console.log("ERROR: Uploaded file could not be parsed as a saved state");
                return;
            }

            let parsed_poke_dict = {};
            for( let long_id in saved_state.pokemon){
                parsed_poke_dict[long_id] = ( Object.assign(new Pokemon, saved_state.pokemon[long_id]));

            }
            console.log(parsed_poke_dict);

            // Set all the data values
            that.card_manager.vs = saved_state.vs;
            that.card_manager.team = saved_state.team;
            that.card_manager.rando_mode = saved_state.rando_mode;
            that.matchup_panel.individual_view.mons = parsed_poke_dict;
            that.matchup_panel.poke_dict = parsed_poke_dict;
            that.matchup_panel.individual_view.current_mon = saved_state.individual_view;
            that.fancy_dex.pokemon_dict = parsed_poke_dict;
            that.poke_dict = parsed_poke_dict;


            // Refresh
            that.matchup_panel.refresh_panes();
            that.fancy_dex.update_post_randomize();
            that.spoil_me_button.style.display = "";


        };


        reader.readAsText(file);

    }

    download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    get_saved_state(){


        let save_obj = {
            pokemon: this.poke_dict,
            team: this.card_manager.team,
            vs: this.card_manager.vs,
            individual_view: this.matchup_panel.individual_view.current_mon,
            rando_mode: this.card_manager.rando_mode
        };


        let filename = "pokemern.pok";
        console.log(JSON.stringify(save_obj));
        this.download(filename, JSON.stringify(save_obj));

    }

    read_new_log(file) {
        this.card_manager.rando_mode=true;
        d3.select("#file_selector").attr("disabled", "disabled");

        console.log("###########I'm Here!#############");
        console.log(file);

        // this.dex["002"].attack = 200;
        this.poke_dict["002"].attack = 200;

        this.parse_log(file);

        this.spoil_me_button.style.display = "";

        //console.log(this.poke_dict);



    }

    parse_log(file) {
        let that = this;
        var reader = new FileReader();
        reader.onload = function(progressEvent){

            let stats_re = /(?<id>\d{1,3})\|\s*?(?<name>.*?)\s*?\|\s*?(?<type1>[A-Z]*?)(?:\s*?\/\s*?(?<type2>[A-Z]*?))?\s*?\|\s*?(?<hp>\d*?)\s*?\|\s*?(?<atk>\d*?)\s*?\|\s*?(?<def>\d*?)\s*?\|\s*?(?<spe>\d*?)\s*?\|\s*?(?<satk>\d*?)\s*?\|\s*?(?<sdef>\d*?)\s*?\|\s*?(?<ability1>.*?)\s*?\|\s*?(?<ability2>.*?)\s*?\|\s*?(?<item>.*?)/;
            // let evolves_re = /(?<from>[A-Z]*?) now evolves into (?<togroup>[A-Z, \d:]*)(?:and (?<lastto>[A-Z, \d:]*))?/;

            let soulsilver_locs = 'Route \d\d?|New Bark Town|Cherrygrove City|Violet City|Sprout Tower|Ruins of Alph|Union Cave|SLOWPOKE|Ilex Forest|National Park|Ecruteak City|Burned Tower|Bell Tower|Olivine City|Whirl Islands|Cianwood City|Mt\. Mortar|Ice Path|Blackthorn City|Dragon’s Den|Dark Cave|Seafoam Islands|Mt\. Silver Cave|Cliff Edge Gat|Cliff Cave|Bell Tower|Mt\. Silver|Safari Zone|Pallet Town|Viridian City|Cerulean City|Vermilion City|Celadon City|Fuchsia City|Cinnabar Island|Mt\. Moon|Rock Tunnel|Victory Road|Tohjo Falls|DIGLETT’s Cave|Victory Road|Viridian Forest|Cerulean Cave|Bug Catching Contest'

            let loc_strings = [soulsilver_locs];
            let all_locs = loc_strings.map((loc_str) => `(?:${loc_str})`).join('|');
            let loc_re = new RegExp("Set #(?<num>\d{1,3}) - (?<place>"+ all_locs + ") (?<method>.*?) \(rate=(?<rate>\d\d?)\) - (?<allmon>.*)");

            let mode = "blankspace";
            let lines = this.result.split(/\r?\n/);
            for(let i = 0; i < lines.length; i++){
                let line = lines[i];
                // console.log(line == "--Pokemon Base Stats & Types--" || line =="--Pokemon Base Stats & Types--\n");
                if (line === "--Pokemon Base Stats & Types--") {
                    mode = "stats";
                    continue;
                }
                else if (line === "--Randomized Evolutions--") {
                    mode = "evolutions";
                    continue;
                }
                else if (line === "--Wild Pokemon--") {
                    mode = "locations";
                    continue;
                }
                // else if (line === "Move Data: Unchanged."){
                //     moves = None
                // }
                // else if (line === "Pokemon Movesets: Unchanged."){}
                else if (line === "") {
                    mode = "blankspace";
                    continue;
                }


                if (mode === "blankspace"){
                    continue;
                }

                else if (mode === "stats") {
                    console.log(line);
                    let match = stats_re.exec(line);
                    if (match) {
                        let pokemon = that.add_rando_stats_to_pokemon_from_match(match);
                        // pokedex[pokemon.name] = pokemon;
                    }
                }
                // else if (mode === "stats"){
                //     that.add_rando_stats_to_pokemon_from_line(line);
                // }

                // else if (mode === "evolutions"){
                //     let match = evolves_re.exec(line);
                //     if (match){
                //         let links = that.make_evolution_links_from_re_match(match);
                //         // for (let link in links){
                //         //     evolutions[link[0]].append(link[1]);
                //         // }
                //     }
                // }
                else if (mode === "evolutions"){
                    that.make_evolution_links_from_line(line);
                }

                // else if (mode === "locations"){
                //     let match = loc_re.exec(line);
                //     if (match){
                //         location = get_location_from_match(match);
                //         locations[location.name].append(location);
                //     }
                // }


            }

            that.matchup_panel.refresh_panes();
            that.fancy_dex.update_post_randomize();
        };
        reader.readAsText(file);

    }


    add_rando_stats_to_pokemon_from_match(match) {
        let poke = this.poke_dict[long_id_from_id(match.groups.id)];
        console.log(long_id_from_id(match.groups.id), poke);

        poke.rand_type1 = match.groups['type1'].toLowerCase();
        poke.rand_type2 = match.groups['type2'] ? match.groups['type2'].toLowerCase() : "" ;
        poke.rand_hp = parseInt(match.groups['hp']);
        poke.rand_attack = parseInt(match.groups['atk']);
        poke.rand_defense = parseInt(match.groups['def']);
        poke.rand_speed = parseInt(match.groups['spe']);
        poke.rand_sp_attack = parseInt(match.groups['satk']);
        poke.rand_sp_defense = parseInt(match.groups['sdef']);
        poke.rand_ability1 = match.groups['ability1'];
        poke.rand_ability2 = match.groups['ability2'];
        poke.rand_item = match.groups['item'];

        poke.rand_ev_froms = [];
        poke.is_randomized = true;

        if (poke.rand_ability2 === " -") {
            poke.rand_ability2 = null;
        }
        if (poke.rand_item === "") {
            poke.rand_item = null;
        }
    }

    make_evolution_links_from_re_match(match) {
        let start = match.groups['from'];
        let group1 = match.groups['togroup'];
        let lastto = match.groups['lastto'];
        let to = group1.split(',').map(x => x.trim());
        if (lastto) {
            to.append(lastto);
        }
        let to_ids = to.map(t => Object.values(this.poke_dict).find(x => x.name.toLowerCase() === t.toLowerCase()).long_id);


        let start_mon = Object.values(this.poke_dict).find(x => x.name.toLowerCase() === start.toLowerCase());
        start_mon.rand_ev_to = to_ids;
        for (let to_id of to_ids) {
            if (this.poke_dict[to_id].rand_ev_froms) {
                this.poke_dict[to_id].rand_ev_froms.push(start_mon.long_id);
            } else {
                this.poke_dict[to_id].rand_ev_froms = [start_mon.long_id];
            }
        }
    }


    make_evolution_links_from_line(line) {
        let namelist = line.split(/ now evolves into |, | and /);
        let start = namelist[0];
        let to = namelist.slice(1);
        let to_ids = to.map(t => Object.values(this.poke_dict).find(x => x.name.toLowerCase().replace(/[\u2019']/,"") === t.toLowerCase().replace(/[\u2019']/,"")).long_id);


        let start_mon = Object.values(this.poke_dict).find(x => x.name.toLowerCase().replace(/[\u2019']/,"") === start.toLowerCase().replace(/[\u2019']/,""));
        start_mon.rand_ev_to = to_ids;
        for (let to_id of to_ids) {
            if (this.poke_dict[to_id].rand_ev_froms) {
                this.poke_dict[to_id].rand_ev_froms.push(start_mon.long_id);
            } else {
                this.poke_dict[to_id].rand_ev_froms = [start_mon.long_id];
            }
        }
    }





}

