class Matchups{
    constructor(pokemon, card_manager) {

        let that = this;
        function update_pokemon(cat, pos, mon){
            if(mon !== undefined){
                console.log(cat, pos, mon);
                that.update_card(cat, pos, mon);
                that.update_summary(cat);
            }
            // that.initialize_cards();
        }
        this.card_manager = card_manager;
        this.card_manager.add_callback(update_pokemon);

        this.poke_dict = pokemon;
        this.mons = Object.values(pokemon).sort((a,b)=>+a.long_id - +b.long_id);
        this.mons.push(missingno);
        console.log(this.mons)

        this.current_view = "team";

        this.num_vs = 2;
        this.num_team = 6;

        this.type_colors = {
            "fire" : ["#ff4f4a","#9b1414"],
            "water" : ["#6765ff","#3b3e9b"],
            "grass" : ["#3cd41d","#359b21"],
            "bug" : ["#23ff10","#4fb525"],
            "ground" : ["#ffae35","#9b772f"],
            "rock" : ["#ff6f40","#9b6145"],
            "steel" : ["#c0b4b6","#726a6a"],
            "fairy" : ["#ff6090","#9b1e44"],
            "dark" : ["#686766","#3e3b39"],
            "psychic" : ["#ff89c7","#9b4e90"],
            "ghost" : ["#e486ff","#8d689b"],
            "poison" : ["#bf68bb","#755671"],
            "dragon" : ["#9782ff","#71669b"],
            "ice" : ["#88fff2","#647c9b"],
            "flying" : ["#aaa5ff","#668d9b"],
            "normal" : ["#f2ffb8","#9b996d"],
            "fighting" : ["#ff9a78","#9b532f"],
            "electric" : ["#ffff56","#c8c24a"],
            "missing" : ["#505050", "#0c0c0c"]
        };

        this.stat_bar_colors = [
            "#ff4f4a",
            "#ff9529",
            "#fffa39",
            "#889bff",
            "#6cff8c",
            "#ff77e8"
        ];

        this.stat_scale =d3.scaleLinear().domain([0,250]).range([0,250]);
        this.reverse_stat_scale = d3.scaleLinear().domain([0,250]).range([0,-375]);
        this.reverse_stat_axis = d3.axisLeft(this.reverse_stat_scale).tickSize(345).ticks(5);
        this.stat_axis = d3.axisBottom(this.stat_scale).tickSize(100).ticks(5);

        this.hp_bar_scale = d3.scaleLinear().domain([0,1]).range([0,300]);

        this.initialize_tabs();
        this.fill_dropdowns();
        this.initialize_cards();
        this.initialize_summaries();
    }

    initialize_tabs() {
        let that = this;
        d3.selectAll("#view_switcher .tablinks").data(["vs", "team"])
            .on("click", d=>that.switch_tabs(d));
        d3.select("#team_builder_button")
            .classed("active", true);
    }

    switch_tabs(name) {
        if(name === this.current_view)
            return
        d3.selectAll(".lef_table")
            .classed("hidden", true);
        d3.selectAll("#view_switcher .tablinks")
            .classed("active", false);

        if (name === "vs" && this.current_view !== "vs") {
            d3.select("#vs_button")
                .classed("active", true);
            d3.select("#vs_table")
                .classed("hidden", false);
            d3.select("#matchup_summary")
                .classed("hidden", false);
            this.current_view = "vs"
        }
        else if (name === "team" && this.current_view !== "team") {
            d3.select("#team_builder_button")
                .classed("active", true);
            d3.select("#team_build_table")
                .classed("hidden", false);
            d3.select("#team_summary")
                .classed("hidden", false);
            this.current_view = "team"
        }

    }

    fill_dropdowns() {
        let that = this;
        for (let j = 0; j < this.num_vs; j++) {
            let pane = d3.select("#vs_" + j);

            $("#vs_dd_"+j).select2().on("select2:select", function(evt) {
                let mon = d3.select(evt.params.data.element).datum();
                // that.card_manager.vs[j] = mon.long_id
                // that.draw_card(mon.long_id, "#vs_svg_" + j);
                that.card_manager.update_vs(j, mon.long_id)
            });

            pane.select("select")
                .selectAll("option").data(this.mons).join("option")
                .property("selected", d=>d.long_id === this.card_manager.vs[j])
                .attr("value", d=>d.long_id)
                .text( d => (d.long_id === "whodat")?"(No Selection)":(d.name + " (#" + d.long_id + ")"));

            pane.append("svg")
                .attr("id", "vs_svg_" + j)
                .attr("width", 430)
                .attr("height", 225)

        }
        for (let j = 0; j < this.num_team; j++) {
            let pane = d3.select("#tb_" + j);

            $("#tb_dd_"+j).select2().on("select2:select", function(evt) {
                let mon = d3.select(evt.params.data.element).datum();
                // that.card_manager.team[j] = mon.long_id;
                // that.draw_card(mon.long_id, "#tb_svg_" + j);

                that.card_manager.update_team(j, mon.long_id)
            });

            pane.select("select").selectAll("option").data(this.mons).join("option")
                .property("selected", d=>d.long_id === this.card_manager.team[j])
                .attr("value", d=>d.long_id)
                .text(d => (d.long_id === "whodat")?"(No Selection)":(d.name + " (#" + d.long_id + ")"));

            pane.append("svg")
                .attr("id", "tb_svg_" + j)
                .attr("width", 430)
                .attr("height", 225)
        }
    }

    initialize_cards() {
        for (let j = 0; j<this.num_vs; j++) {
            let mon = this.poke_dict[this.card_manager.vs[j]];
            this.draw_card(this.card_manager.vs[j], "#vs_svg_" + j);
            $("#vs_dd_"+j).val(mon.long_id)
                .trigger("change");
        }
        for (let j = 0; j<this.num_team; j++) {
            let mon = this.poke_dict[this.card_manager.team[j]];
            this.draw_card(this.card_manager.team[j], "#tb_svg_" + j);
            $("#tb_dd_"+j).val(mon.long_id)
                .trigger("change");
        }
    }

    update_card(cat, pos, mon_id) {
        let dd_id = ((cat==="vs")?"#vs_dd_":"#tb_dd_") + pos;
        let svg_id = ((cat==="vs")?"#vs_svg_":"#tb_svg_") + pos;

        console.log(svg_id);

        $(dd_id).val(mon_id).trigger("change");
        this.draw_card(mon_id, svg_id);
    }

    draw_card(id, svg_id) {

        let stat_labels = ["hp","atk","def","s.a.", "s.d.", "spd"];
        d3.select(svg_id).select("g").remove();
        let pallet = d3.select(svg_id).append("g");
        let mon;
        if (id === "whodat"){
            mon = missingno;
        } else{
            mon = this.poke_dict[id];
        }
        pallet.append("rect")
            .attr("x", 5)
            .attr("y", 5)
            .attr("height", 220)
            .attr("width", 420)
            .attr("rx", 10)
            .attr("fill", this.type_colors[mon.type1][0]);

        pallet.append("circle")
            .attr("cx", 60)
            .attr("cy", 60)
            .attr("r", 50)
            .attr("fill", this.type_colors[mon.type1][1]);

        pallet.append("image")
            .attr("href","data/pokemon_data/sprites/" + mon.long_id + ".png")
            .attr("x", 10)
            .attr("y", 10)
            .attr("height", 100)
            .attr("width", 100);

        let bar_group = pallet.append("g")
            .attr("transform", "translate(120,10)");

        bar_group.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 295)
            .attr("height", 130)
            .attr('rx', 10)
            .attr("fill", "#fff8d6")
            .attr("stroke", this.type_colors[mon.type1][1])
            .attr("stroke-width", "3pt");

        let chart_group = bar_group.append("g")
            .attr("transform", "translate(10, 7)");

        chart_group.selectAll("rect").data([mon.hp, mon.attack, mon.defense, mon.sp_attack, mon.sp_defense, mon.speed])
            .join("rect")
            .attr("x", 20)
            .attr("y", (d,i) => 17*i)
            .attr("width", d => d)
            .attr("height", 13)
            .attr("fill", (d,i) => this.stat_bar_colors[i]);

        chart_group.append("g")
            .selectAll("text").data([mon.hp, mon.attack, mon.defense, mon.sp_attack, mon.sp_defense, mon.speed]).join("text")
            .text(d => d)
            .attr("x", 23)
            .attr("y", (d,i)=>12 + 17*i);

        chart_group.append("g")
            .selectAll("text").data(stat_labels).join("text")
            .text(d=>d)
            .attr("x", 17)
            .attr("y", (d,i) => 12 + 17*i)
            .attr("text-anchor", "end");
        chart_group.append("g")
            .attr("transform", "translate(20,0)")
            .call(this.stat_axis).call(g=>g.select(".domain").remove());
        chart_group.append("text")
            .attr("x", 0)
            .attr("y", 135)
            .style("font-weight", "bold")
            .style("font-size", "12px")
            .text("TOTAL STATS: " + mon.stat_total);

        let info_group = pallet.append("g")
            .attr("transform", "translate(10, 120)");

        info_group.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text("Type:");
        info_group.append("text")
            .attr("x", 0)
            .attr("y", 13)
            .text(((mon.type2 !== '') && (mon.type1 !== mon.type2) ?mon.type1 +' & '+ mon.type2 :mon.type1))
            .style("font-size", "11pt");


        info_group.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .text("height:")
            .style("font-size", "10pt");

        info_group.append("text")
            .attr("x", 10)
            .attr("y", 54)
            .text((mon.height_m ? mon.height_m : "???") + " m")
            .style("font-size", "10pt");

        info_group.append("text")
            .attr("x", 0)
            .attr("y", 72)
            .text("weight:")
            .style("font-size", "10pt");

        info_group.append("text")
            .attr("x", 10)
            .attr("y", 86)
            .text((mon.weight_kg ? mon.weight_kg : "???") + " kg")
            .style("font-size", "10pt");

        let prev_ev = mon.ev_from;
        let next_evs = mon.ev_to;

        let [vs_or_tb, _, card_id] = svg_id.split('_');

        if (prev_ev) {
            let prev_group = pallet.append("g")
                .attr("transform", "translate(130, 165)");

            prev_group.append("text")
                .text("Evolves From:")
                .style("font-size", "8pt")
                .style("text-anchor", "middle")
                .attr("x", 10)
                .attr("y", 0);

            prev_group.append("circle")
                .attr("cx", 10)
                .attr("cy", 25)
                .attr("r", 20)
                .attr("fill", this.type_colors[mon.type1][1]);


            prev_group.append("image")
                .attr("href", "data/pokemon_data/sprites/" + prev_ev + ".png")
                .attr("x", -10)
                .attr("y", 7)
                .attr("width", 40)
                .attr("height", 40)
                .style("cursor", "pointer")
                .on("click", () => this.card_manager.update_pokemon(vs_or_tb, +card_id, prev_ev));

            prev_group.append("text")
                .text(this.poke_dict[prev_ev].name)
                .attr("x", 10)
                .attr("y", 52)
                .style("text-anchor", "middle")
                .style("font-size", "8pt")
        }

        if (next_evs.length > 0) {
            let next_group = pallet.append("g")
                .attr("transform", "translate(400, 165)");

            next_group.append("text")
                .text("Evolves To:")
                .style("text-anchor", "end")
                .style("font-size", "8pt")
                .attr("x", id==="133"?-140:20)
                .attr("y", 0);

            let groups = next_group.selectAll("g").data(next_evs).join("g")
                .attr("transform", (d,i) => "translate(" +( -20 + i*-45 )+ ", 10)")

            groups.append("circle")
                .attr("cx", 20)
                .attr("cy", 15)
                .attr("r", 20)
                .attr("fill", this.type_colors[mon.type1][1]);
            let that=this;
            groups.append("image")
                .attr("href", d => "data/pokemon_data/sprites/" + d + ".png")
                .attr("x", 0)
                .attr("y", -3)
                .attr("height", 40)
                .attr("width", 40)
                .style("cursor", "pointer")
                .each( function(d){
                    d3.select(this)
                        .on("click", () => that.card_manager.update_pokemon(vs_or_tb, +card_id, d))
                });

            groups.append("text")
                .text(d=> this.poke_dict[d].name)
                .attr("x", 20)
                .attr("y", 42)
                .style("text-anchor", "middle")
                .style("font-size", "8pt")
        }
    }

    initialize_summaries() {

        d3.select("#matchup_summary").append("svg")
            .attr("height", 500)
            .attr("width", 900)
            .attr("id", "vs_sum_svg");

        d3.select("#team_summary").append("svg")
            .attr("height", 500)
            .attr("width", 900)
            .attr("id", "tb_sum_svg");

        this.draw_vs_summary();

        this.draw_team_summary();
    }


    update_summary(category) {
        if (category === "vs") {
            this.draw_vs_summary();
        } else {
            this.draw_team_summary();
        }

    }

    draw_vs_summary() {

        let mons =[];
        for(let i =0; i < 2; i++) {
            if(this.card_manager.vs[i] !== null && this.card_manager.vs[i] !== "whodat") {
                mons.push(this.poke_dict[this.card_manager.vs[i]])
            }
        }

        d3.select("#vs_sum_svg").select("g").remove();
        let pallet = d3.select("#vs_sum_svg").append("g");

        let background = pallet.append("g").attr("transform", "translate(5,5)");

        if(mons.length === 2) {
            background.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 890)
                .attr("height", 320)
                .attr("fill", "#b7b7b7")
                .attr("rx", 10);
            background.append("text")
                .attr("x", 445)
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .text("MATCHUP SUMMARY")
                .style("font-weight", "bold")
                .style("font-size", "14pt")
                .style("text-decoration", "underline");

            let pow_pow = 90;
            let lvl = 50;

            let left_hp = hp_stat(mons[0], lvl);
            let right_hp = hp_stat(mons[1], lvl);



            let left_ph_damage = damage(mons[1],mons[0],false, lvl, pow_pow);
            let left_sp_damage = damage(mons[1],mons[0],true, lvl, pow_pow);
            let right_ph_damage = damage(mons[0],mons[1],false, lvl, pow_pow);
            let right_sp_damage = damage(mons[0],mons[1],true, lvl, pow_pow);

            let left_ph_perc = Math.max((left_hp - left_ph_damage)/left_hp,0);
            let left_sp_perc = Math.max((left_hp - left_sp_damage)/left_hp,0);
            let right_ph_perc = Math.max((right_hp - right_ph_damage)/right_hp,0);
            let right_sp_perc = Math.max((right_hp - right_sp_damage)/right_hp,0);

            let left_turns_to_faint = Math.min(Math.ceil(1/(1-left_ph_perc)), Math.ceil(1/(1-left_sp_perc)));
            let right_turns_to_faint = Math.min(Math.ceil(1/(1-right_ph_perc)),Math.ceil(1/(1-right_sp_perc)));

            let left_pref = (right_ph_perc > right_sp_perc)?"special":"physical";
            let right_pref = (left_ph_perc > left_sp_perc)?"special":"physical";

            let hp_bar_group = background.append("g").attr("transform", "translate(445, 60)");

            hp_bar_group.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 110)
                .style("stroke", "gray").style("stroke-width", 3);

            this.draw_hp_bar(hp_bar_group, left_ph_perc, -400, 10, true, mons[0]);
            this.draw_hp_bar(hp_bar_group, left_sp_perc, -400, 80, false,mons[0]);
            this.draw_hp_bar(hp_bar_group, right_ph_perc, 100, 10, true, mons[1]);
            this.draw_hp_bar(hp_bar_group, right_sp_perc, 100, 80, false,mons[1]);

            this.draw_speed_arrow(hp_bar_group, mons[0], mons[1], 0, 50);

            let winner_group = background.append("g").attr("transform", "translate(250, 200)");

            this.draw_winner(winner_group, left_turns_to_faint, right_turns_to_faint, left_pref, right_pref)

        } else {
            background.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 890)
                .attr("height", 40)
                .attr("fill", "#b7b7b7")
                .attr("rx", 10);
            background.append("text")
                .attr("x", 445)
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .text("PLEASE SELECT 2 POKEMON TO COMPARE")
                .style("font-weight", "bold")
                .style("font-size", "14pt")
                .style("text-decoration", "underline");
        }
    }

    draw_winner(group, left_to_faint, right_to_faint, lpref, rpref) {
        let left = this.poke_dict[this.card_manager.vs[0]];
        let right = this.poke_dict[this.card_manager.vs[1]];
        let winner, turns_to_end, strat;
        if(left_to_faint > right_to_faint) {
            winner = left;
            turns_to_end = right_to_faint;
            strat = lpref;
        } else if (right_to_faint > left_to_faint) {
            winner = right;
            turns_to_end = left_to_faint;
            strat = rpref;
        } else {
            if(left.speed > right.speed) {
                winner = left;
                turns_to_end = right_to_faint;
                strat = lpref;
            } else if (right.speed > left.speed) {
                winner = right;
                turns_to_end = left_to_faint;
                strat = rpref;
            }
            else {
                winner = missingno;
                turns_to_end = 0;
            }
        }
        group.append("circle").attr("cx", 50).attr("cy", 50).attr("r", 45)
            .attr("fill", "#7f7f7f");
        group.append("image").attr("x", 5).attr("y", 5).attr("width", 90).attr("height", 90)
            .attr("href", "data/pokemon_data/sprites/" + winner.long_id + ".png");
        group.append("text").attr("x", 100).attr("y", 40)
            .text((winner.stat_total > 0?(winner.name + " will win in " + turns_to_end + " turn" + (turns_to_end>1?"s":"") + " using " + strat + " moves."):"It's too close to call!"))

    }

    draw_speed_arrow(group, left, right, x, y) {
        if(left.speed > right.speed) {
            group.append("g").attr("transform", "translate("+(x+10)+","+y+")").append("path")
                .attr("fill", "#fff240")
                .attr("d",`
                M 0 -15
                L -15 -15
                L -15 -30
                L -45 0
                L -15 30
                L -15 15
                L 15 15
                L 15 -15
                Z
                `);
            group.append("text").attr("x", x-4).attr("y", y+2)
                .style("font-weight", "bold")
                .style("text-anchor", "middle")
                .style("font-size", "7pt")
                .text("GOES FIRST")
        } else if (right.speed > left.speed) {
            group.append("g").attr("transform", "translate("+(x - 10)+","+y+")").append("path")
                .attr("fill", "#fff240")
                .attr("d",`
                M 0 15
                L 15 15
                L 15 30
                L 45 0
                L 15 -30
                L 15 -15
                L -15 -15
                L -15 15
                Z
                `);
            group.append("text").attr("x", x+4).attr("y", y+2)
                .style("font-weight", "bold")
                .style("text-anchor", "middle")
                .style("font-size", "7pt")
                .text("GOES FIRST")
        } else {
            group.append("rect").attr("x", x-30).attr("y", y-20).attr("width", 60).attr("height", 35)
                .attr("fill", "#fff240");
            group.append("text").attr("x", x).attr("y", y)
                .style("font-weight", "bold")
                .style("text-anchor", "middle")
                .style("font-size", "7pt")
                .text("SPEED TIE")
        }
    }

    draw_hp_bar(group, percentage, x, y, is_phys, mon) {
        let base = group.append("g").attr("transform", "translate(" + x +","+y+")");
        base.append("rect").attr("x", 0).attr("y", 0).attr("width", 300).attr("height", 20)
            .attr("stroke", "black").attr("stroke-width", 3).attr("fill", "#ffffff");
        base.append("rect").attr("x", 0).attr("y", 0).attr("width", this.hp_bar_scale(percentage)).attr("height", 20)
            .attr("fill", "#11a100");
        base.append("rect").attr("x", this.hp_bar_scale(percentage)).attr("y", 0).attr("width", this.hp_bar_scale(1-percentage)).attr("height", 20)
            .attr("fill", "#dd0001");
        base.append("text").attr("x", -6).attr("y", -8)
            .text("HP after " + (is_phys?"physical":"special") + " attack:")
        base.append("text").attr("x", 8).attr("y", 15)
            .text("" + Math.floor(percentage*100) + "%")

    }

    draw_team_summary() {
        let mons = [];
        for(let i =0; i < 6; i++) {
            if(this.card_manager.team[i] !== "whodat" && this.card_manager.team[i] !== null) {
                mons.push(this.poke_dict[this.card_manager.team[i]])
            }
        }

        let type_coverage_data = get_type_coverage(mons);

        console.log(mons);

        d3.select("#tb_sum_svg").select("g").remove();
        let pallet = d3.select("#tb_sum_svg").append("g");

        let background = pallet.append("g").attr("transform", "translate(5,5)");
        background.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 890)
            .attr("height", 500)
            .attr("fill", "#b7b7b7")
            .attr("rx", 10);
        background.append("text")
            .attr("x", 445)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("TEAM SUMMARY")
            .style("font-weight", "bold")
            .style("font-size", "14pt")
            .style("text-decoration", "underline");
        let chart_group = background.append("g").attr("transform", "translate(500, 40)");
        chart_group.append("rect").attr("x",0).attr("y",0).attr("width",380).attr("height", 400)
            .attr("rx", 10)
            .attr("fill", "#f1fce9").attr("stroke", "#353535").attr("stroke-width", "3px");
        chart_group.append("g").attr("transform","translate(370, 390)")
            .call(this.reverse_stat_axis).call(g=>g.select(".domain").remove());
        let mark_group = chart_group.append("g").attr("transform", "translate(45,390)");

        mark_group.append("line").attr("x1", -14).attr("y1", this.reverse_stat_scale(70)).attr("x2", 330).attr("y2", this.reverse_stat_scale(70))
            .style("stroke-dasharray", "2 1")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("opacity", 1)
            .append("title")
            .text("Rough average across all evolved Pokemon");
        mark_group.append("text").attr("x", -16).attr("y", this.reverse_stat_scale(70)+2)
            .style("text-anchor", "end")
            .style("font-size", "7pt")
            .style("opacity", .8)
            .text("(norm.)")
            .append("title")
            .text("Rough average across all evolved Pokemon");

        let mon_groups = mark_group.selectAll("g").data(mons).join("g");

        mon_groups.selectAll("line").data((d,i) => [
            {name:d.name,stat:d.hp,         stat2:d.attack,         type:d.type1, index: i},
            {name:d.name,stat:d.attack,     stat2:d.defense,     type:d.type1, index: i},
            {name:d.name,stat:d.defense,    stat2:d.sp_attack,    type:d.type1, index: i},
            {name:d.name,stat:d.sp_attack,  stat2:d.sp_defense,  type:d.type1, index: i},
            {name:d.name,stat:d.sp_defense, stat2:d.speed, type:d.type1, index: i},
            {name:d.name,stat:d.speed,      stat2:d.speed,      type:d.type1, index: i}
        ]).join("line")
            .attr("class" , d=> "l_" + d.index)
            .style("opacity", 0)
            .attr("x1", (d,i) => 60*i)
            .attr("x2", (d,i) => 60*Math.min(i+1, 5))
            .attr("y1", d=> this.reverse_stat_scale(d.stat))
            .attr("y2", d=> this.reverse_stat_scale(d.stat2))
            .attr("stroke", "#000000")
            .attr("stroke-width", 2);

        mon_groups.selectAll("ellipse").data((d,i)=>[
            {name:d.name,stat:d.hp,type:d.type1, index: i},
            {name:d.name,stat:d.attack,type:d.type1, index: i},
            {name:d.name,stat:d.defense,type:d.type1, index: i},
            {name:d.name,stat:d.sp_attack,type:d.type1, index: i},
            {name:d.name,stat:d.sp_defense,type:d.type1, index: i},
            {name:d.name,stat:d.speed,type:d.type1, index: i}
            ]).join("ellipse")
                .attr("cx", (d,i) => 60*i)
                .attr("cy", d => this.reverse_stat_scale(d.stat))
                .attr("rx", 6)
                .attr("ry", 3)
                .attr("id", d=>"e_" + d.index)
                .attr("fill", d => this.type_colors[d.type][0])
                .attr("stroke", d => this.type_colors[d.type][1])
                .attr("stroke-width", 1)
                .style("opacity", 1)
                .attr("cursor", "pointer")
                .on("mouseover", d => {d3.selectAll(".l_" + d.index).style("opacity", 1)})
                .on("mouseout", d => {d3.selectAll(".l_" + d.index).style("opacity", 0)})
                .append("title")
                    .text(d=>d.name + ", " + d.stat);

        let label_group = chart_group.append("g").attr("transform","translate(45, 400)")
        label_group.selectAll("text").data(["HP","Attack","Defense","S. Attack", "S. Defense", "Speed"]).join("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform",(d,i) => "translate("+(60*i) + ",10) rotate(-35)")
            .text(d=>d)
            .style("font-weight", "bold")
            .style("text-anchor", "end");

        chart_group.append("text").attr("x", 370).attr("y", 32)
            .style("font-weight", "bold")
            .style("font-size", "14pt")
            .style("text-anchor", "end")
            .text("Stat Distributions");

        let coverage_group = background.append("g").attr("transform","translate(20, 40)")
        let covered_group = coverage_group.append("g");
        let uncovered_group = coverage_group.append("g").attr("transform", "translate(0,140)");
        let weakness_group = coverage_group.append("g").attr("transform", "translate(0, 280)");

        covered_group.append("rect").attr("x", 0).attr("y", 0).attr("width", 450).attr("height", 120)
            .attr("rx", 10)
            .attr("fill", "#b7b7b7")
            .attr("stroke", "#353535")
            .attr("stroke-width", "2px");

        covered_group.selectAll("image").data(type_coverage_data.covered).join("image")
            .attr("x", (d,i) => 10 + 70 * (i%6))
            .attr("y", (d,i) => 30 + (30*Math.floor(i/6)))
            .attr("width", 80)
            .attr("height", 20)
            .attr("href", d => "data/pokemon_data/typelabels/" + d + ".gif");

        covered_group.append("text").attr("x", 15).attr("y", 17)
            .style("font-weight", "bold")
            .style("font-size", "14pt")
            .text("Types Covered:");

        uncovered_group.append("rect").attr("x", 0).attr("y", 0).attr("width", 450).attr("height", 120)
            .attr("rx", 10)
            .attr("fill", "#b7b7b7")
            .attr("stroke", "#353535")
            .attr("stroke-width", "2px");

        uncovered_group.selectAll("image").data(type_coverage_data.uncovered).join("image")
            .attr("x", (d,i) => 10 + 70 * (i%6))
            .attr("y", (d,i) => 30 + (30*Math.floor(i/6)))
            .attr("width", 80)
            .attr("height", 20)
            .attr("href", d => "data/pokemon_data/typelabels/" + d + ".gif");

        uncovered_group.append("text").attr("x", 15).attr("y", 17)
            .style("font-weight", "bold")
            .style("font-size", "14pt")
            .text("Types Not Yet Covered:");

        weakness_group.append("rect").attr("x", 0).attr("y", 0).attr("width", 450).attr("height", 120)
            .attr("rx", 10)
            .attr("fill", "#b7b7b7")
            .attr("stroke", "#353535")
            .attr("stroke-width", "2px");

        weakness_group.selectAll("image").data(type_coverage_data.weak_to).join("image")
            .attr("x", (d,i) => 10 + 70 * (i%6))
            .attr("y", (d,i) => 30 + (30*Math.floor(i/6)))
            .attr("width", 80)
            .attr("height", 20)
            .attr("href", d => "data/pokemon_data/typelabels/" + d + ".gif");

        weakness_group.append("text").attr("x", 15).attr("y", 17)
            .style("font-weight", "bold")
            .style("font-size", "14pt")
            .text("Types Strong Against This Team:");

    }


}


function get_type_coverage(mons) {
    if(mons.length === 0) {
        return {covered: [], uncovered:[], weak_to: []}
    }
    let covered = [], uncovered = [], weak_to = []
    for(let type of idx_to_types) {
        if (team_can_cover(mons, type))
            covered.push(type);
        if (team_weak_to(mons, type))
            weak_to.push(type);
    }
    for (let type of idx_to_types) {
        if (! covered.includes(type)) {
            uncovered.push(type)
        }
    }
    return {covered: covered, uncovered: uncovered, weak_to: weak_to}
}

function team_weak_to(mons, type) {
    let total = 0;
    for (let mon of mons) {
        if (is_weak_to(mon, type)) {
            total += 1
        }
    }
    if (total / mons.length > 1/3) {
        return true;
    }
}

function team_can_cover(mons, type) {
    for (let mon of mons) {
        if(can_cover(mon, type))
            return true
    }
    return false
}

function is_weak_to(mon, type) {
    let idx1 = types_to_idx[mon.type1];
    let atkidx = types_to_idx[type];
    if(mon.type2 !== '' && mon.type2 !== mon.type1) {
        let idx2 = types_to_idx[mon.type2];
        return matchups[atkidx][idx1] * matchups[atkidx][idx2] > 1
    } else {
        return matchups[atkidx][idx1] > 1
    }
}

function can_cover(mon, type) {
    let idx1 = types_to_idx[mon.type1];
    let defidx = types_to_idx[type];
    if(mon.type2 !== '' && mon.type2 !== mon.type1) {
        let idx2 = types_to_idx[mon.type2];
        return Math.max(matchups[idx1][defidx] , matchups[idx2][defidx]) > 1
    } else {
        return matchups[idx1][defidx] > 1
    }
}

function hp_stat(mon, level) {
    console.log(mon);
    return Math.floor((2*mon.hp + 15)*level/100) + level + 10
}

function damage(attack_mon, receive_mon, is_special, level, power) {

    let topleft = 2*level/5 + 2;
    let ratio = a_d_ratio(attack_mon, receive_mon, is_special, level);
    let modifier = type_modifier(attack_mon, receive_mon);
    return Math.floor((Math.floor(topleft*power*ratio/50) + 2)*modifier)


}

function a_d_ratio(attacker, defender, spec, lvl) {
    let attack, defense;
    if(spec) {
        attack = stat(attacker.sp_attack, lvl);
        defense = stat(defender.sp_defense, lvl);
    } else {
        attack = stat(attacker.attack, lvl);
        defense = stat(defender.defense, lvl);
    }
    return attack / defense;
}

function stat(base, level=50) {
    return (2*base+15)*level/100 + 5
}

function type_modifier(attacker, defender) {
    let atk_1 = types_to_idx[attacker.type1];
    let def_1 = types_to_idx[defender.type1];

    if(attacker.type2 !== '' && attacker.type2 !== attacker.type1) {
        let atk_2 = types_to_idx[attacker.type2];

        if(defender.type2 !== '' && defender.type2 !== defender.type1) {
            let def_2 = types_to_idx[defender.type2];
            return Math.max(
                matchups[atk_1][def_1]*matchups[atk_1][def_2],
                matchups[atk_2][def_1]*matchups[atk_2][def_2]
            )
        } else {
            return Math.max(
                matchups[atk_1][def_1],
                matchups[atk_2][def_1]
            )
        }
    } else {
        if(defender.type2 !== '' && defender.type2 !== defender.type1) {
            let def_2 = types_to_idx[defender.type2];
            return matchups[atk_1][def_1]*matchups[atk_1][def_2]
        } else {
            return matchups[atk_1][def_1]
        }
    }
}


let types_to_idx = {
    "normal":0,
    "fire":1,
    "water":2,
    "grass":3,
    "electric":4,
    "ice":5,
    "fighting":6,
    "poison":7,
    "ground":8,
    "flying":9,
    "psychic":10,
    "bug":11,
    "rock":12,
    "ghost":13,
    "dragon":14,
    "dark":15,
    "steel":16,
    "fairy":17
};

let idx_to_types = [
    "normal",
    "fire",
    "water",
    "grass",
    "electric",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy"
];

let matchups = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, .5, 0, 1, 1, .5, 1],
    [1, .5, .5, 2, 1, 2, 1, 1, 1, 1, 1, 2, .5, 1, .5, 1, 2, 1],
    [1, 2, .5, .5, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, .5, 1, 1, 1],
    [1, .5, 2, .5, 1, 1, 1, .5, 2, .5, 1, .5, 2, 1, .5, 1, .5, 1],
    [1, 1, 2, .5, .5, 1, 1, 1, 0, 2, 1, 1, 1, 1, .5, 1, 1, 1],
    [1, .5, .5, 2, 1, .5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, .5, 1],
    [2, 1, 1, 1, 1, 2, 1, .5, 1, .5, .5, .5, 2, 0, 1, 2, 2, .5],
    [1, 1, 1, 2, 1, 1, 1, .5, .5, 1, 1, 1, .5, .5, 1, 1, 0, 2],
    [1, 2, 1, .5, 2, 1, 1, 2, 1, 0, 1, .5, 2, 1, 1, 1, 2, 1],
    [1, 1, 1, 2, .5, 1, 2, 1, 1, 1, 1, 2, .5, 1, 1, 1, .5, 1],
    [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, .5, 1, 1, 1, 1, 0, .5, 1],
    [1, .5, 1, 2, 1, 1, .5, .5, 1, .5, 2, 1, 1, .5, 1, 2, .5, .5],
    [1, 2, 1, 1, 1, 2, .5, 1, .5, 2, 1, 2, 1, 1, 1, 1, .5, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, .5, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, .5, 0],
    [1, 1, 1, 1, 1, 1, .5, 1, 1, 1, 2, 1, 1, 2, 1, .5, 1, .5],
    [1, .5, .5, 1, .5, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, .5, 2],
    [1, .5, 1, 1, 1, 1, 2, .5, 1, 1, 1, 1, 1, 1, 2, 2, .5, 1]
];

let missingno = {
                name: "(no selection)",
                type1 : "missing",
                type2 : "",
                long_id : "whodat",
                hp: 0,
                attack: 0,
                defense: 0,
                sp_attack: 0,
                sp_defense: 0,
                speed: 0,
                stat_total: 0,
                height_m: "?",
                weight_kg: "?",
                ev_from : "",
                ev_to : []
};