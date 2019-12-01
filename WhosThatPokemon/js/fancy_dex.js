
let stat_bar_colors = [
            "#ff4f4a",
            "#ff9529",
            "#fffa39",
            "#889bff",
            "#6cff8c",
            "#ff77e8"
        ];

class FancyDex {

    constructor(pokemon, card_manager) {
        let that = this;
        let checked_anything = function(data){
            let sum = 0;
            for(let v of Object.values(data.vs)){
                sum += v? 1:0
            }
            for(let v of Object.values(data.team)){
                sum += v? 1:0
            }
            return sum > 0
        };

        let update_selected = function(){
            // Only change that which might need unchecking, and that which might need checking
            let selected = that.fancydex.searchData(checked_anything)
                .concat(that.fancydex.searchData("long_id", "in", Object.values(card_manager.team) ),
                    that.fancydex.searchData("long_id", "in", Object.values(card_manager.vs) ));

            for (let select of selected) {
                let team = {};
                for (let i of [0, 1, 2, 3, 4, 5]) {
                    team[i] = card_manager.team[i] === select.long_id;
                }
                that.fancydex.updateData([{
                    long_id: select.long_id,
                    vs: {0: card_manager.vs[0] === select.long_id, 1: card_manager.vs[1] === select.long_id},
                    team: team
                }])
            }

        }

        this.card_manager = card_manager;
        this.card_manager.add_callback(update_selected);
        // this.pokemon = pokemon;

        pokemon = Object.values(pokemon)
        this.max_stat_total = d3.max(pokemon.map(p => p.stat_total));
        this.max_hp = d3.max(pokemon.map(p=>p.hp));
        this.max_attack = d3.max(pokemon.map(p=>p.attack));
        this.max_defense = d3.max(pokemon.map(p=>p.defense));
        this.max_sp_attack = d3.max(pokemon.map(p=>p.sp_attack));
        this.max_sp_defense = d3.max(pokemon.map(p=>p.sp_defense));
        this.max_speed = d3.max(pokemon.map(p=>p.speed));

        this.pokemon = pokemon
            .map((p) => {
            let team = {};
            for (let i of [0, 1, 2, 3, 4, 5]) {
                team[i] = card_manager.vs[i] === p.long_id;
            }
            let newp = {
                name : p.name,
                long_id : p.long_id,
                stat_total : p.stat_total,
                hp : p.hp,
                attack : p.attack,
                defense : p.defense,
                sp_attack : p.sp_attack,
                sp_defense : p.sp_defense,
                speed : p.speed,
                type1 : p.type1,
                type2 : p.type2,
                ev_from : p.ev_from,
                ev_to : p.ev_to,
                is_base : p.is_base,
                is_full_ev : p.is_full_ev,
                evo_family : p.evo_family,
                capture_rate : p.capture_rate,
                gen_introduced : p.gen_introduced,
                is_legendary : p.is_legendary,
                height_m : p.height_m,
                weight_kg : p.weight_kg,
                locations : p.locations,

                perc_stat_total : 100* p.stat_total / this.max_stat_total,
                perc_hp : 100* p.hp / this.max_hp,
                perc_attack : 100* p.attack / this.max_attack,
                perc_defense : 100* p.defense / this.max_defense,
                perc_sp_attack : 100* p.sp_attack / this.max_sp_attack,
                perc_sp_defense : 100* p.sp_defense / this.max_sp_defense,
                perc_speed : 100* p.speed / this.max_speed,

                vs : { 0: card_manager.vs[0]===p.long_id, 1: card_manager.vs[1]===p.long_id},
                team: team
            };
            return newp;
        });

        console.log(this.pokemon)


        this.initialize_table();
    }


    initialize_table(){
        let that = this;

        let type_formatter = function(cell, formatterParams, onRendered){;
            if( cell.getValue() === "") {
                return "";
            }
            return "<img width='50' src='data/pokemon_data/typelabels/" + cell.getValue() + ".gif'>";
        }

        let make_vs_buttons = function (cell, formatterParams, onRendered) {
            let data = cell.getValue();
            let button1 = "<input type='checkbox' " + (data[0]?"checked":"") + "/>";
            let button2 = "<input type='checkbox' " + (data[1]?"checked":"") + "/>";
            return button1+button2;
        }
        let make_team_buttons = function (cell, formatterParams, onRendered) {
            let data = cell.getValue();
            // console.log("TEAM",data)
            let buttonrow1 = "";
            let buttonrow2 = "";
            for (let i of [0,1,2]){
                buttonrow1 +="<input type='checkbox' " + (data[i]?"checked":"") + "/>";
                buttonrow2 +="<input type='checkbox' " + (data[i+3]?"checked":"") + "/>";
            }
            return buttonrow1 + "<br\>" + buttonrow2;
        }

        let check_callback_vs = function(e, cell) {
            //e - the click event object
            //cell - cell component

            let chkboxes = d3.select(cell.getElement()).selectAll("input").nodes()
            // console.log(chkboxes[0].checked, chkboxes[1].checked)

            let old0 = cell.getValue()[0];
            let old1 = cell.getValue()[1];
            cell.getValue()[0] = chkboxes[0].checked;
            cell.getValue()[1] = chkboxes[1].checked;

            if (!old0 && chkboxes[0].checked){
                that.card_manager.update_vs(0, cell.getRow().getData().long_id)
            }
            if (old0 && !chkboxes[0].checked){
                that.card_manager.update_vs(0, null)
            }
            if (!old1 && chkboxes[1].checked){
                that.card_manager.update_vs(1, cell.getRow().getData().long_id)
            }
            if (old1 && !chkboxes[1].checked){
                that.card_manager.update_vs(1, null)
            }
        }

        let check_callback_team = function(e, cell) {
            //e - the click event object
            //cell - cell component

            let chkboxes = d3.select(cell.getElement()).selectAll("input").nodes()
            // console.log(chkboxes)

            console.log("CHECKS:",chkboxes.map((x) => x.checked))

            let old = []
            for (let i of [0,1,2,3,4,5]){
                old.push(cell.getValue()[i]);
                cell.getValue()[i] = chkboxes[i].checked;
            }


            for (let i of [0,1,2,3,4,5]){
                if (!old[i] && chkboxes[i].checked){
                    that.card_manager.update_team(i, cell.getRow().getData().long_id)
                }
                if (old[i] && !chkboxes[i].checked){
                    that.card_manager.update_team(i, null)
                }

            }
        }

        let check_sorter = function(a, b, aRow, bRow, column, dir, sorterParams){
            // console.log(a,b)
            let suma = 0;
            for(let v of Object.values(a)){
                suma += v? 1:0
            }
            let sumb = 0;
            for(let v of Object.values(b)){
                sumb += v? 1:0
            }
            return sumb-suma;
        }

        // let stat_filter = function(MAX, headerValue, rowValue, rowData, filterParams){
        //     console.log(MAX, headerValue, rowValue)
        //     return headerValue*100/MAX >= rowValue
        // }

        this.fancydex = new Tabulator("#fancydex", {
            height: 600,
            index:"long_id",
            responsiveLayout:"hide",
            data: this.pokemon,
            layout: "fitColumns",
            // autoColumns:true
            initialSort:[{column:"long_id", dir:"asc"}],
            columns: [
                {title:"Vs", field:"vs", width:48, dataLoaded:make_vs_buttons, formatter:make_vs_buttons, cellClick:check_callback_vs, sorter:check_sorter}
                ,
                {title:"TB", field:"team", width:66,formatter:make_team_buttons, cellClick:check_callback_team, sorter:check_sorter}
                ,
                {title:"#", field:"long_id", sorter:"number", width:20}
                ,
                {title:"Name", field:"name", widthGrow:2}
                ,
                {title:"Base Stats", field:"perc_stat_total", width:75, formatter:"progress", formatterParams:{color:"#b1b1b1", legend:(x)=>"&nbsp;&nbsp;"+(x*this.max_stat_total/100).toFixed(0), legendAlign:'left'}}
                ,
                {title:"HP", field:"perc_hp", align:"left", width:75, formatter:"progress", formatterParams:{color:stat_bar_colors[0], legend:(x)=>"&nbsp;&nbsp;"+(x*this.max_hp/100).toFixed(0), legendAlign:'left'}}
                ,
                {title:"Atk", field:"perc_attack", align:"left", width:75, formatter:"progress", formatterParams:{color:stat_bar_colors[1], legend:(x)=>"&nbsp;&nbsp;"+(x*this.max_attack/100).toFixed(0), legendAlign:'left'}}
                ,
                {title:"Def", field:"perc_defense", align:"left", width:75, formatter:"progress", formatterParams:{color:stat_bar_colors[2], legend:(x)=>"&nbsp;&nbsp;"+(x*this.max_defense/100).toFixed(0), legendAlign:'left'}}
                ,
                {title:"S.Atk", field:"perc_sp_attack", align:"left", width:75, formatter:"progress", formatterParams:{color:stat_bar_colors[3], legend:(x)=>"&nbsp;&nbsp;"+(x*this.max_sp_attack/100).toFixed(0), legendAlign:'left'}}
                ,
                {title:"S.Def", field:"perc_sp_defense", align:"left", width:75, formatter:"progress", formatterParams:{color:stat_bar_colors[4], legend:(x)=>"&nbsp;&nbsp;"+(x*this.max_sp_defense/100).toFixed(0), legendAlign:'left'}}
                ,
                {title:"Spd", field:"perc_speed", align:"left", width:75, formatter:"progress", formatterParams:{color:stat_bar_colors[5], legend:(x)=>"&nbsp;&nbsp;"+(x*this.max_speed/100).toFixed(0), legendAlign:'left'}}
                ,
                {title:"T1", field:"type1", width:57, formatter:type_formatter}
                ,
                {title:"T2", field:"type2", width:57, formatter:type_formatter}
                ,
                {title:"Gen", field:"gen_introduced", align:'center'}
            ]
        });

        let filtered_types = [];
        let type_filters = function(data, filterParams){
            if(filtered_types.length === 0){
                return true
            }
            let in_something = filtered_types.includes(data.type1) || filtered_types.includes(data.type2)
            // console.log(in_something)
            return in_something
        }


        let filter_type = function(type){
            console.log("Filter",type)
            d3.select("#filter_"+type)
                .classed("filter_select", true)
            if(! filtered_types.includes(type)){
                filtered_types.push(type)
            }
            console.log("Filtering", filtered_types)
            that.fancydex.addFilter(type_filters)
        }
        let clear_type_filter = function(type){

            console.log("Clear filter",type)
            d3.select("#filter_"+type)
                .classed("filter_select", false)
            let index = filtered_types.indexOf(type);
            if (index !== -1) filtered_types.splice(index, 1);
            console.log("Filtering", filtered_types)
            if(filtered_types.length ===0){
                that.fancydex.removeFilter(type_filters)
            } else{
                // Refresh the data to make it re-filter
                that.fancydex.setData(that.pokemon)
            }
        }
        let clear_type_filters = function(){
            console.log("Clear type filters")
            d3.selectAll(".type_filter")
                .classed("filter_select", false)
            filtered_types = [];
            that.fancydex.removeFilter(type_filters)
        }



        let table_controls = d3.select("#table_controls").append("table")
        let row1 = table_controls.append("tr")
        let row2 = table_controls.append("tr")
        let row3 = table_controls.append("tr")

        let row1_types = ["bug", "dark", "dragon", "electric", "fairy", "fighting"]
        let row2_types = ["fire", "flying", "ghost", "grass", "ground", "ice"]
        let row3_types = [ "normal", "poison", "psychic", "rock", "steel", "water"]

        // let typebox = row1.selectAll("td").data(row1_types).join("td")
        // typebox.append("img")
        //     .attr("src",d => "data/pokemon_data/typelabels/"+ d + ".gif")
        //     .attr("width", 50)
        // typebox.append("td").append("button")
        //     .text("x")
        //     // .attr("style", "display:inline-block")
        for (let [row, types] of [[row1,row1_types],[row2,row2_types],[row3,row3_types]]){
            for (let type of types){
                let svg = row.append("td").append("svg").classed("filter_button", true)
                    .attr("id", "filter_"+type)
                    .classed("type_filter", true)
                    .attr("width", 75)
                    .attr("height", 20)
                svg.append("rect")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("rx", 7)
                    .classed("svg_background", true);
                svg.append("image")
                    .attr("href","data/pokemon_data/typelabels/"+ type + ".gif")
                    .attr("width", 50)
                    .on("click", ()=> filter_type(type))
                svg.append("image")
                    .attr("href","data/x-icon.png")
                    .attr("width", 19)
                    .attr("x", 52)
                    .attr("y", 0)
                    .on("click", ()=> clear_type_filter(type))

            }
        }

        let clear_type_filter_button = row1.append("td")
            .attr("rowspan", 3)
            .append("svg").classed("filter_button", true)
            .attr("width", 20)
            .attr("height", 60)
            .on("click", clear_type_filters)
        clear_type_filter_button.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        clear_type_filter_button.append("image")
            .attr("href","data/x-icon.png")
            .attr("width", 19)
            .attr("x", 0)
            .attr("y", 20)


        row1.append("td").attr("rowspan",3).attr("width", 10)


        let filter_gens = []
        let gen_filter = function(data){
            if(filter_gens.length == 0){
                return true;
            } else {
                return filter_gens.includes(+data.gen_introduced)
            }
        }

        that.fancydex.addFilter(gen_filter)

        let toggle_gen_filter = function(gen){
            // Un-filter
            if(filter_gens.includes(gen)){
                d3.select("#gen_filter_"+gen)
                    .classed("filter_select", false)

                let index = filter_gens.indexOf(gen);
                if (index !== -1) filter_gens.splice(index, 1);
                // console.log("Filtering", filter_gens)
            } else{ // Filter
                console.log("Filter",gen);
                d3.select("#gen_filter_"+gen)
                    .classed("filter_select", true)
                if(! filter_gens.includes(gen)){
                    filter_gens.push(gen)
                }
                // console.log("Filtering", filter_gens)
            }

            // Refresh the data to make it re-filter
            that.fancydex.setData(that.pokemon)
        }
        let clear_gen_filters = function(){
            d3.selectAll(".gen_filter")
                .classed("filter_select", false)
            filter_gens = [];

            that.fancydex.setData(that.pokemon)
        }

        for (let [row, gens] of [[row1,[1,2,3]],[row2,[4,5,6]],[row3,[7]]]){
            for (let gen of gens){
                let svg = row.append("td").append("svg").classed("filter_button", true)
                    .attr("id", "gen_filter_"+gen)
                    .classed("gen_filter", true)
                    .attr("width", 20)
                    .attr("height", 20)
                    .on("click",() => toggle_gen_filter(gen))
                svg.append("rect")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("rx", 7)
                    .classed("svg_background", true)
                svg.append("text")
                    .attr("x","50%")
                    .attr("y","55%")
                    .attr("dominant-baseline","middle")
                    .attr("text-anchor","middle")
                    .text(gen)
            }
        }

        let clear_gen_filter_button = row3.append("td")
            .attr("colspan", 2)
            .append("svg").classed("filter_button", true)
            .attr("width", 40)
            .attr("height", 20)
            .on("click", clear_gen_filters)
        clear_gen_filter_button.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        clear_gen_filter_button.append("image")
            .attr("href","data/x-icon.png")
            .attr("width", 19)
            .attr("x", 10)
            .attr("y", 0)


        row1.append("td").attr("rowspan",3).attr("width", 10)


        let filter_final_ev = false;
        let filter_base_ev = false;

        let filter_evs = function(data){
            if(!filter_final_ev && !filter_base_ev){
                return true
            }
            if( filter_final_ev &&  filter_base_ev){
                return data.is_full_ev==1 || data.is_base==1;
            }
            if(!filter_final_ev &&  filter_base_ev){
                return data.is_base==1;
            }
            if( filter_final_ev && !filter_base_ev){
                return data.is_full_ev==1;
            }
        };
        this.fancydex.addFilter(filter_evs)

        let filter_final = function(){
            filter_final_ev = true;
            d3.select("#final_ev_filter")
                .classed("filter_select", true)
            // Refresh the data to make it re-filter
            that.fancydex.setData(that.pokemon)
        }
        let filter_base = function(){
            filter_base_ev = true;
            d3.select("#base_ev_filter")
                .classed("filter_select", true)
            // Refresh the data to make it re-filter
            that.fancydex.setData(that.pokemon)
        }
        let clear_filter_final = function(){
            filter_final_ev = false;
            d3.select("#final_ev_filter")
                .classed("filter_select", false)
            // Refresh the data to make it re-filter
            that.fancydex.setData(that.pokemon)
        }
        let clear_filter_base = function(){
            filter_base_ev = false;
            d3.select("#base_ev_filter")
                .classed("filter_select", false)
            // Refresh the data to make it re-filter
            that.fancydex.setData(that.pokemon)
        }

        let clear_ev_filter = function(){
            filter_final_ev = false;
            filter_base_ev = false;
            d3.select("#final_ev_filter")
                .classed("filter_select", false)
            d3.select("#base_ev_filter")
                .classed("filter_select", false)
            // Refresh the data to make it re-filter
            that.fancydex.setData(that.pokemon)
        }

        let is_final_ev = row1.append("td")
            .append("svg").classed("filter_button", true)
            .attr("width", 90)
            .attr("height", 20)
            .attr("id", "final_ev_filter")
        is_final_ev.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        is_final_ev.append("text")
            .attr("x","3%")
            .attr("y","55%")
            .attr("dominant-baseline","middle")
            .text("Final Evol.")
            .on("click", filter_final)
        is_final_ev.append("image")
            .attr("href","data/x-icon.png")
            .attr("width", 19)
            .attr("x", 68)
            .attr("y", 0)
            .on("click", clear_filter_final)


        let is_base_ev = row2.append("td")
            .append("svg").classed("filter_button", true)
            .attr("width", 90)
            .attr("height", 20)
            .attr("id", "base_ev_filter")
        is_base_ev.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        is_base_ev.append("text")
            .attr("x","3%")
            .attr("y","55%")
            .attr("dominant-baseline","middle")
            // .attr("text-anchor","middle")
            .text("Base Evol.")
            .on("click", filter_base)
        is_base_ev.append("image")
            .attr("href","data/x-icon.png")
            .attr("width", 19)
            .attr("x", 68)
            .attr("y", 0)
            .on("click", clear_filter_base)


        let clear_ev = row3.append("td")
            .append("svg").classed("filter_button", true)
            .attr("width", 90)
            .attr("height", 20)
            .on("click", clear_ev_filter)
        clear_ev.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        clear_ev.append("image")
            .attr("href","data/x-icon.png")
            .attr("width", 19)
            .attr("transform", "translate(-9.5,0)")
            .attr("x", "50%")
            .attr("y", 0)



        row1.append("td").attr("rowspan",3).attr("width", 10)



        let legendary_val = null;
        let legendary_filter = function(data){
            if(legendary_val === null){
                return true
            }
            if(legendary_val){
                return data.is_legendary==1
            } else{
                return data.is_legendary!=1
            }
        }
        this.fancydex.addFilter(legendary_filter)
        let toggle_legendary_filter = function(which){
            // Clear filter
            if(which == null){
                legendary_val = null;
                d3.select("#is_legend_filter").classed("filter_select", false)
                d3.select("#is_not_legend_filter").classed("filter_select", false)
            }
            // Show Legendaries
            else if(which){
                legendary_val = true;
                d3.select("#is_legend_filter").classed("filter_select", true)
                d3.select("#is_not_legend_filter").classed("filter_select", false)
            }
            // Show not Legendaries
            else if(!which){
                legendary_val = false;
                d3.select("#is_legend_filter").classed("filter_select", false)
                d3.select("#is_not_legend_filter").classed("filter_select", true)
            }
            that.fancydex.setData(that.pokemon)
        }

        let is_legend = row1.append("td")
            .append("svg").classed("filter_button", true)
            .attr("width", 90)
            .attr("height", 20)
            .attr("id", "is_legend_filter")
        is_legend.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        is_legend.append("text")
            .attr("x","3%")
            .attr("y","55%")
            .attr("dominant-baseline","middle")
            .text("Legendaries")
            .on("click", ()=>toggle_legendary_filter(true))


        let is_not_legend = row2.append("td")
            .append("svg").classed("filter_button", true)
            .attr("width", 90)
            .attr("height", 20)
            .attr("id", "is_not_legend_filter")
        is_not_legend.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        is_not_legend.append("text")
            .attr("x","3%")
            .attr("y","55%")
            .attr("dominant-baseline","middle")
            .text("Not Legend.")
            .on("click", () => toggle_legendary_filter(false))

        let clear_legendary_filter = row3.append("td")
            .append("svg").classed("filter_button", true)
            .attr("width", 90)
            .attr("height", 20)
            .on("click", ()=>toggle_legendary_filter(null))
        clear_legendary_filter.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        clear_legendary_filter.append("image")
            .attr("href","data/x-icon.png")
            .attr("width", 19)
            .attr("transform", "translate(-9.5,0)")
            .attr("x", "50%")
            .attr("y", 0)



        row1.append("td").attr("rowspan",3).attr("width", 10)



        let clear_all_filters = function(){
            toggle_legendary_filter(null)
            clear_gen_filters()
            clear_type_filters()
            clear_ev_filter()
        }


        let clear_all_button = row1.append("td")
            .attr("rowspan", 3)
            .append("svg").classed("filter_button", true)
            .attr("width", 80)
            .attr("height", 60)
            .on("click", clear_all_filters)
        clear_all_button.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("rx", 7)
            .classed("svg_background", true);
        clear_all_button.append("text")
            .attr("x","50%")
            .attr("y","30%")
            .attr("dominant-baseline","middle")
            .attr("text-anchor","middle")
            .text("Clear All")
        clear_all_button.append("image")
            .attr("href","data/x-icon.png")
            .attr("width", 19)
            .attr("transform", "translate(-9.5,-9.5)")
            .attr("x", "50%")
            .attr("y", "70%")



    }

}