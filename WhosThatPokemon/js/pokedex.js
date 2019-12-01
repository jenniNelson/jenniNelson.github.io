

class Pokedex {

    constructor(pokemon, card_manager) {

        this.card_manager = card_manager;

        let that = this;
        function update_checks(){
            that.update_team_checks();
            that.update_pvp_checks();
        }
        this.card_manager.add_callback(update_checks);


        this.pokemon = Object.values(pokemon).sort( (a,b) => +a.long_id - +b.long_id );

        // this.p_v_p = {
        //     0: null,
        //     1: null,
        //     queue: []
        // };
        // this.team = {
        //     0: null,
        //     1: null,
        //     2: null,
        //     3: null,
        //     4: null,
        //     5: null,
        //     queue: []
        // };

        this.createTable()


    }


    // update_checkboxes(classname, list_to_check){
    //     d3.selectAll("input."+classname).each(function() {
    //         if(d3.select(this).datum in list_to_check) {
    //             d3.select(this).property("checked", true)
    //         }else{
    //             d3.select(this).property("checked", null)
    //         }
    //     });
    //
    // }



    update_pvp_checks(){
        // d3.selectAll("input.pvp_checkbox").each(function() {
        //     d3.select(this).property("checked", false)
        // });
        // if (this.card_manager.vs[0] != null){
        //     d3.select("#pvp_"+this.card_manager.vs[0]).property("checked", true)
        // }
        // if (this.card_manager.vs[1] != null){
        //     d3.select("#pvp_"+this.card_manager.vs[1]).property("checked", true)
        // }

        d3.selectAll("input.pvp_checkbox").each(function() {
            d3.select(this).property("checked", false)
        });

        for (let i of [0,1]){
            if (this.card_manager.vs[i] != null){
                d3.select("#pvp_"+this.card_manager.vs[i]).property("checked", true)
            }
        }
    }

    p_v_p_change(d,i){


        let chkbx = d3.select("#pvp_"+d.long_id)

        console.log("PVP Checked/unchecked: ", d,i, this, chkbx)

        let is_checked = chkbx.property('checked')

        this.card_manager.update_vs(null, d.long_id, is_checked)

        // console.log(is_checked)
        //
        // if(is_checked){
        //
        //     if (this.p_v_p[0] == null){
        //         this.p_v_p[0] = d.long_id;
        //         this.p_v_p.queue.push(0);
        //     } else if (this.p_v_p[1] == null){
        //         this.p_v_p[1] = d.long_id;
        //         this.p_v_p.queue.push(1);
        //     } else{
        //         let one_to_displace = this.p_v_p.queue.shift();
        //         one_to_displace = one_to_displace === undefined ? 0 : one_to_displace;
        //         this.p_v_p[one_to_displace] = d.long_id;
        //         this.p_v_p.queue.push(one_to_displace);
        //     }
        //
        //
        // } else {
        //     if(this.p_v_p[0] === d.long_id){
        //         this.p_v_p[0] = null;
        //         // Remove from queue
        //         let index = this.p_v_p.queue.indexOf(0);
        //         if (index > -1) {
        //           this.p_v_p.queue.splice(index, 1);
        //         }
        //     } else if(this.p_v_p[1] === d.long_id){
        //         this.p_v_p[1] = null;
        //         // Remove from queue
        //         let index = this.p_v_p.queue.indexOf(1);
        //         if (index > -1) {
        //           this.p_v_p.queue.splice(index, 1);
        //         }
        //     } else{
        //         console.log("A pokemon was unselected but never selected. This is kindof a problem?")
        //     }
        //
        // }
        //
        // console.log(this.p_v_p)
        this.update_pvp_checks()


    }

    update_team_checks(){
        d3.selectAll("input.teambuilder_checkbox").each(function() {
            d3.select(this).property("checked", false)
        });

        for (let i of [0,1,2,3,4,5]){
            if (this.card_manager.team[i] != null){
                d3.select("#team_"+this.card_manager.team[i]).property("checked", true)
            }
        }
    }

    teambuilder_change(d,i){

        let chkbx = d3.select("#team_"+d.long_id)

        console.log("Team Checked/unchecked: ", d,i, this, chkbx)

        let is_checked = chkbx.property('checked')

        this.card_manager.update_team(null, d.long_id, is_checked)

        // console.log(is_checked)
        //
        // if(is_checked){
        //
        //     // if (this.p_v_p[0] == null){
        //     //     this.p_v_p[0] = d.long_id;
        //     //     this.p_v_p.queue.push(0);
        //     // } else if (this.p_v_p[1] == null){
        //     //     this.p_v_p[1] = d.long_id;
        //     //     this.p_v_p.queue.push(1);
        //     // } else{
        //     //     let one_to_displace = this.p_v_p.queue.shift();
        //     //     one_to_displace = one_to_displace === undefined ? 0 : one_to_displace;
        //     //     this.p_v_p[one_to_displace] = d.long_id;
        //     //     this.p_v_p.queue.push(one_to_displace);
        //     // }
        //
        //     let none_free = true;
        //     for (let i of [0,1,2,3,4,5]){
        //         if (this.team[i] == null) {
        //             this.team[i] = d.long_id;
        //             this.team.queue.push(i);
        //             none_free = false;
        //             break;
        //         }
        //     }
        //     if (none_free){
        //         let one_to_displace = this.team.queue.shift();
        //         one_to_displace = one_to_displace === undefined ? 0 : one_to_displace;
        //         this.team[one_to_displace] = d.long_id;
        //         this.team.queue.push(one_to_displace);
        //     }
        //
        //
        // } else {
        //     // if(this.p_v_p[0] === d.long_id){
        //     //     this.p_v_p[0] = null;
        //     //     // Remove from queue
        //     //     let index = this.p_v_p.queue.indexOf(0);
        //     //     if (index > -1) {
        //     //       this.p_v_p.queue.splice(index, 1);
        //     //     }
        //     // } else if(this.p_v_p[1] === d.long_id){
        //     //     this.p_v_p[1] = null;
        //     //     // Remove from queue
        //     //     let index = this.p_v_p.queue.indexOf(1);
        //     //     if (index > -1) {
        //     //       this.p_v_p.queue.splice(index, 1);
        //     //     }
        //     // } else{
        //     //     console.log("A pokemon was unselected but never selected. This is kindof a problem?")
        //     // }
        //
        //     for (let i of [0,1,2,3,4,5]){
        //         if(this.team[i] === d.long_id){
        //             this.team[i] = null;
        //             // Remove from queue
        //             let index = this.team.queue.indexOf(i);
        //             if (index > -1) {
        //               this.team.queue.splice(index, 1);
        //             }
        //             break;
        //         }
        //     }
        //
        //
        // }
        // console.log(this.team)
        this.update_team_checks();
    }



    createTable() {

        let table = d3.select("#pokedex")
        let header_row = table.append("thead")
            .append("tr")
        let table_body = table.append("tbody")
        let rows = table_body.selectAll("tr").data(this.pokemon).join("tr");

        /** Change the order here to change the order in-table **/
        let self = this;
        header_row.append("th").text("PvP");
        rows.append("td").append("input")
            .attr("type", "checkbox")
            .attr("id", p=> "pvp_"+p.long_id)
            .classed("pvp_checkbox", true)
            .on('click', (d,i) => this.p_v_p_change(d,i));

        header_row.append("th").text("Team");
        rows.append("td").append("input")
            .attr("type", "checkbox")
            .attr("id", p=> "team_"+p.long_id)
            .classed("teambuilder_checkbox", true)
            .on('click', (d,i) => this.teambuilder_change(d,i));

        header_row.append("th").text("Dex #");
        rows.append("td").text(p=> p.long_id);

        header_row.append("th").text("Name");
        rows.append("td").text(p=> p.name);

        header_row.append("th").text("Base Total");
        rows.append("td").text(p=> p.stat_total);

        header_row.append("th").text("HP");
        rows.append("td").text(p=> p.hp);

        header_row.append("th").text("Atk");
        rows.append("td").text(p=> p.attack);

        header_row.append("th").text("Def");
        rows.append("td").text(p=> p.defense);

        header_row.append("th").text("Sp.Atk");
        rows.append("td").text(p=> p.sp_attack);

        header_row.append("th").text("Sp.Def");
        rows.append("td").text(p=> p.sp_defense);

        header_row.append("th").text("Spd");
        rows.append("td").text(p=> p.speed);

        header_row.append("th").text("Type 1");
        rows.append("td")
            .attr("align", "center")
            .attr("class", p=> "type_"+p.type1)
            .text(p=> p.type1);

        header_row.append("th").text("Type 2");
        rows.append("td")
            .attr("align", "center")
            .attr("class", p=> "type_"+p.type2)
            .text(p=> p.type2);

        header_row.append("th").text("Capture Rate");
        rows.append("td").text(p=> p.capture_rate);

        header_row.append("th").text("Legendary?");
        rows.append("td").text(p=> p.is_legendary==="1" ? "Yes" : "No");

        header_row.append("th").text("Orig. Gen");
        rows.append("td").text(p=> p.gen_introduced);

        // header_row.append("th").text("Height (m)");
        // rows.append("td").text(p=> p.height_m);

        // rows.on("mouseover", (d,i) => console.log(d));
        // rows.on("mouseout", () => console.log("MOUSEOUT"));


        // Takes care of that nasty sorting business
        sorttable.makeSortable(document.getElementById("pokedex"))


    }



}