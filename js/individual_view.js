class IndividualView {
    constructor(card_manager, mons_dict, mon_id) {

        this.card_manager = card_manager;
        this.current_mon = mon_id;
        this.mons = mons_dict;

        this.type_colors = {
            "fire" : ["#ff6966","#9b1414"],
            "water" : ["#6765ff","#3b3e9b"],
            "grass" : ["#84d472","#359b21"],
            "bug" : ["#83ff78","#4fb525"],
            "ground" : ["#ffae35","#9b772f"],
            "rock" : ["#ff6f40","#9b6145"],
            "steel" : ["#c0b4b6","#726a6a"],
            "fairy" : ["#ffadc7","#9b1e44"],
            "dark" : ["#686766","#3e3b39"],
            "psychic" : ["#ffbde0","#9b4e90"],
            "ghost" : ["#e486ff","#8d689b"],
            "poison" : ["#bf68bb","#755671"],
            "dragon" : ["#9782ff","#71669b"],
            "ice" : ["#bafff6","#647c9b"],
            "flying" : ["#aaa5ff","#668d9b"],
            "normal" : ["#f2ffb8","#9b996d"],
            "fighting" : ["#ff9a78","#9b532f"],
            "electric" : ["#ffffa3","#c8c24a"],
            "missing" : ["#505050", "#0c0c0c"]
        };

        //array of colors for each different stat
        this.stat_bar_colors = [
            "#ff4f4a",
            "#ff9529",
            "#fffa39",
            "#889bff",
            "#6cff8c",
            "#ff77e8"
        ];

        //Scales for charts
        // TODO: These sizes need to be adjusted
        this.stat_scale =d3.scaleLinear().domain([0,250]).range([0,250]);
        this.stat_axis = d3.axisBottom(this.stat_scale).tickSize(100).ticks(5);

        this.pallet = d3.select("#individual_view_pane")
            .append("svg")
            .attr("id", "iv_svg")
            .attr("width", 900)
            .attr("height", 810);
    }

    update(mon_id) {
        console.log("Hello! " + mon_id);
        this.current_mon = mon_id;
        $("#iv_dd").val(mon_id).trigger("change");
        this.drawPanel();
    }

    follow_evolution_to(idx) {
        console.log("HUU");
        console.log(this.current_mon);
        let curr_mon = this.mons[this.current_mon];
        let dest_mon_id = curr_mon.getEvosTo()[idx];
        if(!dest_mon_id) return;
        let dest_mon = this.mons[dest_mon_id];
        if(curr_mon.is_randomized && !curr_mon.revealed_ev_to_idxs.includes(idx)) {
            curr_mon.revealed_ev_to_idxs.push(idx);
            let idx_of_mon_in_dest_list = dest_mon.getEvosFrom().indexOf(curr_mon.long_id);
            dest_mon.revealed_ev_from_idxs.push(idx_of_mon_in_dest_list);

            //Jury's out on this line
            // dest_mon.is_stats_revealed = true;
        }

        this.card_manager.update_objects("iv", 0, dest_mon.long_id);

    }

    follow_evolution_from(idx) {
        let dest_id=this.mons[this.current_mon].getRevealedEvosFrom()[idx];
        console.log(idx)
        console.log(this.mons[this.current_mon].getRevealedEvosFrom());
        console.log(dest_id);
        let dest_mon = this.mons[this.mons[this.current_mon].getRevealedEvosFrom()[idx]];
        this.card_manager.update_objects("iv", 0, dest_mon.long_id);

    }

    drawPanel() {
        let that = this;
        let stat_labels = ["hp","atk","def","s.a.", "s.d.", "spd"];
        this.pallet.select("g").remove();
        let main_group = this.pallet.append("g");

        let mon = this.mons[this.current_mon];
        if(!mon)
            mon = missingno;

        main_group
            .append("rect")
            .attr("x", 10)
            .attr("y", 10)
            .attr("width", 880)
            .attr("height", 790)
            .attr("rx", 10)
            .attr("fill", this.type_colors[mon.getType()[0]][0]);

        let image_group = main_group.append("g")
            .attr("transform", "translate(100, 50), scale(2, 2)");

        image_group.append("circle")
            .attr("cx", 60)
            .attr("cy", 60)
            .attr("r", 50)
            .attr("fill", this.type_colors[mon.getType()[0]][1]);

        image_group.append("image")
            .attr("href","data/pokemon_data/sprites/" + mon.long_id + ".png")
            .attr("x", 10)
            .attr("y", 10)
            .attr("height", 100)
            .attr("width", 100);

        //Image

        let chart_group = main_group.append("g")
            .attr("transform", "translate(370, 80) scale(1.3,1.3)");

        chart_group.append("rect")
            .attr("x", -5)
            .attr("y", 0)
            .attr("width", 300)
            .attr("height", 130)
            .attr('rx', 10)
            .attr("fill", "#fff8d6")
            .attr("stroke", this.type_colors[mon.getType()[0]][1])
            .attr("stroke-width", "3pt");

        let chart_interior = chart_group.append("g")
            .attr("transform", "translate(10, 7)");

        chart_interior.selectAll("rect").data(mon.getStats())//[mon.hp, mon.attack, mon.defense, mon.sp_attack, mon.sp_defense, mon.speed])
            .join("rect")
            .attr("x", 20)
            .attr("y", (d,i) => 17*i)
            .attr("width", d => d)
            .attr("height", 13)
            .attr("fill", (d,i) => this.stat_bar_colors[i]);

        chart_interior.append("g")
            .selectAll("text").data(mon.getStats())//[mon.hp, mon.attack, mon.defense, mon.sp_attack, mon.sp_defense, mon.speed]).join("text")
            .join("text")
            .text(d => d)
            .attr("x", 23)
            .attr("y", (d,i)=>12 + 17*i);

        chart_interior.append("g")
            .selectAll("text").data(stat_labels).join("text")
            .text(d=>d)
            .attr("x", 17)
            .attr("y", (d,i) => 12 + 17*i)
            .attr("text-anchor", "end");
        chart_interior.append("g")
            .attr("transform", "translate(20,0)")
            .call(this.stat_axis).call(g=>g.select(".domain").remove());
        chart_interior.append("text")
            .attr("x", 0)
            .attr("y", 135)
            .style("font-weight", "bold")
            .style("font-size", "12px")
            .text("TOTAL STATS: " + mon.getStatTotal());

        //TODO: Get a chart. Horizontal.

        let info_group = main_group.append("g")
            .attr("transform", "translate(" + (180  - (mon.getType()[1] ?  30: 0)) + ", 300)");

        if(mon.getType()[0] !== "missing") {
            info_group.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 80 + (mon.getType()[1] ?  60: 0))
                .attr("height", 30)
                .attr("fill", this.type_colors[mon.getType()[0]][1])
                .attr("rx", 10);
        }

        let type_group = info_group.append("g")
            .attr("x", 0)
            .attr("y", 0);

        type_group.selectAll("image").data(mon.getType().filter(x => x && x !== "missing"))
            .join("image")
            .attr("x", (d,i) => 15 + i*60 )
            .attr("y", 5)
            .attr("width", 50)
            .attr("height", 20)
            .attr("href", d => "data/pokemon_data/typelabels/" + d + ".gif");

        info_group.append("rect")
            .attr("x", 200)
            .attr("y", 0)
            .attr("width", 320)
            .attr("height", 200)
            .attr("stroke", this.type_colors[mon.getType()[0]][1])
            .style("stroke-width", "4px")
            .attr("fill", "none")
            .attr("rx", 10);

        info_group.append("text")
            .attr("x", 212)
            .attr("y", 100)
            .style("font-weight", "800")
            .style("text-decoration", "underline")
            .style("font-size", "18px")
            .text("Height:");

        info_group.append("text")
            .attr("x", 220)
            .attr("y", 126)
            .text((mon.height_m ? mon.height_m : "???") + " m")
            .style("font-size", "13pt");

        info_group.append("text")
            .attr("x", 212)
            .attr("y", 150)
            .style("font-weight", "800")
            .style("text-decoration", "underline")
            .style("font-size", "18px")
            .text("Weight:");

        info_group.append("text")
            .attr("x", 220)
            .attr("y", 176)
            .text((mon.weight_kg ? mon.weight_kg : "???") + " kg")
            .style("font-size", "13pt");

        info_group.append("text")
            .attr("x", 212)
            .attr("y", 22)
            .style("font-weight", "800")
            .style("text-decoration", "underline")
            .style("font-size", "18px")
            .text("Abilities:");

        info_group.append("text")
            .attr("x", 220)
            .attr("y", 50)
            .text(mon.getAbilities()[0])
            .style("font-size", "13pt");
        info_group.append("text")
            .attr("x", 220)
            .attr("y", 70)
            .text(mon.getAbilities()[1])
            .style("font-size", "13pt");

        //TODO: Types, Abilities (only first 2), Height, Weight

        let ev_to_group = main_group.append("g")
            .attr("transform", "translate(800, 100)");
        let cradius = 20;
        let c_v_offset = 50;
        //This is where the fun begins
        let vanilla_evos = mon.ev_to.map(id => that.mons[id]);
        console.log(mon.getEvosTo().length);
        ev_to_group.selectAll("circle").data(vanilla_evos.slice(0, mon.getEvosTo().length))
            .join("circle")
            .attr("r", cradius)
            .attr("cy", (d, i) => cradius + i*c_v_offset)
            .attr("cx", cradius)
            .attr("fill", this.type_colors[mon.getType()[0]][1])
            .each( function(d,i) {
                d3.select(this)
                    .on("click", () => that.follow_evolution_to(i))
            })
            .append("title")
            .text((d,i) => (mon.is_randomized && !mon.revealed_ev_to_idxs.includes(i)) ? d.name + " evolution" : "");

        if(mon.is_randomized) {
            ev_to_group.selectAll("image").data(mon.revealed_ev_to_idxs)
                .join("image")
                .attr("href", d => "data/pokemon_data/sprites/" + mon.getEvosTo()[d] + ".png")
                .attr("x", 0)
                .attr("y", d => d*c_v_offset)
                .attr("width", 2*cradius)
                .attr("height", 2*cradius)
                .each( function(d){
                    d3.select(this)
                        .on("click", () => that.update(mon.getEvosTo()[d]))
                });
        } else {
            ev_to_group.selectAll("image").data(mon.ev_to)
                .join("image")
                .attr("href", d => "data/pokemon_data/sprites/" + d + ".png")
                .attr("x", 0)
                .attr("y", (d,i) => i*c_v_offset)
                .attr("width", 2*cradius)
                .attr("height", 2*cradius)
                .each( function(d){
                    d3.select(this)
                        .on("click", () => that.update(d))
                });
        }

        //TODO: typed circle, tooltip with vanilla evolution name unless it's revealed.

        let ev_from_group = main_group.append("g")
            .attr("transform", "translate(50, 100)");
        ev_from_group.selectAll("circle").data(mon.getRevealedEvosFrom())
            .join("circle")
            .attr("cx", cradius)
            .attr("cy", (d,i) => cradius + i*c_v_offset )
            .attr("r", cradius)
            .attr("fill", this.type_colors[mon.getType()[0]][1]);

        ev_from_group.selectAll("image").data(mon.getRevealedEvosFrom())
            .join("image")
            .attr("href", d => "data/pokemon_data/sprites/" + d + ".png")
            .attr("x", 0)
            .attr("y", (d,i) => i*c_v_offset)
            .attr("width", 2*cradius)
            .attr("height", 2*cradius)
            .each( function(d,i){
                d3.select(this)
                    .on("click", () => that.follow_evolution_from(i))
            });



        if(mon.is_randomized) {
            let rev_buttons_group = main_group.append("g")
            .attr("transform", "translate(400, 270)");

            rev_buttons_group.append("circle")
                .attr("cx", 10)
                .attr("cy", 10)
                .attr("r", 10)
                .attr("stroke", this.type_colors[mon.getType()[0]][1])
                .attr("fill", "none")
                .on("click", () => console.log("clicked"));//this.card_manager.update_pokemon(vs_or_tb, +card_id, prev_ev));


            rev_buttons_group.append("circle")
                .attr("cx", 10)
                .attr("cy", 10)
                .attr("r", 7)
                .attr("fill", (mon.is_encountered || mon.is_stats_revealed)?this.type_colors[mon.getType()[0]][1]:this.type_colors[mon.getType()[0]][0])
                .on("click", function() {
                    if(mon.is_stats_revealed){
                        mon.is_stats_revealed = false;
                        mon.is_encountered = false;
                    } else{
                        mon.is_encountered = !mon.is_encountered;
                    }
                    console.log(mon);
                    that.card_manager.update_objects('iv', 0, mon.long_id);
                });


            rev_buttons_group.append("text")
                .attr("x", 24)
                .attr("y", 15)
                .style("font-size", "10pt")
                .text("Encountered");

            rev_buttons_group.append("circle")
                .attr("cx", 150)
                .attr("cy", 10)
                .attr("r", 10)
                .attr("stroke", this.type_colors[mon.getType()[0]][1])
                .attr("fill", "none");


            rev_buttons_group.append("circle")
                .attr("cx", 150)
                .attr("cy", 10)
                .attr("r", 7)
                .attr("fill", mon.is_stats_revealed ? this.type_colors[mon.getType()[0]][1]: this.type_colors[mon.getType()[0]][0])
                .on("click", function() {
                    if (mon.is_stats_revealed){
                        mon.is_stats_revealed = false;
                    }else {
                        mon.is_stats_revealed = true;
                        mon.is_encountered = true;
                    }
                    that.card_manager.update_objects('iv', 0, mon.long_id)
                });


            rev_buttons_group.append("text")
                .attr("x", 164)
                .attr("y", 15)
                .style("font-size", "10pt")
                .text("Caught");
        }

        let weaknesses = getWeaknesses(mon);
        let resistances = getResistances(mon);
        let vert_buffer = 30;
        let horiz_buffer = 90;
        let cols = 5;
        let weak_rows = Math.max(1, Math.ceil(weaknesses.length / cols));
        let res_rows = Math.max(1, Math.ceil(resistances.length / cols));
        let min_zone_height = 15;
        let zone_buffer = 40;

        let type_effectiveness = main_group.append("g")
            .attr("transform", "translate(" + (880/2 - (20 + cols * horiz_buffer)/2) + ", 550)");

        if (!mon.is_randomized || mon.is_encountered || mon.is_stats_revealed) {
            type_effectiveness.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 20 + cols * horiz_buffer)
                .attr("height", min_zone_height + weak_rows * vert_buffer)
                .attr("fill", this.type_colors[mon.getType()[0]][1])
                .attr("rx", 10);

            let weak_group = type_effectiveness.append("g")
                .attr("transform", "translate(10, 10)");

            weak_group.append("text")
                .attr("x", 10)
                .attr("y", -15)
                .style("font-weight", "800")
                .style("text-decoration", "underline")
                .style("font-size", "20px")
                .text("WEAKNESSES    ");

            let weak_image_groups = weak_group.selectAll("g").data(weaknesses).join("g");
            weak_image_groups.append("image")
                .attr("x", (d, i) => (i%5) * horiz_buffer)
                .attr("y", (d, i) => Math.floor(i/5) * vert_buffer)
                .attr("height", 20)
                .attr("width", 80)
                .attr("href", d => "data/pokemon_data/typelabels/" + d.type + ".gif");
            weak_image_groups.append("text")
                .attr("x", (d, i) => (i%5) * horiz_buffer + 63)
                .attr("y", (d, i) => Math.floor(i/5) * vert_buffer + 20)
                .attr("style", "font: bold; paint-order: stroke; fill: white; font-size: 8pt; stroke-width:3px; stroke: black")
                .text(d => multiplierString(d.multiplier));

            type_effectiveness.append("rect")
                .attr("x", 0)
                .attr("y", min_zone_height + zone_buffer + weak_rows * vert_buffer)
                .attr("width", 20 + cols * horiz_buffer)
                .attr("height", 20 + res_rows * vert_buffer)
                .attr("fill", this.type_colors[mon.getType()[0]][1])
                .attr("rx", 10);

            let res_group = type_effectiveness.append("g")
                .attr("transform", "translate(10, " + (min_zone_height + zone_buffer + 10 + weak_rows * vert_buffer) +")");

            res_group.append("text")
                .attr("x", 10)
                .attr("y", -15)
                .style("font-weight", "800")
                .style("text-decoration", "underline")
                .style("font-size", "20px")
                .text("RESISTANCES");

            let res_image_groups = res_group.selectAll("g").data(resistances).join("g");
            res_image_groups.append("image")
                .attr("x", (d, i) => (i%5) * horiz_buffer)
                .attr("y", (d, i) => Math.floor(i/5) * vert_buffer)
                .attr("height", 20)
                .attr("width", 80)
                .attr("href", d => "data/pokemon_data/typelabels/" + d.type + ".gif");
            res_image_groups.append("text")
                .attr("x", (d, i) => (i%5) * horiz_buffer + 63)
                .attr("y", (d, i) => Math.floor(i/5) * vert_buffer + 20)
                .attr("style", "font: bold; paint-order: stroke; fill: white; font-size: 8pt; stroke-width: 3px; stroke: black")
                .text(d => multiplierString(d.multiplier));
        }

    }
}


function get_eff_multiplier(mon, type) {
    if( mon.getType()[0] === '' || mon.getType()[0] === 'missing'){
        return false;
    }
    let idx1 = types_to_idx[mon.getType()[0]];
    let atkidx = types_to_idx[type];
    if(mon.getType()[1] !== '' && mon.getType()[1] !== mon.getType()[0]) {
        let idx2 = types_to_idx[mon.getType()[1]];
        return matchups[atkidx][idx1] * matchups[atkidx][idx2];
    } else {
        return matchups[atkidx][idx1];
    }
}

function getWeaknesses(mon) {
    if(mon.long_id === "whodat")
        return [];
    let res = [];
    for(let type of idx_to_types) {
        let multiplier = get_eff_multiplier(mon, type);
        if(multiplier > 1)
            res.push({type: type, multiplier: multiplier})
    }
    return res;
}

function getResistances(mon) {
    if(mon.long_id === "whodat")
        return [];
    let res = [];
    for(let type of idx_to_types) {
        let multiplier = get_eff_multiplier(mon, type);
        if(multiplier < 1)
            res.push({type: type, multiplier: multiplier})
    }
    return res;
}

function multiplierString(mult) {
    if(mult === 4)
        return "x4";
    else if(mult === 2)
        return "x2";
    else if(mult === .5)
        return "x1/2";
    else if(mult === .25)
        return "x1/4";
    else if(mult === 0)
        return "x0";
    else
        return "x1";
}
